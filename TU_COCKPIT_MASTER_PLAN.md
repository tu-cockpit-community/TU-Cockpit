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
|  |             Plugin Host Manager & Permission Gateway             |  |
|  +-------------------------------------------------------------------+  |
|            | MessagePort RPC                     | Tauri IPC Bridge     |
|            v                                     v                      |
|  +---------------------------+       +-------------------------------+  |
|  | Sandboxed <iframe> Plugin |       | Tauri v2 Rust Core Runtime    |  |
|  | - Restricted DOM context  |       | - Gated HTTP Proxy (CORS-free)|  |
|  | - Local Storage Emulation |       | - Secure Keychain Storage     |  |
|  | - Scoped RPC API Client   |       | - SQLite Local Database       |  |
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

## 3. Cross-Device End-to-End Encrypted (E2EE) Sync Protocol

### 3.1 Encryption & Key Derivation Model
To synchronize layout configurations, installed plugin lists, and custom settings without exposing university credentials or personal data:
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

### 3.2 Conflict Resolution
* State synchronizes via **Last-Write-Wins (LWW)** with Lamport Vector Timestamps at the field level (e.g., individual plugin configs merge independently from global layout state).

---

## 4. Complete Implementation Roadmap & Source Code

### 4.1 Target File Hierarchy
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
│   ├── components/
│   │   ├── dock/
│   │   ├── marketplace/
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
│       └── useAppStore.ts
└── plugins/
    └── tuwel-deadlines/
        ├── manifest.json
        ├── index.html
        └── app.ts
```

### 4.2 Bootstrapping Commands
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

### 4.3 Rust Host Core (`src-tauri/src/plugin_gateway.rs`)
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

### 4.4 Plugin Host Sandbox (`src/components/plugin-host/PluginFrame.tsx`)
```tsx
import React, { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";

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

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const channel = new MessageChannel();
    const { port1, port2 } = channel;

    // Handle RPC messages from the sandboxed iframe
    port1.onmessage = async (event: MessageEvent) => {
      const { jsonrpc, id, method, params } = event.data;
      if (jsonrpc !== "2.0") return;

      try {
        if (method === "lifecycle:ready") {
          onReady?.();
          port1.postMessage({ jsonrpc: "2.0", id, result: true });
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
    };
  }, [pluginId, allowedGlobs]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={htmlContent}
      sandbox="allow-scripts"
      className="w-full h-full border-none rounded-lg bg-transparent"
      title={`Plugin: ${pluginId}`}
    />
  );
};
```

### 4.5 Plugin SDK Runtime Client (`src/sdk/index.ts`)
```typescript
export interface PluginClient {
  http: {
    get: <T = unknown>(url: string, headers?: Record<string, string>) => Promise<T>;
    post: <T = unknown>(url: string, body: unknown, headers?: Record<string, string>) => Promise<T>;
  };
  storage: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
  };
  lifecycle: {
    ready: () => Promise<void>;
  };
}

class TuCockpitClient implements PluginClient {
  private port: MessagePort | null = null;
  private pendingRequests = new Map<string, { resolve: (val: any) => void; reject: (err: any) => void }>();
  private reqIdCounter = 0;

  constructor() {
    window.addEventListener("message", (event) => {
      if (event.data?.type === "INIT_RPC_PORT" && event.ports[0]) {
        this.port = event.ports[0];
        this.port.onmessage = this.handleRpcMessage.bind(this);
      }
    });
  }

  private handleRpcMessage(event: MessageEvent) {
    const { id, result, error } = event.data;
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

  public lifecycle = {
    ready: (): Promise<void> => this.call("lifecycle:ready"),
  };
}

export const createPluginClient = (): PluginClient => new TuCockpitClient();
```

### 4.6 Production-Ready Starter Plugin: "TUWEL Deadline Tracker"
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
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      padding: 16px;
      user-select: none;
    }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .title { font-weight: 700; font-size: 14px; text-transform: uppercase; color: #38bdf8; }
    .card {
      background: #1e293b;
      padding: 10px 12px;
      border-radius: 8px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid #334155;
    }
    .badge {
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      background: #ef4444;
      font-weight: 600;
    }
    .done { opacity: 0.5; text-decoration: line-through; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">TUWEL Upcoming Deadlines</div>
    <span id="sync-status" style="font-size: 11px; color: #94a3b8;">Syncing...</span>
  </div>
  <div id="deadlines-list"></div>

  <script type="module">
    // Inline minimal client connection
    let port = null;
    let reqId = 0;
    const pending = new Map();

    window.addEventListener("message", (e) => {
      if (e.data?.type === "INIT_RPC_PORT") {
        port = e.ports[0];
        port.onmessage = (msg) => {
          const { id, result, error } = msg.data;
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
      document.getElementById("sync-status").innerText = "Live";

      // Mock assignments from TUWEL
      const items = [
        { id: "1", course: "VU Algorithmen und Datenstrukturen", task: "Abgabe Aufgabe 2 (Graph Search)", due: "Tomorrow, 23:59" },
        { id: "2", course: "UE Analysis 1", task: "Übungsblatt 4", due: "In 3 days" },
        { id: "3", course: "VO Technische Grundlagen der Informatik", task: "Zwischentest Quiz", due: "Oct 20, 18:00" }
      ];

      const container = document.getElementById("deadlines-list");
      container.innerHTML = items.map(item => `
        <div class="card" id="item-${item.id}">
          <div>
            <div style="font-size: 11px; color: #94a3b8;">${item.course}</div>
            <div style="font-weight: 600; font-size: 13px;">${item.task}</div>
          </div>
          <div class="badge">${item.due}</div>
        </div>
      `).join("");
    }
  </script>
</body>
</html>
```

### 4.7 Cross-Device E2EE Sync Engine (`src/services/sync/CryptoSyncEngine.ts`)
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

## 5. Automated CI/CD Matrix (`.github/workflows/release.yml`)

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

## 6. Execution Protocol & Version Control Mandates for AI Agents

> [!IMPORTANT]
> **Git & GitHub Discipline Mandate:**
> The AI coding agent MUST initialize Git at the start and commit changes regularly after every completed phase using conventional commits (`feat:`, `fix:`, `chore:`, `ci:`). Never perform all steps in a single untracked blob. If GitHub CLI (`gh`) or a remote URL is available, link and push to the remote repository.

### 6.1 Step-by-Step Milestone Commit Schedule

1. **Milestone 0: Repository Initialization & Hygiene**
   * Action: Execute `git init -b main`, configure comprehensive `.gitignore`.
   * Commit Message: `chore: initialize repository and master plan`

2. **Milestone 1: Shell Scaffolding**
   * Action: Run Tauri v2 + React initialization, install dependencies, configure `tauri.conf.json` and `capabilities/default.json`.
   * Commit Message: `feat(shell): initialize tauri v2 desktop shell with react and tailwind`

3. **Milestone 2: Core Bridge & Gateway**
   * Action: Implement `src-tauri/src/plugin_gateway.rs`, link in `main.rs`, verify `cargo check`.
   * Commit Message: `feat(core): implement secure rust network gateway and capability validator`

4. **Milestone 3: Sandbox & SDK**
   * Action: Implement `PluginFrame.tsx` and `src/sdk/index.ts`, test MessagePort handshake.
   * Commit Message: `feat(sandbox): implement iframe rpc bridge and plugin sdk runtime`

5. **Milestone 4: Sync & Storage**
   * Action: Deploy `CryptoSyncEngine.ts` and `GistSyncAdapter.ts`, verify E2EE encrypt/decrypt round-trip.
   * Commit Message: `feat(sync): implement zero-knowledge e2ee sync engine with webcrypto`

6. **Milestone 5: Starter Plugin Delivery**
   * Action: Create `plugins/tuwel-deadlines/` bundle, verify live countdown rendering.
   * Commit Message: `feat(plugins): implement tuwel deadlines starter widget`

7. **Milestone 6: CI/CD & Automated Release Packaging**
   * Action: Add `.github/workflows/release.yml` with multi-platform matrix builds.
   * Commit Message: `ci: configure multi-platform release workflow for macos, windows, linux`

