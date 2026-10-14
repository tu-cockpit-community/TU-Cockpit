# TU Cockpit: System Architecture & Technical Specifications

> **Living System Blueprint & Ground Truth**  
> **Official Organization:** [`tu-cockpit-community`](https://github.com/tu-cockpit-community)  
> **Official Core Repository:** [`tu-cockpit-community/TU-Cockpit`](https://github.com/tu-cockpit-community/TU-Cockpit)  
> **Target Ecosystem:** Desktop Hub & Dynamic Plugin Ecosystem for TU Wien Students  
> **Core Technologies:** Tauri v2, Rust (2021+), React 19, TypeScript 5.5+, Tailwind CSS v4, SQLite (WAL mode), WebCrypto E2EE

---

## 1. Executive Product Vision & Architecture Overview

### 1.1 Core Metaphor
**TU Cockpit** is an extensible, modular student workstation client for TU Wien. It aggregates institutional services (TISS, TUWEL, campus room search, library catalogs, cafeteria menus) and community-contributed tools through an isolated, sandboxed runtime engine.

### 1.2 Technology Stack Justification
* **Desktop Runtime:** Tauri v2 (`@tauri-apps/api@^2.0`, Rust 2021). Chosen over Electron to ensure minimal binary footprint (<15MB), near-zero idle memory consumption (<40MB RAM), native OS integration, and compile-time capabilities/security boundary enforcement.
* **Frontend Core:** React 19 + TypeScript 5.5+ paired with Vite. Provides instantaneous HMR, predictable unidirectional state management, and modern concurrency hooks without unnecessary hydration overhead.
* **Styling Engine:** Tailwind CSS v4 + Vanilla CSS custom properties (`--tu-*` tokens). Enables instantaneous, zero-re-render runtime theme swapping across host chrome and isolated plugins.
* **Local Persistence:** SQLite in WAL (Write-Ahead Logging) mode (`rusqlite` with `bundled` feature). Ensures ACID guarantees, concurrent reads, sub-millisecond local queries, and FTS5 full-text indexing for offline university resources.
* **Security & Sandboxing:** Multi-tier isolation model. Official university portals run in native child-webviews (`tauri::Webview`) with isolated persistent cookie jars; third-party community plugins execute inside origin-nullified, sandboxed `<iframe>`s governed by strict Content Security Policies and an asynchronous postMessage RPC protocol.

---

## 2. Workspace Canvas & UI Shell

### 2.1 The Full-Bleed Workstation Paradigm
The TU Cockpit desktop shell provides a clutter-free, distraction-free environment for students navigating complex university portals.
* **Single Surface Canvas:** The main viewport renders full-bleed content with zero extraneous padding or double-nested scrolling.
* **Executive Header:** Provides essential workstation context:
  - **Left:** TU Cockpit branding logo and active plugin/portal breadcrumb (`[TU Cockpit] > Active Portal`).
  - **Center:** Quick-access Global Command Palette trigger (`Cmd+K`) and academic term indicator (`WS 2026/27`).
  - **Right:** Student Profile indicator (`currentUser`), live clock, and Settings modal trigger.
  - *Rule:* No experimental modal buttons (Deadlines, Split View, Slide Vault) pollute the global header.

### 2.2 Orientation-Aware Dynamic Navigation Dock (`ConfigurableNav.tsx`)
The navigation dock supports four user-configurable docking orientations:
* **Orientations:** `left`, `right`, `top`, `bottom` (persisted in `useNavConfigStore.ts`).
* **Sidebar Collapsing:**
  - When in `left` or `right` mode, the dock can collapse into a sleek 56px icon rail (`w-14`), maximizing horizontal space for wide data tables in TISS and TUWEL.
  - **Single Authority:** The collapse/expand button is anchored exclusively on the sidebar rail itself (and triggered via `Cmd+B` / `Ctrl+B`). No duplicate toggle exists in the top header.
* **Category Organization:**
  - Items are grouped into collapsible category accordions.
  - **TU Essentials:** Core official portals (`tuwien.official.*`) ship pre-bundled under this primary category.
  - **Community Categories:** Installed plugins from the community marketplace populate designated folders (e.g. *Academic*, *Campus Life*, *Tools*).

### 2.3 Global Command Palette (`Cmd+K`)
* Built with `cmdk` in `CommandPaletteModal.tsx`.
* Triggers via `Cmd+K` (macOS) or `Ctrl+K` (Windows/Linux).
* Performs instant fuzzy matching across:
  - Pre-bundled official portals (TUWEL, TISS, VoWi, TU Maps).
  - Installed community plugins.
  - Built-in views (Community Store HUB, Settings, Security Vault).
  - Campus room searches and course codes.

---

## 3. Centralized Theming Engine & Styling Tokens

### 3.1 Design Philosophy: Universal `--tu-*` Token System
TU Cockpit uses CSS Custom Properties defined on the root element. Both host components and isolated plugins read from this shared palette.

```css
:root {
  /* Core Canvas & Backgrounds */
  --tu-bg-canvas: #090d16;
  --tu-bg-surface: #111827;
  --tu-bg-elevated: #1f2937;
  --tu-bg-glass: rgba(17, 24, 39, 0.75);

  /* Borders & Dividers */
  --tu-border: #374151;
  --tu-border-subtle: #1f2937;
  --tu-border-focus: #006699;

  /* Typography */
  --tu-text-primary: #f9fafb;
  --tu-text-secondary: #9ca3af;
  --tu-text-muted: #6b7280;

  /* Accents & Brand (TU Wien Corporate Identity) */
  --tu-accent: #006699;          /* Official TU Blue */
  --tu-accent-hover: #0077b6;
  --tu-accent-subtle: rgba(0, 102, 153, 0.15);
  --tu-accent-text: #ffffff;

  /* Status Colors */
  --tu-status-success: #10b981;
  --tu-status-warning: #f59e0b;
  --tu-status-error: #ef4444;
  --tu-status-info: #3b82f6;

  /* Fonts */
  --tu-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --tu-font-mono: 'JetBrains Mono', monospace;
}
```

### 3.2 Dynamic Themes & Typography
Managed via `useThemeStore.ts`:
* **Presets:** Dark Mode (default), Light Mode, High Contrast (WCAG AAA compliant), OLED Midnight.
* **Font Switching:** Inter, Outfit, JetBrains Mono, Fira Code.
* **Live Invalidation:** When the theme changes, CSS custom properties update on the `<html>` root instantly without requiring a page reload or component unmounting.

---

## 4. Native Child-Webview Engine (`tauri::Webview`)

### 4.1 Rationale: Beating `X-Frame-Options` and CSP Blocks
Institutional portals at TU Wien (TUWEL, TISS) strictly enforce `X-Frame-Options: SAMEORIGIN` and `frame-ancestors 'self'`. Standard browser iframes cannot embed these portals.
TU Cockpit solves this using Tauri v2's native child webview API (`tauri::Webview`).

### 4.2 Architecture & Lifecycle
* **Native Windows:** Instead of rendering webviews in HTML, Rust creates a native OS child webview attached directly to the main window (`main_win.add_child(...)`).
* **Session Persistence:**
  - Each portal is assigned a dedicated data storage directory (e.g. `$APPDATA/tuwien-official-tuwel`, `$APPDATA/tuwien-official-tiss`).
  - Shibboleth SSO session cookies and credentials persist across application restarts.
* **Dynamic Coordinate Synchronization:**
  - In React, `<NativePortalContainer />` places an invisible DOM anchor where the portal should appear.
  - A `ResizeObserver` measures bounding rectangles (`x, y, width, height`) and DPI scale factor.
  - When the sidebar expands, collapses, or changes orientation, React calls `update_webview_bounds(label, x, y, width, height)`.
  - Rust resizes the native child webview in real time with hardware-accelerated fluid motion.
* **Visibility Management:**
  - Switching between views calls `hide_all_child_webviews()` or `show_child_webview(label)`.
  - Webviews stay alive in memory to preserve student forms, open PDF assignments, and active TISS searches.

### 4.3 Modal Overlay Coordinator & Z-Index Resolution
Because native child-webviews operate as OS window surfaces, they naturally sit on top of the host HTML webview. To allow host modals (Command Palette `Cmd+K`, Settings, Login, Category Manager) and floating plugin overlays to display unobstructed:
* **The Invisibility Bus:** A global Zustand store (`useOverlayStore`) monitors modal open states.
* **Lossless Toggling:** When any modal opens, Rust executes `set_portals_visibility(false)` via `webview.hide()`. The underlying web page stays loaded in memory with zero state or form loss.
* **Instant Restoration:** When the modal closes, Rust executes `set_portals_visibility(true)`, instantly revealing the portal without a reload.

### 4.4 In-Page Theme & Style Injection Engine
Tauri v2 allows direct styling and DOM modification of third-party institutional websites:
* **Pre-Render CSS (`initialization_script`):** In `WebviewBuilder`, an initialization script attaches `<style id="tu-cockpit-injected-theme">` before the DOM renders, preventing blinding white flashes on dark themes.
* **Live Token Evaluation (`webview.eval`):** When students switch themes in Cockpit Settings, React generates updated CSS variables via `PortalThemeInjector.ts` and invokes `inject_portal_theme(portal_id, css)`. Rust evals the CSS directly into the live webview, harmonizing university portals with the Cockpit theme in real time.

---

## 5. Dynamic Plugin & Community Marketplace Ecosystem

### 5.1 Security Boundary: Strict Marketplace-Only Policy
To prevent arbitrary code execution, supply-chain attacks, and student data theft:
* **Organization Enforcement:** The Rust backend and `GitHubPluginService.ts` strictly enforce that all installable plugins originate from repositories within the official community organization:
  `https://github.com/tu-cockpit-community`
* **Zero Arbitrary Sideloading:** Sideloading random URLs or unverified third-party repositories is rejected at the Rust capability level.
* **Cryptographic Release Artifacts:** Plugin releases are signed and contain `plugin.zip`, `manifest.json`, and `checksum.sha256`.

### 5.2 Plugin Manifest Specification (`manifest.json`)
Every plugin must declare a standard `manifest.json`:

```json
{
  "id": "tuwien.community.slide-vault",
  "name": "TU Slide Vault",
  "version": "1.0.0",
  "description": "Offline lecture slide cache with instant full-text search.",
  "author": {
    "name": "TU Cockpit Community",
    "url": "https://github.com/tu-cockpit-community"
  },
  "category": "Academic",
  "entrypoint": "index.html",
  "homepage": "https://github.com/tu-cockpit-community/tu-slide-vault",
  "permissions": {
    "network": [
      "https://tuwel.tuwien.ac.at/*",
      "https://vowi.fsinf.at/*"
    ],
    "storageQuotaMb": 100
  }
}
```

### 5.3 Execution Modes: Official vs. Community
1. **"TU Essentials" (Native Portals):**
   - Identifier prefix: `tuwien.official.*` (TUWEL, TISS, VoWi, TU Maps).
   - Routed through the native child-webview engine with dedicated persistent session contexts.
2. **Community Plugins (Sandboxed Iframes):**
   - Identifier prefix: `tuwien.community.*`
   - Rendered inside sandboxed iframes (`PluginFrame.tsx`) with `sandbox="allow-scripts allow-forms allow-same-origin"` and origin nullification.
   - Communicate with the host shell via an asynchronous `postMessage` RPC bridge with strict capability checking.

---

## 6. Student Identity, Authentication & Autofill Vault

### 6.1 Architecture: Client-Side Zero-Knowledge Vault
* **Storage:** Credentials and 2FA secrets are encrypted locally using **WebCrypto AES-GCM-256** with PBKDF2 key derivation (100,000 iterations).
* **Master Password:** The decryption key is derived solely in volatile memory from the student's master password; it is never written to disk or sent to any remote server.
* **TOTP Engine (RFC 6238):**
  - Generates standard 6-digit TOTP codes for TU Wien 2FA (`otpauth://totp/TUWien:...`).
  - Displays remaining countdown seconds and enables single-click clipboard copying.

### 6.2 In-Webview SSO/MFA Autofill Daemon
* When a student opens a TU Wien login page (e.g. `login.tuwien.ac.at`), the Rust autofill daemon detects the Shibboleth login form.
* It securely fills the student matriculation number (`eXXXXXXXX`) and credentials directly into the child webview without exposing credentials to untrusted web content.

---

## 7. Storage & Data Persistence

* **Engine:** SQLite in Write-Ahead Logging (`WAL`) mode via `rusqlite`.
* **Path:** `$APPDATA/tu_cockpit/database.sqlite`.
* **Subsystems:**
  - **Local App State:** Persistent user preferences, category folders, orientation, pinned tools.
  - **Plugin Catalog Cache:** Cached metadata and release manifests from `tu-cockpit-community`.
  - **FTS5 Search Engine:** Built-in SQLite full-text search virtual tables for indexing campus rooms, course catalogs, and offline documentation.

---

## 8. CI/CD, Cryptographic Signing & Auto-Updater

* **Auto-Updater Plugin:** `@tauri-apps/plugin-updater` integrated into `src-tauri/src/lib.rs`.
* **Public Key Verification:** Release manifests are verified using Minisign Ed25519 public keys before execution.
* **Update Endpoints:**
  `https://github.com/tu-cockpit-community/TU-Cockpit/releases/latest/download/latest.json`
* **GitHub Actions Pipeline (`.github/workflows/release.yml`):**
  - Cross-compiles for macOS (Apple Silicon `aarch64` & Intel `x86_64`), Linux (`.deb`, `.AppImage`), and Windows (`.msi`).
  - Automatically signs binaries and publishes update bundles alongside releases.
