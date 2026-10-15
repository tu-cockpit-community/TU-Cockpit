import { create } from "zustand";

export interface NetworkState {
  isOnline: boolean;
  isTuwienReachable: boolean;
  isChecking: boolean;
  lastChecked: number;
  isDismissed: boolean;
  setOnline: (online: boolean) => void;
  setTuwienReachable: (reachable: boolean) => void;
  setChecking: (checking: boolean) => void;
  setDismissed: (dismissed: boolean) => void;
  checkStatus: () => Promise<void>;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  isTuwienReachable: true,
  isChecking: false,
  lastChecked: Date.now(),
  isDismissed: false,

  setOnline: (online) => {
    // If transitioning from offline to online, reset dismissal
    if (online && !get().isOnline) {
      set({ isOnline: true, isDismissed: false });
    } else {
      set({ isOnline: online });
    }
  },

  setTuwienReachable: (reachable) => set({ isTuwienReachable: reachable }),
  setChecking: (checking) => set({ isChecking: checking }),
  setDismissed: (dismissed) => set({ isDismissed: dismissed }),

  checkStatus: async () => {
    if (typeof navigator === "undefined") return;

    if (!navigator.onLine) {
      set({ isOnline: false, isTuwienReachable: false, lastChecked: Date.now() });
      return;
    }

    set({ isChecking: true });

    try {
      // Lightweight probe to verify network reachability
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      // Probe TU Wien portal with no-cors so CORS preflight does not trigger false negative
      await fetch("https://tuwel.tuwien.ac.at/favicon.ico", {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-cache",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      set({
        isOnline: true,
        isTuwienReachable: true,
        lastChecked: Date.now(),
        isChecking: false,
      });
    } catch (err: unknown) {
      // If fetch fails but navigator says online, test general internet via reliable CDN
      try {
        const fallbackCtrl = new AbortController();
        const fallbackTimeout = setTimeout(() => fallbackCtrl.abort(), 3000);
        await fetch("https://1.1.1.1/cdn-cgi/trace", {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-cache",
          signal: fallbackCtrl.signal,
        });
        clearTimeout(fallbackTimeout);

        // General internet works, but TU Wien was unreachable
        set({
          isOnline: true,
          isTuwienReachable: false,
          lastChecked: Date.now(),
          isChecking: false,
        });
      } catch {
        // Both failed -> completely offline
        set({
          isOnline: false,
          isTuwienReachable: false,
          lastChecked: Date.now(),
          isChecking: false,
        });
      }
    }
  },
}));
