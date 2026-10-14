use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PortalInfo {
    pub id: String,
    pub name: String,
    pub default_url: String,
    pub current_url: String,
}

pub fn get_default_portal_url(portal_id: &str) -> &'static str {
    match portal_id {
        "tuwel" => "https://tuwel.tuwien.ac.at/login/index.php",
        "tiss" => "https://tiss.tuwien.ac.at",
        "vowi" => "https://vowi.fsinf.at",
        "tumaps" => "https://maps.tuwien.ac.at",
        _ => "https://tuwien.ac.at",
    }
}

#[tauri::command]
pub fn get_portal_url(portal_id: String) -> Result<String, String> {
    Ok(get_default_portal_url(&portal_id).to_string())
}

#[tauri::command]
pub fn navigate_portal(portal_id: String, url: String) -> Result<String, String> {
    // Validate destination domain security
    let allowed_prefixes = [
        "https://tuwel.tuwien.ac.at",
        "https://tiss.tuwien.ac.at",
        "https://vowi.fsinf.at",
        "https://maps.tuwien.ac.at",
        "https://login.tuwien.ac.at",
    ];

    let is_safe = allowed_prefixes.iter().any(|prefix| url.starts_with(prefix));
    if !is_safe {
        return Err(format!(
            "Navigation to external unvetted domain '{}' is blocked inside institutional portal '{}'",
            url, portal_id
        ));
    }

    Ok(url)
}

#[tauri::command]
pub fn reload_portal(_portal_id: String) -> Result<bool, String> {
    Ok(true)
}

#[tauri::command]
pub fn inject_theme_css(_portal_id: String, _css: String) -> Result<bool, String> {
    Ok(true)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_portal_defaults() {
        assert_eq!(get_default_portal_url("tuwel"), "https://tuwel.tuwien.ac.at/login/index.php");
        assert_eq!(get_default_portal_url("tiss"), "https://tiss.tuwien.ac.at");
        assert_eq!(get_default_portal_url("vowi"), "https://vowi.fsinf.at");
        assert_eq!(get_default_portal_url("tumaps"), "https://maps.tuwien.ac.at");
    }

    #[test]
    fn test_navigate_portal_security() {
        assert!(navigate_portal("tuwel".into(), "https://tuwel.tuwien.ac.at/mod/assign/view.php".into()).is_ok());
        assert!(navigate_portal("tuwel".into(), "https://evil.com/phishing".into()).is_err());
    }
}
