import { useNetworkStore } from "@/store/useNetworkStore";

/**
 * Singleton service that initializes native browser network listeners
 * and orchestrates periodic background connectivity probes.
 */
export class CampusNetworkSentinel {
  private static instance: CampusNetworkSentinel | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private initialized = false;

  private constructor() {}

  public static getInstance(): CampusNetworkSentinel {
    if (!CampusNetworkSentinel.instance) {
      CampusNetworkSentinel.instance = new CampusNetworkSentinel();
    }
    return CampusNetworkSentinel.instance;
  }

  public init() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;

    const store = useNetworkStore.getState();

    // Event listeners for instant response
    window.addEventListener("online", () => {
      store.setOnline(true);
      store.checkStatus();
    });

    window.addEventListener("offline", () => {
      store.setOnline(false);
      store.setTuwienReachable(false);
    });

    // Initial check
    store.checkStatus();

    // Background interval: poll health every 45 seconds
    this.timer = setInterval(() => {
      useNetworkStore.getState().checkStatus();
    }, 45000);
  }

  public destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.initialized = false;
  }
}
