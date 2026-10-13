import React from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  Store,
  GraduationCap,
  Code,
  Palette,
  Cloud,
  Puzzle,
  PlusCircle,
} from "lucide-react";

interface DockProps {
  devMode?: boolean;
}

export const Dock: React.FC<DockProps> = ({ devMode = false }) => {
  const {
    activeView,
    activePluginId,
    installedPlugins,
    setActiveView,
    setSyncModalOpen,
    setGitHubInstallModalOpen,
  } = useAppStore();

  const installedList = Object.values(installedPlugins);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[var(--tu-bg-surface)]/85 backdrop-blur-md border border-[var(--tu-border)] rounded-2xl shadow-2xl transition-all duration-300 hover:scale-[1.01]">
        {/* Core Hub: Marketplace */}
        <button
          onClick={() => setActiveView("marketplace")}
          title="Community Marketplace"
          className={`relative group flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
            activeView === "marketplace"
              ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] shadow-lg shadow-[var(--tu-accent)]/20"
              : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
          }`}
        >
          <Store className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
          {activeView === "marketplace" && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--tu-accent-contrast)]" />
          )}
          <span className="pointer-events-none absolute -top-9 px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap bg-[var(--tu-bg-card)] text-[var(--tu-text-primary)] border border-[var(--tu-border)] opacity-0 -translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 shadow-md">
            Marketplace
          </span>
        </button>

        {/* Embedded University Portals */}
        <button
          onClick={() => setActiveView("portals")}
          title="TU Wien University Portals"
          className={`relative group flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
            activeView === "portals"
              ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] shadow-lg shadow-[var(--tu-accent)]/20"
              : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
          }`}
        >
          <GraduationCap className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
          {activeView === "portals" && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--tu-accent-contrast)]" />
          )}
          <span className="pointer-events-none absolute -top-9 px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap bg-[var(--tu-bg-card)] text-[var(--tu-text-primary)] border border-[var(--tu-border)] opacity-0 -translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 shadow-md">
            University Portals
          </span>
        </button>

        {/* Dynamic Installed Plugins */}
        {installedList.length > 0 && (
          <>
            <div className="w-[1px] h-6 bg-[var(--tu-border)] mx-1" />
            {installedList.map((p) => {
              const isPluginActive = activeView === "plugin" && activePluginId === p.manifest.id;
              return (
                <button
                  key={p.manifest.id}
                  onClick={() => setActiveView("plugin", p.manifest.id)}
                  title={p.manifest.name}
                  className={`relative group flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                    isPluginActive
                      ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] shadow-lg shadow-[var(--tu-accent)]/20"
                      : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
                  }`}
                >
                  <Puzzle className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  {isPluginActive && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--tu-accent-contrast)]" />
                  )}
                  <span className="pointer-events-none absolute -top-9 px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap bg-[var(--tu-bg-card)] text-[var(--tu-text-primary)] border border-[var(--tu-border)] opacity-0 -translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 shadow-md">
                    {p.manifest.name}
                  </span>
                </button>
              );
            })}
          </>
        )}

        {/* Quick Add Plugin from GitHub */}
        <button
          onClick={() => setGitHubInstallModalOpen(true)}
          title="Install Plugin from GitHub"
          className="relative group flex items-center justify-center w-10 h-10 rounded-xl text-[var(--tu-text-muted)] hover:text-[var(--tu-text-accent)] hover:bg-[var(--tu-bg-hover)] transition-all"
        >
          <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
          <span className="pointer-events-none absolute -top-9 px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap bg-[var(--tu-bg-card)] text-[var(--tu-text-primary)] border border-[var(--tu-border)] opacity-0 -translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 shadow-md">
            Direct GitHub Install
          </span>
        </button>

        <div className="w-[1px] h-6 bg-[var(--tu-border)] mx-1" />

        {/* Developer Portal (Shown if devMode or developer role active) */}
        {devMode && (
          <button
            onClick={() => setActiveView("developer")}
            title="Developer Portal & Publishing"
            className={`relative group flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
              activeView === "developer"
                ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] shadow-lg shadow-[var(--tu-accent)]/20"
                : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
            }`}
          >
            <Code className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            {activeView === "developer" && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--tu-accent-contrast)]" />
            )}
            <span className="pointer-events-none absolute -top-9 px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap bg-[var(--tu-bg-card)] text-[var(--tu-text-primary)] border border-[var(--tu-border)] opacity-0 -translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 shadow-md">
              Developer Portal
            </span>
          </button>
        )}

        {/* Themes & Settings */}
        <button
          onClick={() => setActiveView("settings")}
          title="Themes & Workspace Settings"
          className={`relative group flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
            activeView === "settings"
              ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] shadow-lg shadow-[var(--tu-accent)]/20"
              : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
          }`}
        >
          <Palette className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
          {activeView === "settings" && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--tu-accent-contrast)]" />
          )}
          <span className="pointer-events-none absolute -top-9 px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap bg-[var(--tu-bg-card)] text-[var(--tu-text-primary)] border border-[var(--tu-border)] opacity-0 -translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 shadow-md">
            Themes & Settings
          </span>
        </button>

        {/* E2EE Sync Trigger */}
        <button
          onClick={() => setSyncModalOpen(true)}
          title="Zero-Knowledge Cloud Sync"
          className="relative group flex items-center justify-center w-10 h-10 rounded-xl text-[var(--tu-text-muted)] hover:text-[var(--tu-text-accent)] hover:bg-[var(--tu-bg-hover)] transition-all"
        >
          <Cloud className="w-4 h-4" />
          <span className="pointer-events-none absolute -top-9 px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap bg-[var(--tu-bg-card)] text-[var(--tu-text-primary)] border border-[var(--tu-border)] opacity-0 -translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 shadow-md">
            E2EE Cloud Sync
          </span>
        </button>
      </div>
    </div>
  );
};
