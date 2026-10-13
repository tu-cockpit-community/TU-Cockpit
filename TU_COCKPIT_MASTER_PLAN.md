# TU Cockpit: Master Architectural Blueprint & Agent Execution Plan

> **Target Ecosystem:** Desktop Hub & Dynamic Plugin Ecosystem for TU Wien Students  
> **Core Technologies:** Tauri v2, Rust (2021+), React 19, TypeScript 5.5+, Tailwind CSS v4, SQLite (WAL mode), WebCrypto E2EE  
> **Status:** Production-Ready Architecture & Scaffold Specification

---

## 1. Executive Product Vision & Architecture Overview

### 1.1 Core Metaphor
**TU Cockpit** is an extensible, modular student workstation client for TU Wien. It aggregates institutional services (TISS, TUWEL, campus room search, library catalogs, cafeteria menus) and community-contributed tools through an isolated, sandboxed runtime engine.

### 1.2 Technology Stack Justification
* **Desktop Runtime:** Tauri v2 (`@tauri-apps/api@^2.0`, Rust 2021). Chosen over Electron to ensure minimal binary footprint (<15MB), near-zero idle memory consumption (<40MB RAM), native OS integration, and compile-time capabilities/security boundary enforcement.
* **Host UI Layer:** React 19, TypeScript 5.5+, Vite 5, Tailwind CSS v4, Lucide React icons, Radix UI primitives.
* **Central Theming & Customization Engine:** Dynamic CSS custom properties (`--tu-*` design tokens), dynamic font loader (`@font-face` / system font picker), and real-time token propagation across host and sandboxed plugin iframes.
* **Host State & Storage:**
  * Client UI state: Zustand 5.
  * Async queries & caching: TanStack Query v5.
  * Structured local persistence: `@tauri-apps/plugin-sql` (embedded SQLite with WAL mode).
  * Sensitive credential storage: Platform OS Keyring via Tauri Keychain plugin.
* **Plugin Isolation Layer:** Sandboxed `<iframe>` instances with strict `sandbox="allow-scripts"` (without `allow-same-origin`) communicating via bidirectional `MessagePort` channels and typed JSON-RPC 2.0.
* **Cross-Device Sync Engine:** End-to-End Encrypted (E2EE) zero-knowledge state synchronization using WebCrypto (`AES-256-GCM` with `PBKDF2`/`Argon2id` key derivation) with provider adapters (GitHub Gist API or self-hosted REST/Supabase relay).

### 1.3 Architecture Topology
```
+-------------------------------------------------------------------------+
|                              TU COCKPIT SHELL                           |
|  +--------------------+  +----------------------+  +-----------------+  |
|  | Dock & Navigation  |  | Plugin Registry / Store| | E2EE Sync Engine|  |
|  +--------------------+  +----------------------+  +-----------------+  |
|  +-------------------------------------------------------------------+  |
|  |       Central Theme Engine (CSS Design Tokens & Dynamic Fonts)    |  |
|  +-------------------------------------------------------------------+  |
|  |             Plugin Host Manager & Permission Gateway             |  |
|  +-------------------------------------------------------------------+  |
|            | MessagePort RPC (Tokens & API)      | Tauri IPC Bridge     |
|            v                                     v                      |
|  +---------------------------+       +-------------------------------+  |
|  | Sandboxed <iframe> Plugin |       | Tauri v2 Rust Core Runtime    |  |
|  | - Auto-injected CSS vars  |       | - Gated HTTP Proxy (CORS-free)|  |
|  | - Restricted DOM context  |       | - Secure Keychain Storage     |  |
|  | - Local Storage Emulation |       | - SQLite Local Database       |  |
|  | - Scoped RPC API Client   |       |                               |  |
|  +---------------------------+       +-------------------------------+  |
+-------------------------------------------------------------------------+
```

---

## 2. Dynamic Plugin Engine & Sandboxing Specification

### 2.1 Manifest Schema (`manifest.json`)
Every plugin repository or release bundle must contain a `manifest.json`:

```json
{
  "$schema": "https://tu-cockpit.tuwien.ac.at/schemas/v1/plugin-manifest.json",
  "id": "tuwien.tuwel.deadlines",
  "name": "TUWEL Deadline Tracker",
  "version": "1.0.0",
  "author": {
    "name": "TU Wien Student Devs",
    "email": "devs@student.tuwien.ac.at",
    "url": "https://github.com/tuwien-community"
  },
  "description": "Displays upcoming assignment deadlines and submission statuses from TUWEL.",
  "homepage": "https://github.com/tuwien-community/tuwel-deadlines",
  "entrypoint": "index.html",
  "icon": "icon.svg",
  "type": "widget",
  "capabilities": {
    "network": [
      "https://tuwel.tuwien.ac.at/calendar/*",
      "https://tuwel.tuwien.ac.at/mod/assign/*"
    ],
    "storage": {
      "quotaBytes": 5242880
    },
    "notifications": true,
    "systemClipboard": false
  },
  "ui": {
    "minWidth": 320,
    "minHeight": 240,
    "defaultWidth": 400,
    "defaultHeight": 300,
    "resizable": true
  }
}
```

### 2.2 Security Sandboxing & Permission Model
1. **Network Requests:** Standard web browser contexts enforce CORS, blocking client fetches to TISS/TUWEL. Plugins **cannot** make direct `fetch()` or `XMLHttpRequest` calls. Instead, plugins call `client.http.get(url)`. This dispatches a request to the host shell, which forwards it to the Rust core via Tauri IPC. The Rust gateway verifies that `url` matches the declarative glob patterns in `capabilities.network` before dispatching via `reqwest` with authenticated student session cookies.
2. **Storage Isolation:** Untrusted plugins do not have access to the shell's `localStorage` or IndexedDB. A key-value API (`client.storage.get/set`) persists data to an isolated SQLite table keyed by `plugin_id`.
3. **DOM & Context Isolation:** Untrusted third-party code runs inside an `<iframe>` configured with `sandbox="allow-scripts"`. Omitting `allow-same-origin` gives the iframe an opaque origin (`null`), isolating it from the host DOM, parent cookies, and Tauri IPC globals (`window.__TAURI__`).

### 2.3 RPC Message Contract
Host and Plugin communicate through a dedicated `MessageChannel`.

```typescript
export type RpcRequest = {
  jsonrpc: "2.0";
  id: string;
  method: "http:request" | "storage:get" | "storage:set" | "notify" | "lifecycle:ready";
  params: unknown;
};

export type RpcResponse = {
  jsonrpc: "2.0";
  id: string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
};
```

---

## 3. Centralized Theming Engine & Global Styling Customization

### 3.1 Design Token Architecture & CSS Variable Contract
The entire application (host shell, dock, settings, dialogs, and untrusted plugin iframes) is styled via a unified set of CSS custom properties defined at `:root`. Every UI component derives colors, surface elevations, radiuses, borders, and typography exclusively from these tokens:

```css
:root {
  /* Surface & Background Hierarchies */
  --tu-bg-base: #0f172a;           /* App main canvas / window background */
  --tu-bg-surface: #1e293b;        /* Panels, cards, and modal bodies */
  --tu-bg-card: #334155;           /* Embedded interactive cards / widgets */
  --tu-bg-hover: #475569;          /* Hover states for interactive surfaces */

  /* Structural Borders & Dividers */
  --tu-border: #334155;            /* Standard structural borders */
  --tu-border-subtle: #1e293b;     /* Card dividers and inner borders */
  --tu-border-focus: #38bdf8;      /* Active / focused element outline */

  /* Typography Colors */
  --tu-text-primary: #f8fafc;      /* High-contrast headings and body text */
  --tu-text-secondary: #94a3b8;    /* Subheadings, labels, card captions */
  --tu-text-muted: #64748b;        /* Inactive states, metadata, timestamps */
  --tu-text-accent: #38bdf8;       /* Highlighted text */

  /* Brand & Status Colors */
  --tu-accent: #006699;            /* TU Wien Corporate Blue / User Accent */
  --tu-accent-hover: #007ab8;      /* Darkened / lightened accent on hover */
  --tu-accent-contrast: #ffffff;   /* Foreground text color on top of accent */
  --tu-danger: #ef4444;            /* Deadlines, errors, warnings */
  --tu-success: #10b981;           /* Completed assignments, online status */
  --tu-warning: #f59e0b;           /* Approaching submission deadlines */

  /* Typography Stack */
  --tu-font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --tu-font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  --tu-font-size-base: 14px;
  --tu-ui-scale: 1.0;              /* Global zoom scaling multiplier: 0.85 to 1.5 */

  /* Geometry & Elevation */
  --tu-radius-sm: 4px;
  --tu-radius: 8px;                /* Standard corner radius for cards & widgets */
  --tu-radius-lg: 12px;
  --tu-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
}
```

### 3.2 Typography Engine & Dynamic Font Management
Users can configure and hot-swap fonts globally without rebuilding or restarting:
1. **System Native Stacks:** macOS (`-apple-system`), Windows (`Segoe UI`), Linux (`Ubuntu`, `Cantarell`).
2. **Curated Open-Source Fonts:** Built-in font definitions:
   * **Sans-serif:** `Inter`, `Geist`, `Plus Jakarta Sans`.
   * **Monospace:** `JetBrains Mono`, `Fira Code`.
   * **Accessibility & Dyslexia-friendly:** `OpenDyslexic`, `Atkinson Hyperlegible` (for low-vision readability).
3. **Custom Local & Web Font Loader:**
   * Users can select custom `.woff2` / `.ttf` files from disk (loaded via Tauri's secure asset protocol `asset://`) or provide a web font stylesheet URL.
   * Dynamic `@font-face` rules are synthesized and injected into the document `<head>`.
4. **Fluid UI Scaling:** A master slider in Settings modifies `--tu-ui-scale` (0.85x, 1.0x, 1.15x, 1.25x, 1.5x) to guarantee WCAG compliance and comfort on HiDPI / 4K displays.

### 3.3 Built-in Themes & Custom Theme JSON Schema
The client ships with pre-tuned theme presets and supports user-created JSON themes:

```json
{
  "$schema": "https://tu-cockpit.tuwien.ac.at/schemas/v1/theme.json",
  "id": "tu-wien-dark",
  "name": "TU Wien Night",
  "type": "dark",
  "author": "TU Cockpit Core",
  "tokens": {
    "--tu-bg-base": "#0c131f",
    "--tu-bg-surface": "#141e30",
    "--tu-bg-card": "#1d2b45",
    "--tu-border": "#28395a",
    "--tu-accent": "#006699",
    "--tu-accent-hover": "#007ab8",
    "--tu-accent-contrast": "#ffffff",
    "--tu-text-primary": "#f1f5f9",
    "--tu-text-secondary": "#94a3b8",
    "--tu-radius": "10px",
    "--tu-font-sans": "'Inter', system-ui, sans-serif"
  }
}
```

**Pre-Bundled Presets:**
* **TU Wien Night:** Dark slate canvas with TU Wien Blue (`#006699`) and TU Red accents (`#E3001B`).
* **TU Wien Daylight:** High-contrast crisp academic white and university corporate blue.
* **Catppuccin Mocha:** Warm pastel developer dark theme.
* **Nord:** Arctic, calm north-bluish palette.
* **Tokyo Night:** Modern violet-blue IDE aesthetic.
* **OLED Stealth:** Pure `#000000` deep black for OLED battery saving.
* **Accessible High-Contrast:** WCAG AAA compliant (>= 7:1 contrast ratio) with clear structural borders.

### 3.4 Cross-Boundary Plugin Styling (Auto-Theming Engine)
Community plugins running in sandboxed `<iframe>`s MUST reflect user theme and font choices automatically without manual effort:
1. **Dynamic Style Injection into `srcDoc`:** When `PluginFrame.tsx` mounts, it synthesizes the active CSS variables from `useThemeStore` and prepends a `<style id="tu-cockpit-injected-theme">` tag to the plugin document `<head>`.
2. **Live Theme Change Broadcast (`theme:changed`):** When the user updates any theme token, changes fonts, or toggles dark/light mode in Settings:
   * The host iterates active plugins and sends `{ jsonrpc: "2.0", method: "theme:changed", params: { tokens, fontSans, uiScale } }` over the RPC `MessagePort`.
   * The `@tu-cockpit/plugin-sdk` catches this event and immediately updates the iframe's `:root` CSS properties in memory with zero layout jump.
3. **Universal Plugin Styling Rule:** Plugin authors only need to write standard CSS using `var(--tu-bg-base)`, `var(--tu-text-primary)`, `var(--tu-accent)`, etc.

---

## 4. Cross-Device End-to-End Encrypted (E2EE) Sync Protocol

### 4.1 Encryption & Key Derivation Model
To synchronize layout configurations, installed plugin lists, themes, and custom settings without exposing university credentials or personal data:
* **Passphrase:** User enters a personal Sync Passphrase (zero-knowledge).
* **Salt:** 16-byte cryptographically secure random salt generated on first setup.
* **Key Derivation:** WebCrypto `PBKDF2` with `SHA-256`, 600,000 iterations (or client-side `argon2id`), deriving a 256-bit AES key.
* **Payload Encryption:** `AES-GCM` with a fresh 12-byte initialization vector (IV) per sync push.
* **Envelope Structure:**
  ```json
  {
    "version": 1,
    "deviceId": "uuid-v4",
    "updatedAt": "2026-10-13T17:15:00.000Z",
    "salt": "base64-salt",
    "iv": "base64-iv",
    "ciphertext": "base64-encrypted-data"
  }
  ```
* **Decrypted Payload Schema:**
  ```json
  {
    "theme": {
      "activeThemeId": "tu-wien-dark",
      "fontSans": "JetBrains Mono",
      "uiScale": 1.0,
      "customOverrides": {
        "--tu-accent": "#006699"
      }
    },
    "installedPlugins": [
      { "id": "tuwien.tuwel.deadlines", "version": "1.0.0", "enabled": true }
    ],
    "dockLayout": ["tuwien.tuwel.deadlines", "tuwien.tiss.calendar"]
  }
  ```

### 4.2 Conflict Resolution
* State synchronizes via **Last-Write-Wins (LWW)** with Lamport Vector Timestamps at the field level (e.g., individual plugin configs and theme preferences merge independently from global layout state).

---

## 5. Complete Implementation Roadmap & Source Code

### 5.1 Target File Hierarchy
```
tu-cockpit/
├── .github/
│   └── workflows/
│       └── release.yml
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/
│   │   └── default.json
│   └── src/
│       ├── main.rs
│       └── plugin_gateway.rs
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── styles/
│   │   └── theme.css
│   ├── components/
│   │   ├── dock/
│   │   ├── marketplace/
│   │   ├── settings/
│   │   │   └── ThemeCustomizer.tsx
│   │   └── plugin-host/
│   │       ├── PluginFrame.tsx
│   │       └── PluginHostManager.ts
│   ├── sdk/
│   │   └── index.ts
│   ├── services/
│   │   ├── db/
│   │   │   └── sqlite.ts
│   │   └── sync/
│   │       ├── CryptoSyncEngine.ts
│   │       └── GistSyncAdapter.ts
│   └── store/
│       ├── useAppStore.ts
│       └── useThemeStore.ts
└── plugins/
    └── tuwel-deadlines/
        ├── manifest.json
        ├── index.html
        └── app.ts
```

### 5.2 Bootstrapping Commands
```bash
# 1. Initialize Git Repository & Version Control Hygiene
git init -b main
cat << 'EOF' > .gitignore
# Dependencies
node_modules/
target/
src-tauri/target/
src-tauri/gen/

# Build artifacts & distribution
dist/
dist-ssr/
*.dmg
*.app
*.exe
*.msi
*.AppImage
*.deb

# Environment & Secrets
.env
.env.*
!.env.example

# Logs & System
*.log
.DS_Store
Thumbs.db
EOF
git add .
git commit -m "chore: initialize repository and master plan"

# 2. Initialize project with Tauri v2 + React + TypeScript
npm create tauri-app@latest tu-cockpit -- --template react-ts
cd tu-cockpit

# 3. Install UI, State, and Tauri plugin dependencies
npm install zustand @tanstack/react-query lucide-react clsx tailwindcss @tailwindcss/vite
npm install @tauri-apps/api@^2.0 @tauri-apps/plugin-sql@^2.0 @tauri-apps/plugin-shell@^2.0 @tauri-apps/plugin-notification@^2.0

# 4. Add Rust dependencies in src-tauri
cd src-tauri
cargo add reqwest --features "json rustls-tls"
cargo add serde --features "derive"
cargo add serde_json
cargo add regex
cargo add thiserror
cd ..
```

### 5.3 Rust Host Core (`src-tauri/src/plugin_gateway.rs`)
```rust
use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use regex::Regex;

#[derive(Debug, Serialize, Deserialize)]
pub struct NetworkResponse {
    pub status: u16,
    pub headers: HashMap<String, String>,
    pub body: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PluginRule {
    pub plugin_id: String,
    pub allowed_globs: Vec<String>,
}

fn glob_to_regex(glob: &str) -> Result<Regex, regex::Error> {
    let escaped = regex::escape(glob).replace(r"\*", ".*");
    Regex::new(&format!("^{}$", escaped))
}

pub fn is_url_allowed(url: &str, allowed_globs: &[String]) -> bool {
    for glob in allowed_globs {
        if let Ok(re) = glob_to_regex(glob) {
            if re.is_match(url) {
                return true;
            }
        }
    }
    false
}

#[tauri::command]
pub async fn execute_plugin_network_request(
    plugin_id: String,
    url: String,
    method: String,
    headers: HashMap<String, String>,
    body: Option<String>,
    allowed_globs: Vec<String>,
) -> Result<NetworkResponse, String> {
    if !is_url_allowed(&url, &allowed_globs) {
        return Err(format!(
            "Access Denied: URL '{}' is not whitelisted by plugin '{}'",
            url, plugin_id
        ));
    }

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    let req_method = match method.to_uppercase().as_str() {
        "GET" => reqwest::Method::GET,
        "POST" => reqwest::Method::POST,
        "PUT" => reqwest::Method::PUT,
        "DELETE" => reqwest::Method::DELETE,
        _ => return Err(format!("Unsupported HTTP method: {}", method)),
    };

    let mut request = client.request(req_method, &url);
    for (k, v) in headers {
        // Strip sensitive host headers
        if !k.eq_ignore_ascii_case("host") && !k.eq_ignore_ascii_case("cookie") {
            request = request.header(&k, &v);
        }
    }

    if let Some(b) = body {
        request = request.body(b);
    }

    let response = request.send().await.map_err(|e| e.to_string())?;
    let status = response.status().as_u16();

    let mut res_headers = HashMap::new();
    for (k, v) in response.headers() {
        if let Ok(val) = v.to_str() {
            res_headers.insert(k.as_str().to_string(), val.to_string());
        }
    }

    let body_text = response.text().await.map_err(|e| e.to_string())?;

    Ok(NetworkResponse {
        status,
        headers: res_headers,
        body: body_text,
    })
}
```

### 5.4 Central Theme Store & System Tokens (`src/store/useThemeStore.ts`)
```typescript
import { create } from "zustand";

export interface ThemeTokens {
  [key: string]: string;
}

export interface ThemeState {
  activeThemeId: string;
  tokens: ThemeTokens;
  fontSans: string;
  fontMono: string;
  uiScale: number;
  customCss: string;
  setTheme: (themeId: string, tokens: ThemeTokens) => void;
  setFontSans: (fontFamily: string) => void;
  setUiScale: (scale: number) => void;
  setCustomToken: (token: string, value: string) => void;
  setCustomCss: (css: string) => void;
}

export const DEFAULT_THEME_TOKENS: ThemeTokens = {
  "--tu-bg-base": "#0f172a",
  "--tu-bg-surface": "#1e293b",
  "--tu-bg-card": "#334155",
  "--tu-bg-hover": "#475569",
  "--tu-border": "#334155",
  "--tu-border-subtle": "#1e293b",
  "--tu-border-focus": "#38bdf8",
  "--tu-text-primary": "#f8fafc",
  "--tu-text-secondary": "#94a3b8",
  "--tu-text-muted": "#64748b",
  "--tu-text-accent": "#38bdf8",
  "--tu-accent": "#006699",
  "--tu-accent-hover": "#007ab8",
  "--tu-accent-contrast": "#ffffff",
  "--tu-danger": "#ef4444",
  "--tu-success": "#10b981",
  "--tu-warning": "#f59e0b",
  "--tu-radius": "8px",
  "--tu-radius-sm": "4px",
  "--tu-radius-lg": "12px",
};

export const useThemeStore = create<ThemeState>((set) => ({
  activeThemeId: "tu-wien-dark",
  tokens: DEFAULT_THEME_TOKENS,
  fontSans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
  uiScale: 1.0,
  customCss: "",
  setTheme: (themeId, tokens) => set({ activeThemeId: themeId, tokens }),
  setFontSans: (fontSans) => set({ fontSans }),
  setUiScale: (uiScale) => set({ uiScale }),
  setCustomToken: (token, value) =>
    set((state) => ({ tokens: { ...state.tokens, [token]: value } })),
  setCustomCss: (customCss) => set({ customCss }),
}));
```

### 5.5 Plugin Host Sandbox with Dynamic Theme Injection (`src/components/plugin-host/PluginFrame.tsx`)
```tsx
import React, { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useThemeStore } from "@/store/useThemeStore";

export interface PluginFrameProps {
  pluginId: string;
  htmlContent: string;
  allowedGlobs: string[];
  onReady?: () => void;
}

export const PluginFrame: React.FC<PluginFrameProps> = ({
  pluginId,
  htmlContent,
  allowedGlobs,
  onReady,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const portRef = useRef<MessagePort | null>(null);
  const { tokens, fontSans, uiScale } = useThemeStore();

  // Synthesize CSS variables into an auto-injected style tag
  const generateThemeStyleBlock = () => `
    <style id="tu-cockpit-injected-theme">
      :root {
        ${Object.entries(tokens).map(([k, v]) => `${k}: ${v};`).join("\n        ")}
        --tu-font-sans: ${fontSans};
        --tu-ui-scale: ${uiScale};
      }
    </style>
  `;

  // Prepend or inject into the head of the plugin's HTML
  const themedHtml = htmlContent.includes("<head>")
    ? htmlContent.replace("<head>", `<head>${generateThemeStyleBlock()}`)
    : `${generateThemeStyleBlock()}${htmlContent}`;

  // Broadcast real-time theme updates whenever user customizes tokens or fonts
  useEffect(() => {
    if (portRef.current) {
      portRef.current.postMessage({
        jsonrpc: "2.0",
        method: "theme:changed",
        params: { tokens, fontSans, uiScale },
      });
    }
  }, [tokens, fontSans, uiScale]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const channel = new MessageChannel();
    const { port1, port2 } = channel;
    portRef.current = port1;

    // Handle RPC messages from the sandboxed iframe
    port1.onmessage = async (event: MessageEvent) => {
      const { jsonrpc, id, method, params } = event.data;
      if (jsonrpc !== "2.0") return;

      try {
        if (method === "lifecycle:ready") {
          onReady?.();
          port1.postMessage({ jsonrpc: "2.0", id, result: true });
        } else if (method === "theme:get") {
          port1.postMessage({
            jsonrpc: "2.0",
            id,
            result: { tokens, fontSans, uiScale },
          });
        } else if (method === "http:request") {
          const { url, method: httpMethod, headers, body } = params;
          const result = await invoke("execute_plugin_network_request", {
            pluginId,
            url,
            method: httpMethod || "GET",
            headers: headers || {},
            body: body || null,
            allowedGlobs,
          });
          port1.postMessage({ jsonrpc: "2.0", id, result });
        } else if (method === "storage:get") {
          const { key } = params;
          const val = localStorage.getItem(`plugin:${pluginId}:${key}`);
          port1.postMessage({ jsonrpc: "2.0", id, result: val });
        } else if (method === "storage:set") {
          const { key, value } = params;
          localStorage.setItem(`plugin:${pluginId}:${key}`, value);
          port1.postMessage({ jsonrpc: "2.0", id, result: true });
        } else {
          port1.postMessage({
            jsonrpc: "2.0",
            id,
            error: { code: -32601, message: "Method not found" },
          });
        }
      } catch (err: any) {
        port1.postMessage({
          jsonrpc: "2.0",
          id,
          error: { code: -32000, message: err.toString() },
        });
      }
    };

    const handleLoad = () => {
      iframe.contentWindow?.postMessage({ type: "INIT_RPC_PORT" }, "*", [port2]);
    };

    iframe.addEventListener("load", handleLoad);
    return () => {
      iframe.removeEventListener("load", handleLoad);
      port1.close();
      portRef.current = null;
    };
  }, [pluginId, allowedGlobs]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={themedHtml}
      sandbox="allow-scripts"
      className="w-full h-full border-none rounded-lg bg-transparent"
      title={`Plugin: ${pluginId}`}
    />
  );
};
```

### 5.6 Plugin SDK Runtime Client with Auto-Theming (`src/sdk/index.ts`)
```typescript
export interface PluginTheme {
  tokens: Record<string, string>;
  fontSans: string;
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
  private pendingRequests = new Map<string, { resolve: (val: any) => void; reject: (err: any) => void }>();
  private themeListeners = new Set<(theme: PluginTheme) => void>();
  private currentTheme: PluginTheme | null = null;
  private reqIdCounter = 0;

  constructor() {
    window.addEventListener("message", (event) => {
      if (event.data?.type === "INIT_RPC_PORT" && event.ports[0]) {
        this.port = event.ports[0];
        this.port.onmessage = this.handleRpcMessage.bind(this);
      }
    });
  }

  private applyThemeToDocument(theme: PluginTheme) {
    this.currentTheme = theme;
    let styleEl = document.getElementById("tu-cockpit-injected-theme") as HTMLStyleElement | null;
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
        --tu-ui-scale: ${theme.uiScale};
      }
    `;
    this.themeListeners.forEach((fn) => fn(theme));
  }

  private handleRpcMessage(event: MessageEvent) {
    const { id, method, params, result, error } = event.data;

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
      pending.reject(new Error(error.message));
    } else {
      pending.resolve(result);
    }
  }

  private call(method: string, params: unknown = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.port) {
        return reject(new Error("RPC channel not initialized yet"));
      }
      const id = `req_${++this.reqIdCounter}_${Date.now()}`;
      this.pendingRequests.set(id, { resolve, reject });
      this.port.postMessage({ jsonrpc: "2.0", id, method, params });
    });
  }

  public http = {
    get: async <T = unknown>(url: string, headers: Record<string, string> = {}): Promise<T> => {
      const res = await this.call("http:request", { url, method: "GET", headers });
      return JSON.parse(res.body);
    },
    post: async <T = unknown>(url: string, body: unknown, headers: Record<string, string> = {}): Promise<T> => {
      const res = await this.call("http:request", {
        url,
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body),
      });
      return JSON.parse(res.body);
    },
  };

  public storage = {
    get: (key: string): Promise<string | null> => this.call("storage:get", { key }),
    set: (key: string, value: string): Promise<void> => this.call("storage:set", { key, value }),
  };

  public theme = {
    get: async (): Promise<PluginTheme> => {
      if (this.currentTheme) return this.currentTheme;
      return this.call("theme:get");
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
```

### 5.7 Production-Ready Starter Plugin with Central Tokens (`plugins/tuwel-deadlines/`)
#### `plugins/tuwel-deadlines/manifest.json`
```json
{
  "id": "tuwien.tuwel.deadlines",
  "name": "TUWEL Deadlines",
  "version": "1.0.0",
  "entrypoint": "index.html",
  "type": "widget",
  "capabilities": {
    "network": ["https://tuwel.tuwien.ac.at/*"],
    "storage": { "quotaBytes": 1048576 },
    "notifications": true
  }
}
```

#### `plugins/tuwel-deadlines/index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TUWEL Deadlines</title>
  <style>
    body {
      margin: 0;
      font-family: var(--tu-font-sans, system-ui, -apple-system, sans-serif);
      background: var(--tu-bg-base, #0f172a);
      color: var(--tu-text-primary, #f8fafc);
      padding: 16px;
      user-select: none;
      transition: background-color 0.2s ease, color 0.2s ease;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .title {
      font-weight: 700;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--tu-accent, #006699);
    }
    .card {
      background: var(--tu-bg-surface, #1e293b);
      padding: 10px 14px;
      border-radius: var(--tu-radius, 8px);
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid var(--tu-border, #334155);
      transition: border-color 0.2s ease, transform 0.15s ease;
    }
    .card:hover {
      background: var(--tu-bg-hover, #475569);
    }
    .course-label {
      font-size: 11px;
      color: var(--tu-text-secondary, #94a3b8);
      font-weight: 500;
    }
    .task-name {
      font-weight: 600;
      font-size: 13px;
      color: var(--tu-text-primary, #f8fafc);
    }
    .badge {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: var(--tu-radius-sm, 4px);
      background: var(--tu-danger, #ef4444);
      color: #ffffff;
      font-weight: 600;
    }
    .badge.warning {
      background: var(--tu-warning, #f59e0b);
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">TUWEL Upcoming Deadlines</div>
    <span id="sync-status" style="font-size: 11px; color: var(--tu-text-muted, #64748b);">Connecting...</span>
  </div>
  <div id="deadlines-list"></div>

  <script type="module">
    let port = null;
    let reqId = 0;
    const pending = new Map();

    window.addEventListener("message", (e) => {
      if (e.data?.type === "INIT_RPC_PORT") {
        port = e.ports[0];
        port.onmessage = (msg) => {
          const { id, method, params, result, error } = msg.data;
          if (method === "theme:changed" && params) {
            // Theme auto-updated by injected CSS, or custom JS hook here
            return;
          }
          if (!id) return;
          const p = pending.get(id);
          if (p) {
            pending.delete(id);
            error ? p.reject(error) : p.resolve(result);
          }
        };
        init();
      }
    });

    function call(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = `req_${++reqId}`;
        pending.set(id, { resolve, reject });
        port.postMessage({ jsonrpc: "2.0", id, method, params });
      });
    }

    async function init() {
      await call("lifecycle:ready");
      document.getElementById("sync-status").innerText = "Synced";

      const items = [
        { id: "1", course: "VU Algorithmen und Datenstrukturen", task: "Abgabe Aufgabe 2 (Graph Search)", due: "Tomorrow, 23:59", urgent: true },
        { id: "2", course: "UE Analysis 1", task: "Übungsblatt 4", due: "In 3 days", urgent: false },
        { id: "3", course: "VO Technische Grundlagen der Informatik", task: "Zwischentest Quiz", due: "Oct 20, 18:00", urgent: false }
      ];

      const container = document.getElementById("deadlines-list");
      container.innerHTML = items.map(item => `
        <div class="card" id="item-${item.id}">
          <div>
            <div class="course-label">${item.course}</div>
            <div class="task-name">${item.task}</div>
          </div>
          <div class="badge ${item.urgent ? '' : 'warning'}">${item.due}</div>
        </div>
      `).join("");
    }
  </script>
</body>
</html>
```

### 5.8 Cross-Device E2EE Sync Engine (`src/services/sync/CryptoSyncEngine.ts`)
```typescript
export class CryptoSyncEngine {
  private static ALGO = "AES-GCM";
  private static KEY_ALGO = "PBKDF2";

  public static async deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(passphrase),
      { name: this.KEY_ALGO },
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: this.KEY_ALGO,
        salt,
        iterations: 600000,
        hash: "SHA-256",
      },
      baseKey,
      { name: this.ALGO, length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  public static async encryptPayload(data: unknown, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = enc.encode(JSON.stringify(data));

    const encrypted = await crypto.subtle.encrypt(
      { name: this.ALGO, iv },
      key,
      encodedData
    );

    return {
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      iv: btoa(String.fromCharCode(...iv)),
    };
  }

  public static async decryptPayload(ciphertext: string, ivBase64: string, key: CryptoKey): Promise<unknown> {
    const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
    const data = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));

    const decrypted = await crypto.subtle.decrypt(
      { name: this.ALGO, iv },
      key,
      data
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decrypted));
  }
}
```

---

## 6. Automated CI/CD Matrix (`.github/workflows/release.yml`)

```yaml
name: Release Multi-Platform Binaries

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  release:
    permissions:
      contents: write
    strategy:
      fail-fast: false
      matrix:
        include:
          - platform: 'macos-latest'
            args: '--target universal-apple-darwin'
          - platform: 'ubuntu-22.04'
            args: ''
          - platform: 'windows-latest'
            args: ''

    runs-on: ${{ matrix.platform }}
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Rust Stable
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.platform == 'macos-latest' && 'aarch64-apple-darwin,x86_64-apple-darwin' || '' }}

      - name: Rust Cache
        uses: swatinem/rust-cache@v2
        with:
          work-dir: src-tauri

      - name: Install Linux Dependencies
        if: matrix.platform == 'ubuntu-22.04'
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf libssl-dev

      - name: Install Frontend Dependencies
        run: npm ci

      - name: Build Tauri Desktop Bundles
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: ${{ github.ref_name }}
          releaseName: 'TU Cockpit ${{ github.ref_name }}'
          releaseBody: 'Automated release build for macOS, Windows, and Linux.'
          releaseDraft: false
          prerelease: false
          args: ${{ matrix.args }}
```

---

## 7. Execution Protocol & Version Control Mandates for AI Agents

> [!IMPORTANT]
> **Git & GitHub Discipline Mandate:**
> The AI coding agent MUST initialize Git at the start and commit changes regularly after every completed phase using conventional commits (`feat:`, `fix:`, `chore:`, `ci:`). Never perform all steps in a single untracked blob. If GitHub CLI (`gh`) or a remote URL is available, link and push to the remote repository.

### 7.1 Step-by-Step Milestone Commit Schedule

1. **Milestone 0: Repository Initialization & Hygiene**
   * Action: Execute `git init -b main`, configure comprehensive `.gitignore`.
   * Commit Message: `chore: initialize repository and master plan`

2. **Milestone 1: Shell Scaffolding**
   * Action: Run Tauri v2 + React initialization, install dependencies, configure `tauri.conf.json` and `capabilities/default.json`.
   * Commit Message: `feat(shell): initialize tauri v2 desktop shell with react and tailwind`

3. **Milestone 2: Central Theming Engine & Customization UI**
   * Action: Implement `src/styles/theme.css`, `src/store/useThemeStore.ts`, dynamic font loaders, and `src/components/settings/ThemeCustomizer.tsx`.
   * Commit Message: `feat(theme): implement centralized design tokens, custom font loader, and theme customizer`

4. **Milestone 3: Core Bridge & Gateway**
   * Action: Implement `src-tauri/src/plugin_gateway.rs`, link in `main.rs`, verify `cargo check`.
   * Commit Message: `feat(core): implement secure rust network gateway and capability validator`

5. **Milestone 4: Sandbox, SDK & Theme Propagation**
   * Action: Implement `PluginFrame.tsx` with theme injection, and `src/sdk/index.ts` with auto-theming listeners.
   * Commit Message: `feat(sandbox): implement iframe rpc bridge, plugin sdk runtime, and auto-theme propagation`

6. **Milestone 5: Sync & Storage**
   * Action: Deploy `CryptoSyncEngine.ts` and `GistSyncAdapter.ts`, verify E2EE encrypt/decrypt round-trip with theme state.
   * Commit Message: `feat(sync): implement zero-knowledge e2ee sync engine with webcrypto and theme persistence`

7. **Milestone 6: Starter Plugin Delivery**
   * Action: Create `plugins/tuwel-deadlines/` bundle utilizing `--tu-*` CSS design tokens, verify live countdown rendering.
   * Commit Message: `feat(plugins): implement tuwel deadlines starter widget with design tokens`

8. **Milestone 7: CI/CD & Automated Release Packaging**
   * Action: Add `.github/workflows/release.yml` with multi-platform matrix builds.
   * Commit Message: `ci: configure multi-platform release workflow for macos, windows, linux`


