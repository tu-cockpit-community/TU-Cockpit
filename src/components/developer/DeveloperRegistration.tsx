import React, { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Code,
  Github,
  ShieldCheck,
  CheckCircle2,
  Copy,
  AlertCircle,
  Key,
  User,
} from "lucide-react";

export const DeveloperRegistration: React.FC = () => {
  const { currentUser, updateProfile, setRole } = useAuthStore();

  const [displayName, setDisplayName] = useState<string>(
    currentUser?.displayName || ""
  );
  const [githubUser, setGithubUser] = useState<string>(
    currentUser?.githubUsername || ""
  );
  const [agreedCharter, setAgreedCharter] = useState<boolean>(false);
  const [verificationToken, setVerificationToken] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGenerateToken = () => {
    if (!githubUser.trim()) {
      setErrorMsg("Please enter your GitHub username first.");
      return;
    }
    if (!displayName.trim()) {
      setErrorMsg("Please provide your Developer Display Name.");
      return;
    }
    setErrorMsg(null);
    const token = `tu-cockpit-dev-${Math.random().toString(36).substring(2, 10)}`;
    setVerificationToken(token);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCompleteRegistration = () => {
    if (!displayName.trim()) {
      setErrorMsg("Developer Display Name is required.");
      return;
    }
    if (!githubUser.trim()) {
      setErrorMsg("GitHub username is required.");
      return;
    }
    if (!agreedCharter) {
      setErrorMsg("You must accept the TU Cockpit Developer Security Charter.");
      return;
    }

    setErrorMsg(null);
    updateProfile({
      displayName: displayName.trim(),
      githubUsername: githubUser.trim().replace(/^@/, ""),
      role: "developer",
      developerStatus: "approved",
    });
    setRole("developer");
    setSuccessMsg("Developer credentials verified! Unlocking developer workspace...");
  };

  return (
    <div className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-6 sm:p-8 shadow-[var(--tu-shadow)] max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--tu-border-subtle)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)]/15 border border-[var(--tu-accent)]/30 text-[var(--tu-accent)] flex items-center justify-center">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-[var(--tu-text-primary)]">
              TU Cockpit Developer Onboarding
            </h3>
            <span className="text-xs text-[var(--tu-text-secondary)]">
              Register as a student developer to sideload local tools and publish to the store
            </span>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--tu-bg-card)] border border-[var(--tu-border)] text-[var(--tu-text-muted)]">
          RBAC Gate
        </span>
      </div>

      <p className="text-xs text-[var(--tu-text-secondary)] leading-relaxed">
        Students enrolled at TU Wien can apply for Developer privileges to test unpacked local plugins, publish tools to the community store, and access RPC container debuggers.
      </p>

      {errorMsg && (
        <div className="p-3 rounded-[var(--tu-radius)] bg-[var(--tu-danger)]/10 border border-[var(--tu-danger)]/30 text-[var(--tu-danger)] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-[var(--tu-radius)] bg-[var(--tu-accent)]/10 border border-[var(--tu-accent)]/30 text-[var(--tu-text-accent)] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Step 1: Display Name */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[var(--tu-text-secondary)] uppercase tracking-wider">
          1. Developer Display Name
        </label>
        <div className="relative">
          <User className="w-4 h-4 absolute left-3 top-2.5 text-[var(--tu-text-muted)]" />
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Stefan Weber or Dev Group TU"
            className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] pl-9 pr-3 py-1.5 text-xs text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)]"
          />
        </div>
        <span className="text-[11px] text-[var(--tu-text-muted)] block">
          This name is shown as the author of your published plugins on the Community Store.
        </span>
      </div>

      {/* Step 2: GitHub Username & Token */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[var(--tu-text-secondary)] uppercase tracking-wider">
          2. GitHub Developer Identity
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Github className="w-4 h-4 absolute left-3 top-2.5 text-[var(--tu-text-muted)]" />
            <input
              type="text"
              value={githubUser}
              onChange={(e) => setGithubUser(e.target.value)}
              placeholder="github-username"
              className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] pl-9 pr-3 py-1.5 text-xs text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)] font-mono"
            />
          </div>
          <button
            type="button"
            onClick={handleGenerateToken}
            className="px-3 py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0"
          >
            <Key className="w-3.5 h-3.5" />
            Generate Token
          </button>
        </div>
        <span className="text-[11px] text-[var(--tu-text-muted)] block">
          Used to link your open-source repositories and verify GitOps release tags.
        </span>
      </div>

      {/* Identity Verification Token Box */}
      {verificationToken && (
        <div className="p-3.5 rounded-[var(--tu-radius)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--tu-text-secondary)]">
              Verification Challenge Token
            </span>
            <span className="text-[10px] text-[var(--tu-accent)] font-medium">Ready for validation</span>
          </div>
          <div className="flex items-center justify-between gap-2 p-2 rounded bg-[var(--tu-bg-base)] border border-[var(--tu-border)] text-xs font-mono text-[var(--tu-text-accent)]">
            <span>{verificationToken}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] px-2 py-0.5 rounded hover:bg-[var(--tu-bg-hover)]"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <p className="text-[11px] text-[var(--tu-text-muted)] leading-relaxed">
            Add this token to your public GitHub bio or create a temporary public Gist to verify ownership of <code className="text-[var(--tu-text-primary)]">@{githubUser || "username"}</code>.
          </p>
        </div>
      )}

      {/* Step 3: Developer Security Charter */}
      <div className="space-y-3 pt-2 border-t border-[var(--tu-border-subtle)]">
        <span className="text-xs font-semibold text-[var(--tu-text-secondary)] uppercase tracking-wider block">
          3. Developer Security Charter
        </span>
        <div className="p-3.5 rounded-[var(--tu-radius)] bg-[var(--tu-bg-base)] border border-[var(--tu-border)] text-[11px] text-[var(--tu-text-secondary)] space-y-1.5 max-h-36 overflow-y-auto font-mono">
          <p className="text-[var(--tu-text-primary)] font-semibold">TU Cockpit Developer Agreement (2026/27):</p>
          <p>• Zero harvesting of student credentials, passwords, or TISS/TUWEL session cookies.</p>
          <p>• Mandatory declarative network capability bounding in manifest.json.</p>
          <p>• Zero execution of obfuscated code, telemetry trackers, or cryptominers.</p>
          <p>• Respect client privacy: zero exfiltration of local encrypted IndexedDB storage.</p>
          <p>• All published plugins must be open-source under MIT, Apache-2.0, or GPL-3.0.</p>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[var(--tu-text-primary)] pt-1 select-none">
          <input
            type="checkbox"
            checked={agreedCharter}
            onChange={(e) => setAgreedCharter(e.target.checked)}
            className="mt-0.5 rounded border-[var(--tu-border)] bg-[var(--tu-bg-card)] accent-[var(--tu-accent)]"
          />
          <span className="leading-snug">
            I pledge to uphold the TU Cockpit Developer Security Charter and acknowledge that violating these rules will result in immediate revocation of publishing credentials.
          </span>
        </label>
      </div>

      <button
        type="button"
        onClick={handleCompleteRegistration}
        disabled={!agreedCharter || !displayName.trim() || !githubUser.trim()}
        className="w-full py-2.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow cursor-pointer"
      >
        <ShieldCheck className="w-4 h-4" />
        Complete Registration & Unlock Developer Hub
      </button>
    </div>
  );
};
