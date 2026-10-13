import React, { useEffect } from "react";
import { useUpdaterStore } from "@/store/useUpdaterStore";
import { Rocket, RefreshCw, X, CheckCircle } from "lucide-react";

export const UpdaterToast: React.FC = () => {
  const {
    availableUpdate,
    newVersion,
    isInstalling,
    progressPercent,
    statusMessage,
    checkUpdates,
    installAndRelaunch,
    dismissUpdate,
  } = useUpdaterStore();

  useEffect(() => {
    // Initial silent check on startup
    const timer = setTimeout(() => {
      checkUpdates(false);
    }, 3000);

    // Periodic check every 4 hours
    const interval = setInterval(() => {
      checkUpdates(false);
    }, 4 * 60 * 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [checkUpdates]);

  if (!availableUpdate && !statusMessage) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center animate-in slide-in-from-bottom-3 duration-300">
      {availableUpdate ? (
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[var(--tu-bg-surface)] border border-[var(--tu-accent)]/50 shadow-xl backdrop-blur-md text-xs text-[var(--tu-text-primary)]">
          <div className="w-5 h-5 rounded-full bg-[var(--tu-accent)]/20 text-[var(--tu-accent)] flex items-center justify-center shrink-0">
            <Rocket className="w-3 h-3" />
          </div>

          <span className="font-semibold text-[var(--tu-text-primary)]">
            Update v{newVersion} Available
          </span>

          <button
            onClick={installAndRelaunch}
            disabled={isInstalling}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] font-bold text-[11px] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isInstalling && (
              <RefreshCw className="w-3 h-3 animate-spin shrink-0" />
            )}
            <span>
              {isInstalling
                ? progressPercent !== null
                  ? `Installing (${progressPercent}%)`
                  : "Installing..."
                : "Install & Restart"}
            </span>
          </button>

          <button
            onClick={dismissUpdate}
            className="p-1 rounded-full text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] transition-colors cursor-pointer"
            title="Dismiss update notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : statusMessage ? (
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] shadow-lg text-xs text-[var(--tu-text-secondary)]">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      ) : null}
    </div>
  );
};
