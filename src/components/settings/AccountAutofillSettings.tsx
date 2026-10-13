import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Trash2,
  Save,
  HelpCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface VaultStatusResponse {
  username: string;
  has_password: boolean;
  has_totp: boolean;
  auto_fill: boolean;
}

export const AccountAutofillSettings: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [totpSecret, setTotpSecret] = useState<string>("");
  const [autoFillEnabled, setAutoFillEnabled] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showTotpSecret, setShowTotpSecret] = useState<boolean>(false);

  const [hasStoredPassword, setHasStoredPassword] = useState<boolean>(false);
  const [hasStoredTotp, setHasStoredTotp] = useState<boolean>(false);
  const [liveTotpCode, setLiveTotpCode] = useState<string | null>(null);
  const [totpSecondsRemaining, setTotpSecondsRemaining] = useState<number>(30);
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Load status on mount
  useEffect(() => {
    loadVaultStatus();
  }, []);

  // Update live TOTP code countdown when secret is present
  useEffect(() => {
    let interval: any = null;
    if (totpSecret.trim().length >= 8) {
      const updateCode = async () => {
        try {
          const code = await invoke<string>("generate_totp_code", {
            secretBase32: totpSecret.trim(),
          });
          setLiveTotpCode(code);
          const nowSec = Math.floor(Date.now() / 1000);
          setTotpSecondsRemaining(30 - (nowSec % 30));
        } catch {
          setLiveTotpCode(null);
        }
      };

      updateCode();
      interval = setInterval(updateCode, 1000);
    } else {
      setLiveTotpCode(null);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [totpSecret]);

  const loadVaultStatus = async () => {
    try {
      const status = await invoke<VaultStatusResponse>("get_vault_status");
      if (status) {
        setUsername(status.username || "");
        setHasStoredPassword(status.has_password);
        setHasStoredTotp(status.has_totp);
        setAutoFillEnabled(status.auto_fill);
      }
    } catch {
      // In web or fallback mode, check localStorage
      const localVault = localStorage.getItem("tu_vault_preview");
      if (localVault) {
        try {
          const parsed = JSON.parse(localVault);
          setUsername(parsed.username || "");
          setHasStoredPassword(Boolean(parsed.password));
          setHasStoredTotp(Boolean(parsed.totp_secret));
          setAutoFillEnabled(parsed.auto_fill ?? true);
        } catch (e) {
          console.warn("Failed to read local vault preview:", e);
        }
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!username.trim()) {
      setErrorMsg("Student username or email cannot be empty.");
      return;
    }

    try {
      await invoke("save_vault_credentials", {
        username: username.trim(),
        password: password.trim(),
        totpSecret: totpSecret.trim() ? totpSecret.trim() : null,
        autoFill: autoFillEnabled,
      });

      // Also persist to local cache fallback
      localStorage.setItem(
        "tu_vault_preview",
        JSON.stringify({
          username: username.trim(),
          password: password.trim() ? "******" : "",
          totp_secret: totpSecret.trim() ? "******" : "",
          auto_fill: autoFillEnabled,
        })
      );

      setSuccessMsg("University credentials and MFA tokens saved securely to OS Keyring!");
      setHasStoredPassword(Boolean(password.trim() || hasStoredPassword));
      if (totpSecret.trim()) setHasStoredTotp(true);
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      setErrorMsg(`Failed to save to secure vault: ${err?.toString() || "Unknown error"}`);
    }
  };

  const handleClear = async () => {
    if (!confirm("Are you sure you want to delete your stored credentials from the secure vault?")) {
      return;
    }
    try {
      await invoke("clear_vault_credentials");
      localStorage.removeItem("tu_vault_preview");
      setUsername("");
      setPassword("");
      setTotpSecret("");
      setHasStoredPassword(false);
      setHasStoredTotp(false);
      setLiveTotpCode(null);
      setSuccessMsg("Credentials successfully deleted from vault.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(`Failed to clear vault: ${err?.toString() || "Unknown error"}`);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl text-[var(--tu-text-primary)]">
      <div>
        <h3 className="text-base font-bold flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-[var(--tu-accent)]" />
          University Credentials Vault & MFA Auto-Input
        </h3>
        <p className="text-xs text-[var(--tu-text-secondary)] mt-1">
          Store your TU Wien SSO credentials and optional TOTP authenticator key to
          automatically sign into TUWEL, TISS, and Webmail without manual typing.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-[var(--tu-radius)] flex items-center gap-2 text-xs text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-[var(--tu-radius)] flex items-center gap-2 text-xs text-red-400 animate-in fade-in">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Credentials Form Card */}
      <div className="bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--tu-border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-[var(--tu-text-primary)]">
              Hardware-Backed Keyring Storage
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
            macOS Keychain / Secret Service
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Username / Student ID */}
          <div>
            <label className="block text-xs font-semibold text-[var(--tu-text-secondary)] mb-1.5">
              TU Wien Student Username / Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e11823456 or e11823456@student.tuwien.ac.at"
              className="w-full bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-sm)] px-3 py-2 text-xs font-mono focus:outline-none focus:border-[var(--tu-border-focus)] transition-colors"
            />
            <span className="text-[10px] text-[var(--tu-text-muted)] mt-1 block">
              Used on Shibboleth SSO portals: <code className="font-mono">login.tuwien.ac.at</code>
            </span>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[var(--tu-text-secondary)]">
                TU Wien Account Password
              </label>
              {hasStoredPassword && (
                <span className="text-[10px] text-emerald-400 font-mono">
                  ✓ Stored in OS Keyring
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={hasStoredPassword ? "•••••••••••• (Leave blank to keep existing)" : "Enter university password"}
                className="w-full bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-sm)] px-3 py-2 text-xs font-mono pr-9 focus:outline-none focus:border-[var(--tu-border-focus)] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Optional TOTP Secret */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[var(--tu-text-secondary)] flex items-center gap-1.5">
                <span>Optional 2FA / TOTP Secret Key</span>
                <span className="text-[10px] font-normal text-[var(--tu-text-muted)]">(Base32)</span>
              </label>
              {hasStoredTotp && (
                <span className="text-[10px] text-emerald-400 font-mono">
                  ✓ Active MFA Generator
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showTotpSecret ? "text" : "password"}
                value={totpSecret}
                onChange={(e) => setTotpSecret(e.target.value)}
                placeholder={hasStoredTotp ? "•••••••••••• (MFA active)" : "e.g. JBSWY3DPEHPK3PXP (from authenticator setup)"}
                className="w-full bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-sm)] px-3 py-2 text-xs font-mono pr-9 focus:outline-none focus:border-[var(--tu-border-focus)] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowTotpSecret(!showTotpSecret)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] cursor-pointer"
              >
                {showTotpSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-[var(--tu-text-muted)] mt-1">
              If TU Wien enforces 2-Factor Authentication, provide the Base32 setup key. TU Cockpit will automatically compute and input your 6-digit rolling token.
            </p>

            {/* Live TOTP Verification Preview */}
            {liveTotpCode && (
              <div className="mt-2.5 p-2.5 bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-sm)] flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs text-[var(--tu-text-secondary)]">Live Token Preview:</span>
                  <span className="text-sm font-mono font-bold tracking-widest text-[var(--tu-text-accent)]">
                    {liveTotpCode}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--tu-text-muted)]">
                  <Clock className="w-3 h-3 text-[var(--tu-accent)]" />
                  <span>{totpSecondsRemaining}s</span>
                </div>
              </div>
            )}
          </div>

          {/* Autofill Toggle */}
          <div className="pt-2 border-t border-[var(--tu-border-subtle)] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--tu-text-primary)] block">
                Auto-fill credentials on TU Wien login forms
              </span>
              <span className="text-[11px] text-[var(--tu-text-muted)]">
                In-webview daemon monitors login pages and fills inputs automatically.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoFillEnabled}
                onChange={(e) => setAutoFillEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[var(--tu-bg-surface)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--tu-accent)]"></div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3">
            {(hasStoredPassword || hasStoredTotp) ? (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-[var(--tu-radius-sm)] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Vault
              </button>
            ) : <div />}

            <button
              type="submit"
              className="px-4 py-2 bg-[var(--tu-accent)] hover:bg-[var(--tu-accent-hover)] text-[var(--tu-accent-contrast)] text-xs font-semibold rounded-[var(--tu-radius-sm)] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              Save Credentials
            </button>
          </div>
        </form>
      </div>

      {/* Security FAQ */}
      <div className="bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-5 space-y-3">
        <h4 className="font-bold text-xs flex items-center gap-2 text-[var(--tu-text-primary)]">
          <HelpCircle className="w-4 h-4 text-[var(--tu-accent)]" />
          How TU Cockpit Vault Keeps Your Credentials Safe
        </h4>
        <ul className="text-xs text-[var(--tu-text-secondary)] space-y-2 list-disc list-inside pl-1 leading-relaxed">
          <li>
            <strong className="text-[var(--tu-text-primary)]">OS-Level Encryption:</strong> Passwords and TOTP secrets are encrypted and stored via your operating system’s official Keyring (Apple Keychain on macOS, Windows Credential Manager, or Secret Service on Linux).
          </li>
          <li>
            <strong className="text-[var(--tu-text-primary)]">Local Only:</strong> Credentials are never synced to any server or cloud, and are excluded from zero-knowledge E2EE cloud backup for maximum security.
          </li>
          <li>
            <strong className="text-[var(--tu-text-primary)]">Zero Sandboxed Exposure:</strong> Untrusted community plugins have zero access to the credentials vault; only the host application’s internal login daemon interacts with form fields.
          </li>
        </ul>
      </div>
    </div>
  );
};
