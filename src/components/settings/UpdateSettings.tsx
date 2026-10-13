import React from "react";
import { useUpdaterStore } from "@/store/useUpdaterStore";
import { Rocket, RefreshCw, CheckCircle, ShieldCheck, Github, ExternalLink } from "lucide-react";

export const UpdateSettings: React.FC = () => {
  const {
    availableUpdate,
    newVersion,
    isChecking,
    isInstalling,
    progressPercent,
    statusMessage,
    checkUpdates,
    installAndRelaunch,
  } = useUpdaterStore();

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h4 className="text-sm font-bold text-[var(--tu-text-primary)]">
          Application Software Updates
        </h4>
        <p className="text-xs text-[var(--tu-text-secondary)] mt-1">
          Cryptographically signed automated releases from GitHub Releases with delta patching.
        </p>
      </div>

      <div className="p-4 rounded-lg bg-[var(--tu-bg-card)] border border-[var(--tu-border)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-[var(--tu-text-primary)]">
              Current Installed Version
            </div>
            <div className="text-xs text-[var(--tu-text-muted)] font-mono">
              TU Cockpit v0.1.0 (Production Release)
            </div>
          </div>

          <button
            onClick={() => checkUpdates(true)}
            disabled={isChecking || isInstalling}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
            <span>{isChecking ? "Checking..." : "Check for Updates"}</span>
          </button>
        </div>

        {statusMessage && (
          <div className="p-3 rounded bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-xs text-[var(--tu-text-primary)] flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {availableUpdate && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Rocket className="w-4 h-4" />
                <span>New Release Available: v{newVersion}</span>
              </div>

              <button
                onClick={installAndRelaunch}
                disabled={isInstalling}
                className="px-3.5 py-1 bg-emerald-500 text-black text-xs font-bold rounded hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
              >
                {isInstalling && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {isInstalling
                    ? progressPercent !== null
                      ? `Installing (${progressPercent}%)`
                      : "Installing..."
                    : "Install & Restart"}
                </span>
              </button>
            </div>

            {availableUpdate.body && (
              <p className="text-xs text-[var(--tu-text-secondary)] whitespace-pre-line bg-[var(--tu-bg-surface)] p-2.5 rounded border border-[var(--tu-border)]">
                {availableUpdate.body}
              </p>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-[var(--tu-border)] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--tu-text-muted)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Minisign Ed25519 Signatures Verified</span>
          </div>
          <a
            href="https://github.com/tu-cockpit-community/TU-Cockpit/releases"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-[var(--tu-text-primary)] transition-colors"
          >
            <Github className="w-4 h-4 shrink-0" />
            <span>View GitHub Releases</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
