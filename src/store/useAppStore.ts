import { create } from "zustand";

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author?: {
    name: string;
    email?: string;
    url?: string;
    github?: string;
  };
  description?: string;
  homepage?: string;
  githubRepo?: string;
  entrypoint: string;
  icon?: string;
  type?: "widget" | "view" | "tool";
  capabilities?: {
    network?: string[];
    storage?: {
      quotaBytes?: number;
    };
    notifications?: boolean;
    systemClipboard?: boolean;
  };
  ui?: {
    minWidth?: number;
    minHeight?: number;
    defaultWidth?: number;
    defaultHeight?: number;
    resizable?: boolean;
  };
}

export interface InstalledPlugin {
  manifest: PluginManifest;
  htmlContent: string;
  enabled: boolean;
  installedAt: string;
  sourceType?: "registry" | "github_direct" | "local_dev";
  installDir?: string;
}

export type SystemView = "marketplace" | "portals" | "developer" | "settings";

export interface AppState {
  activeView: SystemView | "plugin";
  activePluginId: string | null;
  installedPlugins: Record<string, InstalledPlugin>;
  dockPinnedIds: string[];
  isSyncModalOpen: boolean;
  isGitHubInstallModalOpen: boolean;
  
  setActiveView: (view: SystemView | "plugin", pluginId?: string) => void;
  installPlugin: (manifest: PluginManifest, htmlContent: string, sourceType?: "registry" | "github_direct" | "local_dev", installDir?: string) => void;
  uninstallPlugin: (id: string) => void;
  togglePlugin: (id: string, enabled: boolean) => void;
  pinToDock: (id: string) => void;
  unpinFromDock: (id: string) => void;
  setSyncModalOpen: (open: boolean) => void;
  setGitHubInstallModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeView: "marketplace",
  activePluginId: null,
  installedPlugins: {},
  dockPinnedIds: ["marketplace", "portals", "settings"],
  isSyncModalOpen: false,
  isGitHubInstallModalOpen: false,

  setActiveView: (view, pluginId) => {
    set({
      activeView: view,
      activePluginId: pluginId !== undefined ? pluginId : (view === "plugin" ? get().activePluginId : null),
    });
  },

  installPlugin: (manifest, htmlContent, sourceType = "registry", installDir) => {
    set((state) => {
      const updated = {
        ...state.installedPlugins,
        [manifest.id]: {
          manifest,
          htmlContent,
          enabled: true,
          installedAt: new Date().toISOString(),
          sourceType,
          installDir,
        },
      };
      const dock = state.dockPinnedIds.includes(manifest.id)
        ? state.dockPinnedIds
        : [...state.dockPinnedIds, manifest.id];
      return {
        installedPlugins: updated,
        dockPinnedIds: dock,
        activeView: "plugin",
        activePluginId: manifest.id,
      };
    });
  },

  uninstallPlugin: (id) => {
    set((state) => {
      const copy = { ...state.installedPlugins };
      delete copy[id];
      const dock = state.dockPinnedIds.filter((item) => item !== id);
      const activePluginId = state.activePluginId === id ? null : state.activePluginId;
      const activeView = state.activePluginId === id ? "marketplace" : state.activeView;
      return {
        installedPlugins: copy,
        dockPinnedIds: dock,
        activePluginId,
        activeView,
      };
    });
  },

  togglePlugin: (id, enabled) => {
    set((state) => {
      const plugin = state.installedPlugins[id];
      if (!plugin) return state;
      return {
        installedPlugins: {
          ...state.installedPlugins,
          [id]: { ...plugin, enabled },
        },
      };
    });
  },

  pinToDock: (id) => {
    set((state) => {
      if (state.dockPinnedIds.includes(id)) return state;
      return { dockPinnedIds: [...state.dockPinnedIds, id] };
    });
  },

  unpinFromDock: (id) => {
    set((state) => ({
      dockPinnedIds: state.dockPinnedIds.filter((item) => item !== id),
    }));
  },

  setSyncModalOpen: (open) => set({ isSyncModalOpen: open }),
  setGitHubInstallModalOpen: (open) => set({ isGitHubInstallModalOpen: open }),
}));
