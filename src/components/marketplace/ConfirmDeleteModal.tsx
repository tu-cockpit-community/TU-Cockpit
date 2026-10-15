import React from "react";
import { Trash2, X, ShieldAlert } from "lucide-react";

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  pluginId: string | null;
  pluginName: string | null;
  isLocalDev?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  pluginName,
  isLocalDev = false,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] shadow-2xl p-6 text-[var(--tu-text-primary)] space-y-4">
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 rounded-[var(--tu-radius-sm)] text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors cursor-pointer"
          title="Schließen"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isLocalDev
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
            }`}
          >
            {isLocalDev ? (
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold tracking-tight">
              {isLocalDev ? "Unlink Local Dev Plugin" : "Uninstall Plugin"}
            </h3>
            <p className="text-xs font-semibold text-[var(--tu-accent)] font-mono truncate max-w-[280px]">
              {pluginName || "Selected Plugin"}
            </p>
          </div>
        </div>

        {/* Content Message */}
        <div className="text-xs text-[var(--tu-text-secondary)] leading-relaxed space-y-2">
          {isLocalDev ? (
            <div className="p-3 rounded-[var(--tu-radius-sm)] bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <strong className="block text-amber-200 font-semibold mb-1">
                Protected Dev Workspace Invariant:
              </strong>
              This plugin is staged from your local repository (<code>dev-plugins/</code>).
              Unlinking will remove it from the TU Cockpit active view, but all your source code,
              git history, and disk files will remain completely intact.
            </div>
          ) : (
            <div className="p-3 rounded-[var(--tu-radius-sm)] bg-rose-500/10 border border-rose-500/20 text-[var(--tu-text-secondary)]">
              Are you sure you want to uninstall{" "}
              <strong className="text-[var(--tu-text-primary)]">'{pluginName}'</strong>?
              This will permanently delete all downloaded files for this plugin from your computer's
              Plugins directory.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--tu-border)]">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-primary)] transition-colors cursor-pointer"
          >
            Abbrechen
          </button>

          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`px-4 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] text-white transition-opacity flex items-center gap-1.5 shadow-sm cursor-pointer ${
              isLocalDev
                ? "bg-amber-600 hover:bg-amber-500"
                : "bg-rose-600 hover:bg-rose-500"
            } disabled:opacity-50`}
          >
            {isDeleting ? (
              <span>Wird entfernt...</span>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isLocalDev ? "Unlink from Cockpit" : "Delete Plugin"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
