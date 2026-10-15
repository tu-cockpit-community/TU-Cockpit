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

export type PluginSourceType = "registry" | "github_direct" | "local_dev" | "local" | "github";

export interface InstalledPlugin {
  manifest: PluginManifest;
  htmlContent: string;
  enabled: boolean;
  installedAt: string;
  sourceType?: PluginSourceType;
  installDir?: string;
}

export type SystemView = "marketplace" | "portals" | "settings";

export type NavOrientation = "left" | "right" | "bottom" | "top";

export interface PluginCategory {
  id: string;
  name: string;
  icon?: string;
  isDefault: boolean;
  isCollapsed: boolean;
  pluginIds: string[];
}

export interface AppState {
  activeView: SystemView | "plugin";
  activePluginId: string | null;
  installedPlugins: Record<string, InstalledPlugin>;
  dockPinnedIds: string[];
  isSyncModalOpen: boolean;
  communityOrgName: string;
  navOrientation: NavOrientation;
  isSidebarCollapsed: boolean;
  categories: PluginCategory[];
  isCategoryModalOpen: boolean;
  
  slideVaultPath: string;
  downloadedPluginsPath: string;
  devPluginsPath: string;
  tuwelInterceptionEnabled: boolean;
  tissAutoSyncEnabled: boolean;
  setSlideVaultPath: (path: string) => void;
  setDownloadedPluginsPath: (path: string) => void;
  setDevPluginsPath: (path: string) => void;
  setTuwelInterceptionEnabled: (enabled: boolean) => void;
  setTissAutoSyncEnabled: (enabled: boolean) => void;

  isSettingsModalOpen: boolean;
  settingsInitialTab: "themes" | "sync" | "layout" | "account" | "autofill" | "updates" | "plugins";
  openSettings: (tab?: "themes" | "sync" | "layout" | "account" | "autofill" | "updates" | "plugins") => void;
  closeSettings: () => void;

  isShortcutsModalOpen: boolean;
  setShortcutsModalOpen: (open: boolean) => void;

  setActiveView: (view: SystemView | "plugin", pluginId?: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  installPlugin: (manifest: PluginManifest, htmlContent: string, sourceType?: PluginSourceType, installDir?: string) => void;
  uninstallPlugin: (id: string) => void;
  togglePlugin: (id: string, enabled: boolean) => void;
  pinToDock: (id: string) => void;
  unpinFromDock: (id: string) => void;
  setSyncModalOpen: (open: boolean) => void;
  setCommunityOrgName: (orgName: string) => void;
  setNavOrientation: (orientation: NavOrientation) => void;
  setCategoryModalOpen: (open: boolean) => void;
  createCategory: (name: string, icon?: string) => void;
  renameCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  toggleCategoryCollapse: (id: string) => void;
  movePluginToCategory: (pluginId: string, targetCatId: string) => void;
  reorderPluginInCategory: (catId: string, sourceIndex: number, targetIndex: number) => void;
}

import { OFFICIAL_PLUGINS } from "@/plugins/official/OfficialPlugins";

const INITIAL_INSTALLED_PLUGINS: Record<string, InstalledPlugin> = Object.entries(
  OFFICIAL_PLUGINS
).reduce((acc, [id, def]) => {
  acc[id] = {
    manifest: def.manifest,
    htmlContent: def.htmlContent,
    enabled: true,
    installedAt: "2026-10-13T00:00:00.000Z",
    sourceType: "registry",
  };
  return acc;
}, {} as Record<string, InstalledPlugin>);

const INITIAL_CATEGORIES: PluginCategory[] = [
  {
    id: "essentials",
    name: "TU Essentials",
    icon: "GraduationCap",
    isDefault: true,
    isCollapsed: false,
    pluginIds: [
      "tuwien.official.tuwel",
      "tuwien.official.tiss",
      "tuwien.official.vowi",
      "tuwien.official.tumaps",
    ],
  },
  {
    id: "community",
    name: "Community Tools",
    icon: "Boxes",
    isDefault: true,
    isCollapsed: false,
    pluginIds: [],
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  activeView: "marketplace",
  activePluginId: null,
  installedPlugins: INITIAL_INSTALLED_PLUGINS,
  dockPinnedIds: [
    "marketplace",
    "tuwien.official.tuwel",
    "tuwien.official.tiss",
    "tuwien.official.vowi",
    "tuwien.official.tumaps",
    "settings",
  ],
  isSyncModalOpen: false,
  communityOrgName: "tu-cockpit-community",
  navOrientation: "left",
  isSidebarCollapsed: false,
  categories: INITIAL_CATEGORIES,
  isCategoryModalOpen: false,
  slideVaultPath: localStorage.getItem("tu_setting_slide_vault_path") || "",
  downloadedPluginsPath: localStorage.getItem("tu_setting_downloaded_plugins_path") || "",
  devPluginsPath: localStorage.getItem("tu_setting_dev_plugins_path") || "dev-plugins",
  tuwelInterceptionEnabled: localStorage.getItem("tu_setting_tuwel_interception") !== "false",
  tissAutoSyncEnabled: localStorage.getItem("tu_setting_tiss_autosync") !== "false",

  isSettingsModalOpen: false,
  settingsInitialTab: "themes",
  openSettings: (tab = "themes") =>
    set({ isSettingsModalOpen: true, settingsInitialTab: tab }),
  closeSettings: () => set({ isSettingsModalOpen: false }),

  isShortcutsModalOpen: false,
  setShortcutsModalOpen: (open: boolean) => set({ isShortcutsModalOpen: open }),

  setSlideVaultPath: (path: string) => {
    set({ slideVaultPath: path });
    localStorage.setItem("tu_setting_slide_vault_path", path);
  },
  setDownloadedPluginsPath: (path: string) => {
    set({ downloadedPluginsPath: path });
    localStorage.setItem("tu_setting_downloaded_plugins_path", path);
  },
  setDevPluginsPath: (path: string) => {
    set({ devPluginsPath: path });
    localStorage.setItem("tu_setting_dev_plugins_path", path);
  },
  setTuwelInterceptionEnabled: (enabled: boolean) => {
    set({ tuwelInterceptionEnabled: enabled });
    localStorage.setItem("tu_setting_tuwel_interception", String(enabled));
  },
  setTissAutoSyncEnabled: (enabled: boolean) => {
    set({ tissAutoSyncEnabled: enabled });
    localStorage.setItem("tu_setting_tiss_autosync", String(enabled));
  },

  setCommunityOrgName: (orgName) => set({ communityOrgName: orgName }),
  setNavOrientation: (orientation) => set({ navOrientation: orientation }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  setCategoryModalOpen: (open) => set({ isCategoryModalOpen: open }),

  createCategory: (name, icon) => {
    const id = `cat_${Date.now()}`;
    const newCat: PluginCategory = {
      id,
      name,
      icon: icon || "Folder",
      isDefault: false,
      isCollapsed: false,
      pluginIds: [],
    };
    set((state) => ({ categories: [...state.categories, newCat] }));
  },

  renameCategory: (id, name) => {
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, name } : c)),
    }));
  },

  deleteCategory: (id) => {
    set((state) => {
      const target = state.categories.find((c) => c.id === id);
      if (!target || target.isDefault) return state;
      const orphaned = target.pluginIds;
      const updated = state.categories
        .filter((c) => c.id !== id)
        .map((c) =>
          c.id === "community" || c.id === "tools"
            ? { ...c, pluginIds: [...new Set([...c.pluginIds, ...orphaned])] }
            : c
        );
      return { categories: updated };
    });
  },

  toggleCategoryCollapse: (id) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, isCollapsed: !c.isCollapsed } : c
      ),
    }));
  },

  movePluginToCategory: (pluginId, targetCatId) => {
    set((state) => {
      const updated = state.categories.map((c) => {
        const withoutPlugin = c.pluginIds.filter((p) => p !== pluginId);
        if (c.id === targetCatId) {
          return { ...c, pluginIds: [...withoutPlugin, pluginId] };
        }
        return { ...c, pluginIds: withoutPlugin };
      });
      return { categories: updated };
    });
  },

  reorderPluginInCategory: (catId, sourceIndex, targetIndex) => {
    set((state) => {
      const updated = state.categories.map((c) => {
        if (c.id !== catId) return c;
        const copy = [...c.pluginIds];
        const [moved] = copy.splice(sourceIndex, 1);
        copy.splice(targetIndex, 0, moved);
        return { ...c, pluginIds: copy };
      });
      return { categories: updated };
    });
  },

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

      // Ensure plugin is assigned to a category in sidebar
      const inAnyCategory = state.categories.some((c) => c.pluginIds.includes(manifest.id));
      let categories = state.categories;

      if (!inAnyCategory) {
        const hasCommunity = categories.some((c) => c.id === "community");
        const hasTools = categories.some((c) => c.id === "tools");

        if (hasCommunity) {
          categories = categories.map((c) =>
            c.id === "community"
              ? { ...c, pluginIds: [...new Set([...c.pluginIds, manifest.id])] }
              : c
          );
        } else if (hasTools) {
          categories = categories.map((c) =>
            c.id === "tools"
              ? { ...c, pluginIds: [...new Set([...c.pluginIds, manifest.id])] }
              : c
          );
        } else {
          categories = [
            ...categories,
            {
              id: "community",
              name: "Community Tools",
              icon: "Boxes",
              isDefault: true,
              isCollapsed: false,
              pluginIds: [manifest.id],
            },
          ];
        }
      }

      return {
        installedPlugins: updated,
        dockPinnedIds: dock,
        categories,
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
      const categories = state.categories.map((c) => ({
        ...c,
        pluginIds: c.pluginIds.filter((p) => p !== id),
      }));
      return {
        installedPlugins: copy,
        dockPinnedIds: dock,
        categories,
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
