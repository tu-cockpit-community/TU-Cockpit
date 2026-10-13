import { create } from "zustand";
import { check, Update } from "@tauri-apps/plugin-updater";

interface UpdaterState {
  availableUpdate: Update | null;
  newVersion: string | null;
  isChecking: boolean;
  isInstalling: boolean;
  progressPercent: number | null;
  statusMessage: string | null;
  checkUpdates: (manual?: boolean) => Promise<boolean>;
  installAndRelaunch: () => Promise<void>;
  dismissUpdate: () => void;
}

export const useUpdaterStore = create<UpdaterState>((set, get) => ({
  availableUpdate: null,
  newVersion: null,
  isChecking: false,
  isInstalling: false,
  progressPercent: null,
  statusMessage: null,

  checkUpdates: async (manual = false) => {
    try {
      set({ isChecking: true, statusMessage: manual ? "Checking for updates..." : null });
      const update = await check();

      if (update) {
        set({
          availableUpdate: update,
          newVersion: update.version,
          statusMessage: `New version v${update.version} available!`,
        });
        return true;
      } else {
        if (manual) {
          set({ statusMessage: "You are on the latest version of TU Cockpit." });
          setTimeout(() => set({ statusMessage: null }), 4000);
        }
        return false;
      }
    } catch (err) {
      console.warn("Updater check:", err);
      if (manual) {
        set({ statusMessage: "TU Cockpit is up to date (or running development build)." });
        setTimeout(() => set({ statusMessage: null }), 4000);
      }
      return false;
    } finally {
      set({ isChecking: false });
    }
  },

  installAndRelaunch: async () => {
    const update = get().availableUpdate;
    if (!update) return;

    set({ isInstalling: true, progressPercent: 0, statusMessage: "Downloading update..." });

    try {
      let downloaded = 0;
      let total = 0;

      await update.downloadAndInstall((event) => {
        if (event.event === "Started") {
          total = event.data.contentLength || 0;
        } else if (event.event === "Progress") {
          downloaded += event.data.chunkLength;
          if (total > 0) {
            set({ progressPercent: Math.round((downloaded / total) * 100) });
          }
        } else if (event.event === "Finished") {
          set({ progressPercent: 100, statusMessage: "Restarting TU Cockpit..." });
        }
      });

      // Reload or exit for installer
      window.location.reload();
    } catch (err) {
      console.error("Installation failed:", err);
      set({
        isInstalling: false,
        statusMessage: `Failed to install update: ${err instanceof Error ? err.message : String(err)}`,
      });
      setTimeout(() => set({ statusMessage: null }), 6000);
    }
  },

  dismissUpdate: () => set({ availableUpdate: null, newVersion: null, statusMessage: null }),
}));
