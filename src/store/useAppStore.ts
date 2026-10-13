import { create } from "zustand";

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  description?: string;
  homepage?: string;
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
}

export type SystemView = "dashboard" | "marketplace" | "settings";

export interface AppState {
  activeView: SystemView | "plugin";
  activePluginId: string | null;
  installedPlugins: Record<string, InstalledPlugin>;
  dockPinnedIds: string[];
  isSyncModalOpen: boolean;
  
  setActiveView: (view: SystemView | "plugin", pluginId?: string) => void;
  installPlugin: (manifest: PluginManifest, htmlContent: string) => void;
  uninstallPlugin: (id: string) => void;
  togglePlugin: (id: string, enabled: boolean) => void;
  pinToDock: (id: string) => void;
  unpinFromDock: (id: string) => void;
  setSyncModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeView: "dashboard",
  activePluginId: "tuwien.tuwel.deadlines",
  installedPlugins: {},
  dockPinnedIds: ["dashboard", "tuwien.tuwel.deadlines", "marketplace", "settings"],
  isSyncModalOpen: false,

  setActiveView: (view, pluginId) => {
    set({
      activeView: view,
      activePluginId: pluginId !== undefined ? pluginId : (view === "plugin" ? get().activePluginId : null),
    });
  },

  installPlugin: (manifest, htmlContent) => {
    set((state) => {
      const updated = {
        ...state.installedPlugins,
        [manifest.id]: {
          manifest,
          htmlContent,
          enabled: true,
          installedAt: new Date().toISOString(),
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
      const activeView = state.activePluginId === id ? "dashboard" : state.activeView;
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
}));
