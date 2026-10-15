import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "@/store/useAppStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { PluginFrame } from "@/components/plugin-host/PluginFrame";
import { NativePortalContainer } from "@/components/plugin-host/NativePortalContainer";
import { ConfigurableNav } from "@/components/navigation/ConfigurableNav";
import { CategoryManagerModal } from "@/components/navigation/CategoryManagerModal";
import { ExecutiveHeader } from "@/components/header/ExecutiveHeader";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { PluginMarketplace } from "@/components/marketplace/PluginMarketplace";
import { EmbeddedPortalView } from "@/components/embedded/EmbeddedPortalView";
import { LoginModal } from "@/components/auth/LoginModal";
import { CommandPalette } from "@/components/palette/CommandPalette";
import { UpdaterToast } from "@/components/updater/UpdaterToast";
import { SyncSettings } from "@/components/settings/SyncSettings";
import { VoWiReader } from "@/components/vowi/VoWiReader";
import { WorkstationStatusBar } from "@/components/layout/WorkstationStatusBar";
import { KeyboardShortcutsModal } from "@/components/navigation/KeyboardShortcutsModal";
import { DEFAULT_STORE_REGISTRY } from "@/services/marketplace/GitHubPluginService";
import { X, BookOpen } from "lucide-react";

export const App: React.FC = () => {
  const {
    activeView,
    activePluginId,
    installedPlugins,
    isSyncModalOpen,
    setSyncModalOpen,
    navOrientation,
    toggleSidebar,
    isCategoryModalOpen,
    setCategoryModalOpen,
    isSettingsModalOpen,
    settingsInitialTab,
    openSettings,
    closeSettings,
    isShortcutsModalOpen,
    setShortcutsModalOpen,
    setActiveView,
  } = useAppStore();

  const { isLoginModalOpen, setLoginModalOpen } = useAuthStore();
  const { openOverlay, closeOverlay } = useOverlayStore();
  const { applyToRoot } = useThemeStore();
  const [vowiMode, setVowiMode] = useState<"reader" | "live">("reader");

  // Ensure native portals are hidden when navigating away from plugin view
  useEffect(() => {
    if (activeView !== "plugin") {
      invoke("hide_all_native_portals").catch(() => {});
    }
  }, [activeView]);

  // Connect React modals to global overlay coordinator (invisibility bus)
  useEffect(() => {
    if (isSettingsModalOpen) openOverlay("settings");
    else closeOverlay("settings");
  }, [isSettingsModalOpen, openOverlay, closeOverlay]);

  useEffect(() => {
    if (isSyncModalOpen) openOverlay("sync");
    else closeOverlay("sync");
  }, [isSyncModalOpen, openOverlay, closeOverlay]);

  useEffect(() => {
    if (isCategoryModalOpen) openOverlay("category");
    else closeOverlay("category");
  }, [isCategoryModalOpen, openOverlay, closeOverlay]);

  useEffect(() => {
    if (isLoginModalOpen) openOverlay("login");
    else closeOverlay("login");
  }, [isLoginModalOpen, openOverlay, closeOverlay]);

  useEffect(() => {
    if (isShortcutsModalOpen) openOverlay("shortcuts");
    else closeOverlay("shortcuts");
  }, [isShortcutsModalOpen, openOverlay, closeOverlay]);

  // Ensure DOM has CSS custom properties on mount
  useEffect(() => {
    applyToRoot();
  }, [applyToRoot]);

  // Power-User Desktop Keyboard Shortcuts Bus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      // Escape key: dismiss topmost active modal
      if (e.key === "Escape") {
        if (isShortcutsModalOpen) {
          setShortcutsModalOpen(false);
          return;
        }
        if (isSettingsModalOpen) {
          closeSettings();
          return;
        }
        if (isSyncModalOpen) {
          setSyncModalOpen(false);
          return;
        }
        if (isCategoryModalOpen) {
          setCategoryModalOpen(false);
          return;
        }
        if (isLoginModalOpen) {
          setLoginModalOpen(false);
          return;
        }
      }

      // '?' outside text inputs opens the Shortcuts Cheat Sheet
      if (!isInput && e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShortcutsModalOpen(!isShortcutsModalOpen);
        return;
      }

      // Cmd (macOS) / Ctrl (Windows/Linux) accelerators
      if (e.metaKey || e.ctrlKey) {
        // Cmd+/ : Toggle Shortcuts Cheat Sheet
        if (e.key === "/") {
          e.preventDefault();
          setShortcutsModalOpen(!isShortcutsModalOpen);
          return;
        }

        // Cmd+, : Open Settings Modal
        if (e.key === ",") {
          e.preventDefault();
          openSettings("themes");
          return;
        }

        // Cmd+B : Toggle Sidebar
        if (e.key.toLowerCase() === "b") {
          if (navOrientation === "left" || navOrientation === "right") {
            e.preventDefault();
            toggleSidebar();
            return;
          }
        }

        // Cmd+1 : Official TUWEL Portal
        if (e.key === "1") {
          e.preventDefault();
          setActiveView("plugin", "tuwien.official.tuwel");
          return;
        }

        // Cmd+2 : Official TISS Organization Portal
        if (e.key === "2") {
          e.preventDefault();
          setActiveView("plugin", "tuwien.official.tiss");
          return;
        }

        // Cmd+3 : Official VoWi MediaWiki Reader
        if (e.key === "3") {
          e.preventDefault();
          setActiveView("plugin", "tuwien.official.vowi");
          return;
        }

        // Cmd+4 : Official TU Maps Campus Navigator
        if (e.key === "4") {
          e.preventDefault();
          setActiveView("plugin", "tuwien.official.tumaps");
          return;
        }

        // Cmd+5 : Community Marketplace HUB
        if (e.key === "5") {
          e.preventDefault();
          setActiveView("marketplace");
          return;
        }

        // Cmd+Shift+V : Slide Vault & Offline PDFs
        if (e.shiftKey && e.key.toLowerCase() === "v") {
          e.preventDefault();
          setActiveView("plugin", "tuwien.community.slide-vault");
          return;
        }

        // Cmd+Shift+D : DevStudio Staging Environment
        if (e.shiftKey && e.key.toLowerCase() === "d") {
          e.preventDefault();
          setActiveView("marketplace");
          window.dispatchEvent(new CustomEvent("open-devstudio-tab"));
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    navOrientation,
    toggleSidebar,
    isShortcutsModalOpen,
    setShortcutsModalOpen,
    isSettingsModalOpen,
    closeSettings,
    isSyncModalOpen,
    setSyncModalOpen,
    isCategoryModalOpen,
    setCategoryModalOpen,
    isLoginModalOpen,
    setLoginModalOpen,
    openSettings,
    setActiveView,
  ]);

  const activePlugin = activePluginId ? installedPlugins[activePluginId] : null;

  const renderMainContent = () => {
    if (activeView === "plugin" && activePlugin) {
      const KNOWN_OFFICIAL_URLS: Record<string, string> = {
        "tuwien.official.tuwel": "https://tuwel.tuwien.ac.at/login/index.php",
        "tuwien.official.tiss": "https://tiss.tuwien.ac.at",
        "tuwien.official.vowi": "https://vowi.fsinf.at",
        "tuwien.official.tumaps": "https://maps.tuwien.ac.at",
      };

      const isOfficialPortal = activePlugin.manifest.id.startsWith("tuwien.official.");
      const portalUrl =
        activePlugin.manifest.homepage || KNOWN_OFFICIAL_URLS[activePlugin.manifest.id];

      if (isOfficialPortal && portalUrl) {
        if (activePlugin.manifest.id === "tuwien.official.vowi" && vowiMode === "reader") {
          return (
            <main className="flex-1 w-full h-full relative overflow-hidden p-0 m-0">
              <VoWiReader onOpenLivePortal={() => setVowiMode("live")} />
            </main>
          );
        }

        return (
          <main className="flex-1 w-full h-full relative overflow-hidden p-0 m-0">
            <NativePortalContainer
              key={activePlugin.manifest.id}
              portalId={activePlugin.manifest.id}
              url={portalUrl}
              title={activePlugin.manifest.name}
              extraActions={
                activePlugin.manifest.id === "tuwien.official.vowi" ? (
                  <button
                    onClick={() => setVowiMode("reader")}
                    className="flex items-center gap-1 px-2 py-1 rounded-[var(--tu-radius-sm)] bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 transition-colors cursor-pointer text-[11px] font-medium"
                    title="Switch to Headless MediaWiki Reader"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reader Mode</span>
                  </button>
                ) : undefined
              }
            />
          </main>
        );
      }

      const registryEntry = DEFAULT_STORE_REGISTRY.plugins.find(
        (p) => p.id === activePlugin.manifest.id
      );
      const effectiveHtml = registryEntry?.htmlContent || activePlugin.htmlContent;

      return (
        <main className="flex-1 w-full h-full relative overflow-hidden p-0 m-0">
          <PluginFrame
            pluginId={activePlugin.manifest.id}
            htmlContent={effectiveHtml}
            allowedGlobs={activePlugin.manifest.capabilities?.network || []}
          />
        </main>
      );
    }

    return (
      <main className="flex-1 overflow-y-auto p-6 relative">
        {/* Marketplace View (Default Clean Slate Hub) */}
        {activeView === "marketplace" && <PluginMarketplace />}

        {/* Legacy Portals View (Fallback) */}
        {activeView === "portals" && <EmbeddedPortalView />}
      </main>
    );
  };

  return (
    <div className="h-screen w-screen bg-[var(--tu-bg-base)] text-[var(--tu-text-primary)] overflow-hidden transition-colors duration-200">
      {/* Left Sidebar Layout */}
      {navOrientation === "left" && (
        <div className="flex h-full w-full">
          <ConfigurableNav />
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <ExecutiveHeader onOpenSettings={() => openSettings("themes")} />
            {renderMainContent()}
            <WorkstationStatusBar />
          </div>
        </div>
      )}

      {/* Right Sidebar Layout */}
      {navOrientation === "right" && (
        <div className="flex h-full w-full">
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <ExecutiveHeader onOpenSettings={() => openSettings("themes")} />
            {renderMainContent()}
            <WorkstationStatusBar />
          </div>
          <ConfigurableNav />
        </div>
      )}

      {/* Bottom or Top Floating Navigation Layout */}
      {(navOrientation === "bottom" || navOrientation === "top") && (
        <div className="flex flex-col h-full w-full">
          <ExecutiveHeader onOpenSettings={() => openSettings("themes")} />
          <ConfigurableNav />
          {renderMainContent()}
          <WorkstationStatusBar />
        </div>
      )}

      {/* Modals & Dialogs */}
      <CommandPalette onOpenSettings={() => openSettings("themes")} />
      <UpdaterToast />
      <LoginModal />
      <CategoryManagerModal />
      <KeyboardShortcutsModal />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        initialTab={settingsInitialTab}
        onClose={closeSettings}
      />

      {/* E2EE Sync Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSyncModalOpen(false)}
              className="absolute right-4 top-4 text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] cursor-pointer"
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
