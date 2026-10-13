import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useThemeStore } from "@/store/useThemeStore";
import { PluginFrame } from "@/components/plugin-host/PluginFrame";
import { Dock } from "@/components/dock/Dock";
import { ThemeCustomizer } from "@/components/settings/ThemeCustomizer";
import { SyncSettings } from "@/components/settings/SyncSettings";
import { PluginMarketplace } from "@/components/marketplace/PluginMarketplace";
import { EmbeddedPortalView } from "@/components/embedded/EmbeddedPortalView";
import { DeveloperPortal } from "@/components/developer/DeveloperPortal";
import { GitHubInstallModal } from "@/components/marketplace/GitHubInstallModal";
import {
  GraduationCap,
  Clock,
  Sparkles,
  ExternalLink,
  X,
  Palette,
  Cloud,
  Store,
} from "lucide-react";

export const App: React.FC = () => {
  const {
    activeView,
    activePluginId,
    installedPlugins,
    setActiveView,
    isSyncModalOpen,
    setSyncModalOpen,
  } = useAppStore();

  const { applyToRoot, activeThemeId } = useThemeStore();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [settingsTab, setSettingsTab] = useState<"themes" | "sync">("themes");

  // Ensure DOM has CSS custom properties on mount
  useEffect(() => {
    applyToRoot();
  }, [applyToRoot]);

  // Live Clock updater
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const activePlugin = activePluginId ? installedPlugins[activePluginId] : null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--tu-bg-base)] text-[var(--tu-text-primary)] overflow-hidden transition-colors duration-200">
      {/* Top Application Header */}
      <header className="h-12 border-b border-[var(--tu-border)] bg-[var(--tu-bg-surface)] px-4 flex items-center justify-between shrink-0 select-none z-10 shadow-sm">
        {/* Left: Branding & University Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView("marketplace")}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div className="w-7 h-7 rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] flex items-center justify-center font-bold text-xs shadow-md">
              TU
            </div>
            <span className="font-bold text-sm tracking-tight text-[var(--tu-text-primary)]">
              TU Cockpit
            </span>
          </button>

          <div className="h-4 w-[1px] bg-[var(--tu-border)]" />

          <div className="flex items-center gap-1.5 text-xs text-[var(--tu-text-secondary)]">
            <GraduationCap className="w-3.5 h-3.5 text-[var(--tu-accent)]" />
            <span>Wintersemester 2026/27</span>
          </div>
        </div>

        {/* Center: University Quick Portals */}
        <div className="hidden md:flex items-center gap-1 text-xs">
          <button
            onClick={() => setActiveView("portals")}
            className="px-2.5 py-1 rounded-[var(--tu-radius-sm)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors flex items-center gap-1"
          >
            University Portals
          </button>
          <a
            href="https://tuwel.tuwien.ac.at"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 rounded-[var(--tu-radius-sm)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors flex items-center gap-1"
          >
            TUWEL
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
          <a
            href="https://tiss.tuwien.ac.at"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 rounded-[var(--tu-radius-sm)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors flex items-center gap-1"
          >
            TISS
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
          <a
            href="https://vowi.fsinf.at"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 rounded-[var(--tu-radius-sm)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors flex items-center gap-1"
          >
            VoWi
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>

        {/* Right: Theme Badge & Clock */}
        <div className="flex items-center gap-3 text-xs text-[var(--tu-text-secondary)]">
          <button
            onClick={() => {
              setActiveView("settings");
              setSettingsTab("themes");
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] hover:border-[var(--tu-border-focus)] transition-all cursor-pointer text-[11px]"
          >
            <Sparkles className="w-3 h-3 text-[var(--tu-text-accent)]" />
            <span className="capitalize">{activeThemeId.replace(/-/g, " ")}</span>
          </button>

          <div className="flex items-center gap-1 font-mono text-[var(--tu-text-primary)]">
            <Clock className="w-3.5 h-3.5 text-[var(--tu-text-muted)]" />
            <span>{currentTime}</span>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto p-6 relative">
        {/* Marketplace View (Default Clean Slate Hub) */}
        {activeView === "marketplace" && <PluginMarketplace />}

        {/* University Portals View */}
        {activeView === "portals" && <EmbeddedPortalView />}

        {/* Developer Portal View */}
        {activeView === "developer" && <DeveloperPortal />}

        {/* Sandboxed Plugin View */}
        {activeView === "plugin" && activePlugin && (
          <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-3 pb-20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{activePlugin.manifest.name}</h2>
                <span className="text-xs text-[var(--tu-text-secondary)] font-mono">
                  {activePlugin.manifest.id} (v{activePlugin.manifest.version})
                </span>
              </div>
              <button
                onClick={() => setActiveView("marketplace")}
                className="px-3 py-1.5 text-xs rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] flex items-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5" />
                Return to Marketplace
              </button>
            </div>

            <div className="flex-1 w-full h-full">
              <PluginFrame
                pluginId={activePlugin.manifest.id}
                htmlContent={activePlugin.htmlContent}
                allowedGlobs={activePlugin.manifest.capabilities?.network || []}
              />
            </div>
          </div>
        )}

        {/* Settings View */}
        {activeView === "settings" && (
          <div className="space-y-6">
            <div className="max-w-4xl mx-auto flex gap-2 border-b border-[var(--tu-border)] pb-3">
              <button
                onClick={() => setSettingsTab("themes")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] transition-all ${
                  settingsTab === "themes"
                    ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)]"
                    : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
                }`}
              >
                <Palette className="w-4 h-4" />
                Theming & Typography
              </button>
              <button
                onClick={() => setSettingsTab("sync")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] transition-all ${
                  settingsTab === "sync"
                    ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)]"
                    : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
                }`}
              >
                <Cloud className="w-4 h-4" />
                Zero-Knowledge E2EE Sync
              </button>
            </div>

            {settingsTab === "themes" ? <ThemeCustomizer /> : <SyncSettings />}
          </div>
        )}
      </main>

      {/* Floating Glassmorphic Dock */}
      <Dock devMode={true} />

      {/* Direct GitHub Install Modal */}
      <GitHubInstallModal />

      {/* E2EE Sync Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSyncModalOpen(false)}
              className="absolute right-4 top-4 text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)]"
            >
              <X className="w-5 h-5" />
            </button>
            <SyncSettings />
          </div>
        </div>
      )}
    </div>
  );
};
