export interface PluginTheme {
  tokens: Record<string, string>;
  fontSans: string;
  fontMono: string;
  uiScale: number;
}

export interface PluginClient {
  http: {
    get: <T = unknown>(url: string, headers?: Record<string, string>) => Promise<T>;
    post: <T = unknown>(url: string, body: unknown, headers?: Record<string, string>) => Promise<T>;
  };
  storage: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
  };
  theme: {
    get: () => Promise<PluginTheme>;
    onChange: (callback: (theme: PluginTheme) => void) => () => void;
  };
  lifecycle: {
    ready: () => Promise<void>;
  };
}

class TuCockpitClient implements PluginClient {
  private port: MessagePort | null = null;
  private pendingRequests = new Map<
    string,
    { resolve: (val: any) => void; reject: (err: any) => void }
  >();
  private themeListeners = new Set<(theme: PluginTheme) => void>();
  private currentTheme: PluginTheme | null = null;
  private reqIdCounter = 0;

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("message", (event) => {
        if (event.data?.type === "INIT_RPC_PORT" && event.ports[0]) {
          this.port = event.ports[0];
          this.port.onmessage = this.handleRpcMessage.bind(this);
        }
      });
    }
  }

  private applyThemeToDocument(theme: PluginTheme) {
    this.currentTheme = theme;
    if (typeof document === "undefined") return;

    let styleEl = document.getElementById(
      "tu-cockpit-injected-theme"
    ) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "tu-cockpit-injected-theme";
      document.head.appendChild(styleEl);
    }
    const cssRules = Object.entries(theme.tokens)
      .map(([k, v]) => `${k}: ${v};`)
      .join("\n");
    styleEl.innerHTML = `
      :root {
        ${cssRules}
        --tu-font-sans: ${theme.fontSans};
        --tu-font-mono: ${theme.fontMono};
        --tu-ui-scale: ${theme.uiScale};
      }
    `;
    this.themeListeners.forEach((fn) => {
      try {
        fn(theme);
      } catch (err) {
        console.error("Theme listener error:", err);
      }
    });
  }

  private handleRpcMessage(event: MessageEvent) {
    const { id, method, params, result, error } = event.data || {};

    // Handle broadcast notifications from host
    if (method === "theme:changed" && params) {
      this.applyThemeToDocument(params as PluginTheme);
      return;
    }

    if (!id) return;
    const pending = this.pendingRequests.get(id);
    if (!pending) return;

    this.pendingRequests.delete(id);
    if (error) {
      pending.reject(new Error(error.message || "RPC Error"));
    } else {
      pending.resolve(result);
    }
  }

  private call(method: string, params: unknown = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.port) {
        return reject(
          new Error("RPC channel not initialized yet. Wait for INIT_RPC_PORT.")
        );
      }
      const id = `req_${++this.reqIdCounter}_${Date.now()}`;
      this.pendingRequests.set(id, { resolve, reject });
      this.port.postMessage({ jsonrpc: "2.0", id, method, params });
    });
  }

  public http = {
    get: async <T = unknown>(
      url: string,
      headers: Record<string, string> = {}
    ): Promise<T> => {
      const res = await this.call("http:request", { url, method: "GET", headers });
      return typeof res.body === "string" ? JSON.parse(res.body) : res.body;
    },
    post: async <T = unknown>(
      url: string,
      body: unknown,
      headers: Record<string, string> = {}
    ): Promise<T> => {
      const res = await this.call("http:request", {
        url,
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body),
      });
      return typeof res.body === "string" ? JSON.parse(res.body) : res.body;
    },
  };

  public storage = {
    get: (key: string): Promise<string | null> =>
      this.call("storage:get", { key }),
    set: (key: string, value: string): Promise<void> =>
      this.call("storage:set", { key, value }),
  };

  public theme = {
    get: async (): Promise<PluginTheme> => {
      if (this.currentTheme) return this.currentTheme;
      const t = await this.call("theme:get");
      this.currentTheme = t;
      return t;
    },
    onChange: (callback: (theme: PluginTheme) => void) => {
      this.themeListeners.add(callback);
      if (this.currentTheme) callback(this.currentTheme);
      return () => this.themeListeners.delete(callback);
    },
  };

  public lifecycle = {
    ready: (): Promise<void> => this.call("lifecycle:ready"),
  };
}

export const createPluginClient = (): PluginClient => new TuCockpitClient();
