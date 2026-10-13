import React, { useState } from "react";
import { ThemeCustomizer } from "./ThemeCustomizer";
import { SyncSettings } from "./SyncSettings";
import { LayoutSettings } from "./LayoutSettings";
import {
  X,
  Palette,
  Cloud,
  Layout,
  Settings as SettingsIcon,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "themes" | "sync" | "layout";
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = "themes",
}) => {
  const [activeTab, setActiveTab] = useState<"themes" | "sync" | "layout">(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-[var(--tu-text-primary)]">
        {/* Header */}
        <div className="p-4 border-b border-[var(--tu-border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)]/15 border border-[var(--tu-accent)]/30 text-[var(--tu-accent)] flex items-center justify-center">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Workspace Settings</h3>
              <p className="text-xs text-[var(--tu-text-secondary)]">
                Customize colors, fonts, zero-knowledge encryption, and workstation layout
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] p-1.5 rounded hover:bg-[var(--tu-bg-hover)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2 bg-[var(--tu-bg-card)] border-b border-[var(--tu-border-subtle)] flex items-center gap-2 shrink-0 select-none">
          <button
            onClick={() => setActiveTab("themes")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] transition-all cursor-pointer ${
              activeTab === "themes"
                ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] shadow-sm"
                : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Theming & Typography
          </button>

          <button
            onClick={() => setActiveTab("sync")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] transition-all cursor-pointer ${
              activeTab === "sync"
                ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] shadow-sm"
                : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            Zero-Knowledge E2EE Sync
          </button>

          <button
            onClick={() => setActiveTab("layout")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] transition-all cursor-pointer ${
              activeTab === "layout"
                ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] shadow-sm"
                : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            Navigation & Layout
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "themes" && <ThemeCustomizer />}
          {activeTab === "sync" && <SyncSettings />}
          {activeTab === "layout" && <LayoutSettings />}
        </div>
      </div>
    </div>
  );
};
