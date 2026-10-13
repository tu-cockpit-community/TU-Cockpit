import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useThemeStore } from "@/store/useThemeStore";
import { PluginFrame } from "@/components/plugin-host/PluginFrame";
import { NativePortalContainer } from "@/components/plugin-host/NativePortalContainer";
import { ConfigurableNav } from "@/components/navigation/ConfigurableNav";
import { CategoryManagerModal } from "@/components/navigation/CategoryManagerModal";
import { ExecutiveHeader } from "@/components/header/ExecutiveHeader";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { PluginMarketplace } from "@/components/marketplace/PluginMarketplace";
import { EmbeddedPortalView } from "@/components/embedded/EmbeddedPortalView";
import { LoginModal } from "@/components/auth/LoginModal";
import { SyncSettings } from "@/components/settings/SyncSettings";
import { X, Store } from "lucide-react";

export const App: React.FC = () => {
  const {
    activeView,
    activePluginId,
    installedPlugins,
    setActiveView,
    isSyncModalOpen,
    setSyncModalOpen,
    navOrientation,
  } = useAppStore();

  const { applyToRoot } = useThemeStore();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Ensure DOM has CSS custom properties on mount
  useEffect(() => {
    applyToRoot();
  }, [applyToRoot]);

  const activePlugin = activePluginId ? installedPlugins[activePluginId] : null;

  const renderMainContent = () => (
    <main className="flex-1 overflow-y-auto p-6 relative">
      {/* Marketplace View (Default Clean Slate Hub) */}
      {activeView === "marketplace" && <PluginMarketplace />}

      {/* Legacy Portals View (Fallback) */}
      {activeView === "portals" && <EmbeddedPortalView />}

      {/* Sandboxed Plugin View */}
      {activeView === "plugin" && activePlugin && (
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-3 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{activePlugin.manifest.name}</h2>
              <span className="text-xs text-[var(--tu-text-secondary)] font-mono">
                {activePlugin.manifest.id} (v{activePlugin.manifest.version})
              </span>
            </div>
            <button
              onClick={() => setActiveView("marketplace")}
              className="px-3 py-1.5 text-xs rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] flex items-center gap-1.5 cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              Return to Marketplace
            </button>
          </div>

          <div className="flex-1 w-full h-full">
            {activePlugin.manifest.id.startsWith("tuwien.official.") &&
            activePlugin.manifest.homepage ? (
              <NativePortalContainer
                key={activePlugin.manifest.id}
                portalId={activePlugin.manifest.id}
                url={activePlugin.manifest.homepage}
                title={activePlugin.manifest.name}
              />
            ) : (
              <PluginFrame
                pluginId={activePlugin.manifest.id}
                htmlContent={activePlugin.htmlContent}
                allowedGlobs={activePlugin.manifest.capabilities?.network || []}
              />
            )}
          </div>
        </div>
      )}
    </main>
  );

  return (
    <div className="h-screen w-screen bg-[var(--tu-bg-base)] text-[var(--tu-text-primary)] overflow-hidden transition-colors duration-200">
      {/* Left Sidebar Layout */}
      {navOrientation === "left" && (
        <div className="flex h-full w-full">
          <ConfigurableNav />
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <ExecutiveHeader onOpenSettings={() => setIsSettingsModalOpen(true)} />
            {renderMainContent()}
          </div>
        </div>
      )}

      {/* Right Sidebar Layout */}
      {navOrientation === "right" && (
        <div className="flex h-full w-full">
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <ExecutiveHeader onOpenSettings={() => setIsSettingsModalOpen(true)} />
            {renderMainContent()}
          </div>
          <ConfigurableNav />
        </div>
      )}

      {/* Bottom or Top Floating Navigation Layout */}
      {(navOrientation === "bottom" || navOrientation === "top") && (
        <div className="flex flex-col h-full w-full">
          <ExecutiveHeader onOpenSettings={() => setIsSettingsModalOpen(true)} />
          <ConfigurableNav />
          {renderMainContent()}
        </div>
      )}

      {/* Modals & Dialogs */}
      <LoginModal />
      <CategoryManagerModal />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
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
