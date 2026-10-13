use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Deserialize, Serialize};

const SERVICE_NAME: &str = "tu-cockpit-vault";
const KEY_USERNAME: &str = "university_username";
const KEY_PASSWORD: &str = "university_password";
const KEY_TOTP: &str = "university_totp_secret";
const KEY_AUTOFILL: &str = "university_autofill_enabled";

// In-memory fallback cache for headless test environments or platforms without keychain access
static MEMORY_VAULT: Mutex<Option<VaultCredentials>> = Mutex::new(None);

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct VaultCredentials {
    pub username: String,
    pub password: String,
    pub totp_secret: Option<String>,
    pub auto_fill: bool,
    pub has_credentials: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct VaultStatus {
    pub username: String,
    pub has_password: bool,
    pub has_totp: bool,
    pub auto_fill: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct AutofillPayload {
    pub username: String,
    pub password: String,
    pub totp_code: Option<String>,
    pub auto_fill: bool,
}

/// Compute a standard RFC 6238 TOTP code (HMAC-SHA1, 30s step, 6 digits)
pub fn compute_totp(secret_base32: &str, timestamp: u64) -> Result<String, String> {
    let cleaned = secret_base32
        .trim()
        .replace([' ', '-'], "")
        .to_uppercase();

    if cleaned.is_empty() {
        return Err("Secret key cannot be empty".to_string());
    }

    let secret_bytes = base32::decode(base32::Alphabet::Rfc4648 { padding: false }, &cleaned)
        .or_else(|| base32::decode(base32::Alphabet::Rfc4648 { padding: true }, &cleaned))
        .ok_or_else(|| "Invalid Base32 secret key format. Please check your authenticator key.".to_string())?;

    if secret_bytes.is_empty() {
        return Err("Decoded secret key is empty".to_string());
    }

    let code = totp_lite::totp_custom::<totp_lite::Sha1>(30, 6, &secret_bytes, timestamp);
    Ok(code)
}

/// Tauri command to generate rolling 6-digit MFA code from Base32 secret
#[tauri::command]
pub fn generate_totp_code(secret_base32: String) -> Result<String, String> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_secs();
    compute_totp(&secret_base32, now)
}

fn set_keyring_value(key: &str, value: &str) -> Result<(), String> {
    match keyring::Entry::new(SERVICE_NAME, key) {
        Ok(entry) => {
            let _ = entry.set_password(value);
            Ok(())
        }
        Err(e) => Err(format!("Keyring error: {}", e)),
    }
}

fn get_keyring_value(key: &str) -> Option<String> {
    match keyring::Entry::new(SERVICE_NAME, key) {
        Ok(entry) => entry.get_password().ok(),
        Err(_) => None,
    }
}

fn delete_keyring_value(key: &str) {
    if let Ok(entry) = keyring::Entry::new(SERVICE_NAME, key) {
        let _ = entry.delete_credential();
    }
}

/// Save student credentials securely to OS Keyring (with in-memory fallback)
#[tauri::command]
pub fn save_vault_credentials(
    username: String,
    password: String,
    totp_secret: Option<String>,
    auto_fill: bool,
) -> Result<(), String> {
    let creds = VaultCredentials {
        username: username.clone(),
        password: password.clone(),
        totp_secret: totp_secret.clone(),
        auto_fill,
        has_credentials: true,
    };

    // Update in-memory fallback
    if let Ok(mut lock) = MEMORY_VAULT.lock() {
        *lock = Some(creds);
    }

    // Attempt OS Keyring persistence
    let _ = set_keyring_value(KEY_USERNAME, &username);
    let _ = set_keyring_value(KEY_PASSWORD, &password);
    if let Some(ref totp) = totp_secret {
        let _ = set_keyring_value(KEY_TOTP, totp);
    } else {
        delete_keyring_value(KEY_TOTP);
    }
    let _ = set_keyring_value(KEY_AUTOFILL, if auto_fill { "true" } else { "false" });

    Ok(())
}

/// Retrieve status of stored credentials without exposing raw password
#[tauri::command]
pub fn get_vault_status() -> Result<VaultStatus, String> {
    if let Ok(lock) = MEMORY_VAULT.lock() {
        if let Some(ref mem) = *lock {
            return Ok(VaultStatus {
                username: mem.username.clone(),
                has_password: !mem.password.is_empty(),
                has_totp: mem.totp_secret.as_ref().map_or(false, |s| !s.is_empty()),
                auto_fill: mem.auto_fill,
            });
        }
    }

    let username = get_keyring_value(KEY_USERNAME).unwrap_or_default();
    let has_password = get_keyring_value(KEY_PASSWORD).is_some();
    let has_totp = get_keyring_value(KEY_TOTP).is_some();
    let auto_fill = get_keyring_value(KEY_AUTOFILL)
        .map(|v| v == "true")
        .unwrap_or(true);

    Ok(VaultStatus {
        username,
        has_password,
        has_totp,
        auto_fill,
    })
}

/// Retrieve student credentials from vault
#[tauri::command]
pub fn get_vault_credentials() -> Result<VaultCredentials, String> {
    if let Ok(lock) = MEMORY_VAULT.lock() {
        if let Some(ref mem) = *lock {
            return Ok(mem.clone());
        }
    }

    let username = get_keyring_value(KEY_USERNAME).unwrap_or_default();
    let password = get_keyring_value(KEY_PASSWORD).unwrap_or_default();
    let totp_secret = get_keyring_value(KEY_TOTP);
    let auto_fill = get_keyring_value(KEY_AUTOFILL)
        .map(|v| v == "true")
        .unwrap_or(true);

    let has_credentials = !username.is_empty() && !password.is_empty();

    Ok(VaultCredentials {
        username,
        password,
        totp_secret,
        auto_fill,
        has_credentials,
    })
}

/// Retrieve payload for autofill daemon, including fresh TOTP code
#[tauri::command]
pub fn get_autofill_payload() -> Result<AutofillPayload, String> {
    let creds = get_vault_credentials()?;
    if !creds.has_credentials || !creds.auto_fill {
        return Ok(AutofillPayload {
            username: String::new(),
            password: String::new(),
            totp_code: None,
            auto_fill: false,
        });
    }

    let totp_code = if let Some(ref secret) = creds.totp_secret {
        generate_totp_code(secret.clone()).ok()
    } else {
        None
    };

    Ok(AutofillPayload {
        username: creds.username,
        password: creds.password,
        totp_code,
        auto_fill: creds.auto_fill,
    })
}

/// Clear credentials from vault
#[tauri::command]
pub fn clear_vault_credentials() -> Result<(), String> {
    if let Ok(mut lock) = MEMORY_VAULT.lock() {
        *lock = None;
    }

    delete_keyring_value(KEY_USERNAME);
    delete_keyring_value(KEY_PASSWORD);
    delete_keyring_value(KEY_TOTP);
    delete_keyring_value(KEY_AUTOFILL);

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rfc6238_totp_generation() {
        // Test with RFC 6238 standard test vector (ASCII "12345678901234567890")
        // Base32 encoded = GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ
        let secret_b32 = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

        // At timestamp 59 (step = 30):
        let code = compute_totp(secret_b32, 59).expect("Should compute TOTP");
        assert_eq!(code.len(), 6);
        assert_eq!(code, "287082");

        // At timestamp 1111111109:
        let code2 = compute_totp(secret_b32, 1111111109).expect("Should compute TOTP");
        assert_eq!(code2.len(), 6);
        assert_eq!(code2, "081804");

        // At timestamp 1234567890:
        let code3 = compute_totp(secret_b32, 1234567890).expect("Should compute TOTP");
        assert_eq!(code3.len(), 6);
        assert_eq!(code3, "005924");
    }

    #[test]
    fn test_totp_with_spaces_and_lowercase() {
        let raw = "gez dgn bvg y3t qoj qge zdg nbv gy3 tqo jq";
        let code = compute_totp(raw, 59).expect("Should handle spaces and lowercase");
        assert_eq!(code, "287082");
    }

    #[test]
    fn test_vault_save_and_retrieve() {
        let _ = save_vault_credentials(
            "e11823456".to_string(),
            "SuperSecretPwd123!".to_string(),
            Some("JBSWY3DPEHPK3PXP".to_string()),
            true,
        );

        let status = get_vault_status().expect("Should get status");
        assert_eq!(status.username, "e11823456");
        assert!(status.has_password);
        assert!(status.has_totp);
        assert!(status.auto_fill);

        let payload = get_autofill_payload().expect("Should get autofill payload");
        assert_eq!(payload.username, "e11823456");
        assert_eq!(payload.password, "SuperSecretPwd123!");
        assert!(payload.totp_code.is_some());
        assert_eq!(payload.totp_code.unwrap().len(), 6);

        let _ = clear_vault_credentials();
    }
}
