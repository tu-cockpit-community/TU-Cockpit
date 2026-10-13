import React, { useState } from "react";
import { CryptoSyncEngine, EncryptedSyncEnvelope } from "@/services/sync/CryptoSyncEngine";
import { GistSyncAdapter, SyncPayloadData } from "@/services/sync/GistSyncAdapter";
import { useThemeStore } from "@/store/useThemeStore";
import { useAppStore } from "@/store/useAppStore";
import {
  Lock,
  KeyRound,
  CloudUpload,
  CloudDownload,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export const SyncSettings: React.FC = () => {
  const { tokens, activeThemeId, fontSans, fontMono, uiScale, setTheme, setFontSans, setFontMono, setUiScale } = useThemeStore();
  const { installedPlugins, dockPinnedIds } = useAppStore();

  const [passphrase, setPassphrase] = useState<string>("tu-wien-secret-sync");
  const [showPassphrase, setShowPassphrase] = useState<boolean>(false);
  const [gistToken, setGistToken] = useState<string>("");
  const [gistId, setGistId] = useState<string>("");

  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [lastEnvelope, setLastEnvelope] = useState<EncryptedSyncEnvelope | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Test local E2EE encrypt/decrypt round-trip
  const handleTestEncryption = async () => {
    try {
      setIsProcessing(true);
      setStatusMessage({ type: "info", text: "Deriving PBKDF2 600,000-round key..." });

      const salt = CryptoSyncEngine.generateSalt();
      const cryptoKey = await CryptoSyncEngine.deriveKey(passphrase, salt);

      const payload: SyncPayloadData = {
        theme: {
          activeThemeId,
          fontSans,
          fontMono,
          uiScale,
          tokens,
        },
        installedPlugins: Object.values(installedPlugins).map((p) => ({
          id: p.manifest.id,
          version: p.manifest.version,
          enabled: p.enabled,
        })),
        dockPinnedIds,
        updatedAt: new Date().toISOString(),
      };

      const encrypted = await CryptoSyncEngine.encryptPayload(payload, cryptoKey);
      const envelope: EncryptedSyncEnvelope = {
        version: 1,
        deviceId: "macbook-air-m3-tu",
        updatedAt: new Date().toISOString(),
        salt: btoa(String.fromCharCode(...salt)),
        iv: encrypted.iv,
        ciphertext: encrypted.ciphertext,
      };

      setLastEnvelope(envelope);

      // Verify immediate decryption
      const decrypted = (await CryptoSyncEngine.decryptPayload(
        envelope.ciphertext,
        envelope.iv,
        cryptoKey
      )) as SyncPayloadData;

      if (decrypted.theme.activeThemeId === activeThemeId) {
        setStatusMessage({
          type: "success",
          text: `E2EE Verification Successful! Payload cleanly encrypted & decrypted (${envelope.ciphertext.length} chars ciphertext).`,
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: `Encryption test failed: ${err.message}` });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloudPush = async () => {
    if (!gistToken.trim()) {
      setStatusMessage({ type: "error", text: "GitHub Personal Access Token is required for cloud sync push" });
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMessage({ type: "info", text: "Encrypting and uploading payload to GitHub Gist..." });

      const salt = CryptoSyncEngine.generateSalt();
      const cryptoKey = await CryptoSyncEngine.deriveKey(passphrase, salt);

      const payload: SyncPayloadData = {
        theme: { activeThemeId, fontSans, fontMono, uiScale, tokens },
        installedPlugins: Object.values(installedPlugins).map((p) => ({
          id: p.manifest.id,
          version: p.manifest.version,
          enabled: p.enabled,
        })),
        dockPinnedIds,
        updatedAt: new Date().toISOString(),
      };

      const encrypted = await CryptoSyncEngine.encryptPayload(payload, cryptoKey);
      const envelope: EncryptedSyncEnvelope = {
        version: 1,
        deviceId: "tu-cockpit-client",
        updatedAt: new Date().toISOString(),
        salt: btoa(String.fromCharCode(...salt)),
        iv: encrypted.iv,
        ciphertext: encrypted.ciphertext,
      };

      const res = await GistSyncAdapter.pushSync(gistToken, gistId || null, envelope);
      setGistId(res.gistId);
      setLastEnvelope(envelope);
      setStatusMessage({
        type: "success",
        text: `Zero-Knowledge Sync pushed successfully to Gist ID: ${res.gistId}`,
      });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: `Cloud push failed: ${err.message}` });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloudPull = async () => {
    if (!gistToken.trim() || !gistId.trim()) {
      setStatusMessage({ type: "error", text: "Both GitHub Token and Gist ID are required to pull backup" });
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMessage({ type: "info", text: "Downloading encrypted envelope from GitHub Gist..." });

      const envelope = await GistSyncAdapter.pullSync(gistToken, gistId);
      const salt = Uint8Array.from(atob(envelope.salt), (c) => c.charCodeAt(0));
      const cryptoKey = await CryptoSyncEngine.deriveKey(passphrase, salt);

      const decrypted = (await CryptoSyncEngine.decryptPayload(
        envelope.ciphertext,
        envelope.iv,
        cryptoKey
      )) as SyncPayloadData;

      // Apply synced theme state
      if (decrypted.theme) {
        setTheme(decrypted.theme.activeThemeId, decrypted.theme.tokens);
        if (decrypted.theme.fontSans) setFontSans(decrypted.theme.fontSans);
        if (decrypted.theme.fontMono) setFontMono(decrypted.theme.fontMono);
        if (decrypted.theme.uiScale) setUiScale(decrypted.theme.uiScale);
      }

      setLastEnvelope(envelope);
      setStatusMessage({
        type: "success",
        text: `Successfully synced state from cloud! Theme restored to '${decrypted.theme.activeThemeId}'.`,
      });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: `Cloud pull failed: ${err.message}` });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 text-[var(--tu-text-primary)]">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--tu-text-primary)]">
          End-to-End Encrypted (E2EE) Sync
        </h2>
        <p className="text-sm text-[var(--tu-text-secondary)] mt-1">
          Synchronize your workspace layouts, installed plugins, and theme configurations across your laptop, desktop, and tablets without revealing credentials or university data.
        </p>
      </div>

      {/* Passphrase Box */}
      <section className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-6 shadow-[var(--tu-shadow)]">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-5 h-5 text-[var(--tu-text-accent)]" />
          <h3 className="font-semibold text-base">Zero-Knowledge Passphrase</h3>
        </div>

        <p className="text-xs text-[var(--tu-text-secondary)] mb-3">
          Your encryption key is derived locally via PBKDF2 (600,000 iterations). Neither GitHub nor any sync relay can decrypt your data without this passphrase.
        </p>

        <div className="relative max-w-md">
          <input
            type={showPassphrase ? "text" : "password"}
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] px-3 py-2 text-sm text-[var(--tu-text-primary)] pr-10 focus:outline-none focus:border-[var(--tu-border-focus)] font-mono"
            placeholder="Enter personal sync passphrase"
          />
          <button
            onClick={() => setShowPassphrase(!showPassphrase)}
            className="absolute right-3 top-2.5 text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)]"
          >
            {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="mt-4">
          <button
            onClick={handleTestEncryption}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Verify Local E2EE Round-Trip
          </button>
        </div>
      </section>

      {/* Cloud Adapter Settings */}
      <section className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-6 shadow-[var(--tu-shadow)]">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-[var(--tu-text-accent)]" />
          <h3 className="font-semibold text-base">Cloud Relay (GitHub Gist)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--tu-text-secondary)] mb-1">
              GitHub Token (repo / gist scope)
            </label>
            <input
              type="password"
              value={gistToken}
              onChange={(e) => setGistToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] px-3 py-2 text-sm text-[var(--tu-text-primary)] font-mono focus:outline-none focus:border-[var(--tu-border-focus)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--tu-text-secondary)] mb-1">
              Existing Gist ID (Optional)
            </label>
            <input
              type="text"
              value={gistId}
              onChange={(e) => setGistId(e.target.value)}
              placeholder="e.g. 8a34bc7e8912..."
              className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] px-3 py-2 text-sm text-[var(--tu-text-primary)] font-mono focus:outline-none focus:border-[var(--tu-border-focus)]"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCloudPush}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <CloudUpload className="w-4 h-4" />
            Push Encrypted Backup
          </button>
          <button
            onClick={handleCloudPull}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors flex items-center gap-2"
          >
            <CloudDownload className="w-4 h-4" />
            Pull & Decrypt
          </button>
        </div>
      </section>

      {/* Status Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-[var(--tu-radius)] border flex items-center gap-3 text-xs ${
            statusMessage.type === "success"
              ? "bg-[var(--tu-success)]/10 border-[var(--tu-success)]/30 text-[var(--tu-success)]"
              : statusMessage.type === "error"
              ? "bg-[var(--tu-danger)]/10 border-[var(--tu-danger)]/30 text-[var(--tu-danger)]"
              : "bg-[var(--tu-accent)]/10 border-[var(--tu-accent)]/30 text-[var(--tu-text-accent)]"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Envelope Debug Inspector */}
      {lastEnvelope && (
        <section className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-6 shadow-[var(--tu-shadow)]">
          <h3 className="font-semibold text-xs uppercase tracking-wider text-[var(--tu-text-secondary)] mb-3">
            Last Encrypted Envelope (Zero-Knowledge Ciphertext)
          </h3>
          <pre className="p-3 rounded-[var(--tu-radius)] bg-[var(--tu-bg-base)] border border-[var(--tu-border)] text-[11px] font-mono text-[var(--tu-text-secondary)] overflow-x-auto max-h-48">
            {JSON.stringify(lastEnvelope, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
};
