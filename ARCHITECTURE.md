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
  - **Explicit Window Label Invariant:** In `src-tauri/tauri.conf.json`, the main window configuration MUST explicitly set `"label": "main"`. Rust native webview commands (`app.get_window("main")` / `app.get_webview_window("main")`) rely on this exact label to attach child webviews.
* **Session Persistence:**
  - Each portal is assigned a dedicated data storage directory (e.g. `$APPDATA/tuwien-official-tuwel`, `$APPDATA/tuwien-official-tiss`).
  - Shibboleth SSO session cookies and credentials persist across application restarts.
* **Dynamic Coordinate Synchronization & Hit Testing:**
  - In React, `<NativePortalContainer />` places an invisible DOM anchor where the portal should appear.
  - A `ResizeObserver` measures bounding rectangles (`x, y, width, height`) and DPI scale factor.
  - When the sidebar expands, collapses, or changes orientation, React calls `update_webview_bounds(label, x, y, width, height)`.
  - Rust resizes the native child webview in real time with hardware-accelerated fluid motion.
  - **Interactivity Invariant:** The container element must maintain `pointer-events: auto` for active native child-webview anchors so that OS click, drag, and scroll events route seamlessly through the desktop window hierarchy.
* **Visibility Management & Synchronization:**
  - Switching between views calls `hide_all_child_webviews()` or `show_child_webview(label)`.
  - Webviews stay alive in memory to preserve student forms, open PDF assignments, and active TISS searches.
  - **Atomic Transition Guard:** In `src-tauri/src/native_webview.rs`, `hide_native_portal` verifies whether the portal being hidden is currently the active one before clearing `ACTIVE_PORTAL`, preventing race conditions during rapid portal transitions.

### 4.3 Modal Overlay Coordinator & Z-Index Resolution
Because native child-webviews operate as OS window surfaces, they naturally sit on top of the host HTML webview. To allow host modals (Command Palette `Cmd+K`, Settings, Login, Category Manager) and floating plugin overlays to display unobstructed:
* **The Invisibility Bus:** A global Zustand store (`useOverlayStore`) monitors modal open states.
* **Lossless Toggling:** When any modal opens, Rust executes `set_portals_visibility(false)` via `webview.hide()`. The underlying web page stays loaded in memory with zero state or form loss.
* **Instant Restoration:** When the modal closes, Rust executes `set_portals_visibility(true)`, instantly revealing the portal without a reload.

### 4.4 Authentic University Portal Rendering & Invariant
To ensure 100% stability during exam registrations and course activities:
* **Zero Intrusive CSS Injections:** Third-party institutional websites (TUWEL, TISS, TU Maps) render with their authentic, native institutional styling. Destructive `!important` CSS overrides are decommissioned to prevent layout corruption of complex Moodle YUI/Bootstrap components and JavaServer Faces viewstates.
* **Cockpit Chrome Isolation:** Dynamic themes (`useThemeStore.ts`) apply exclusively to the TU Cockpit desktop shell (navigation dock, executive header, settings, command palette, and modal dialogues).

### 4.5 In-Webview Shibboleth SSO & MFA Autofill Engine
* **Direct SSO Entrypoint:** The TUWEL portal links directly to `https://tuwel.tuwien.ac.at/login/index.php`, immediately triggering university Shibboleth authentication (`login.tuwien.ac.at`).
* **Daemon Execution (`inject_portal_autofill`):** When the webview navigates to `login.tuwien.ac.at`, Rust queries the secure credential and TOTP vault (`totp_vault::get_autofill_payload()`). If enabled, Rust executes a verified autofill script that populates username (`j_username`), password (`j_password`), and the real-time calculated 6-digit TOTP code (`token`/`totp`), accompanied by a floating `🔐 Autofilled by TU Cockpit` badge.
* **One-Click Manual Trigger:** Students can also trigger autofill on demand from the Native Viewport header toolbar (`<KeyRound />`).

### 4.6 Native Headless VoWi MediaWiki Reader
* **MediaWiki Action API:** Rather than forcing an embedded webview for simple course lookups, VoWi course information, summaries, and exam tips are fetched via `https://vowi.fsinf.at/api.php?action=opensearch` and `action=parse`.
* **Instant Native UI:** Rendered in high-performance native React components with instant fuzzy filtering and zero iframe overhead.
* **Live Portal Toggle:** Students who wish to edit the wiki or browse raw pages can seamlessly toggle into the live child webview (`NativePortalContainer`).

### 4.7 Architectural Verdict: Child Webviews vs. Local Header-Stripping Reverse Proxy
While a local reverse proxy (e.g. Axum stripping `X-Frame-Options` and `CSP`) sounds appealing in theory, it is fatally flawed for authenticated university portals:
1. **Cookie Partitioning & WebKit ITP:** Modern WebKit engines (used by Tauri on macOS) enforce Intelligent Tracking Prevention, rejecting cross-origin third-party cookies inside `<iframe>`s.
2. **SAML/Shibboleth SSO Redirection:** TUWEL and TISS redirect across distinct institutional domains (`tuwel.tuwien.ac.at` -> `login.tuwien.ac.at` -> `tiss.tuwien.ac.at`). A reverse proxy breaks on cross-origin redirects and relative URLs without rewriting all HTML/JS assets.
3. **Session Integrity:** Tauri v2's native child webview (`tauri::Webview`) provides an authentic first-party browser context with persistent, isolated cookie jars and hardware acceleration, which with the Lossless Invisibility Bus gives complete modal support and rock-solid session security.

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
   - **Self-Contained Bundle Invariant for Sandboxed `srcDoc` Iframes:**
     Plugins rendered via `PluginFrame.tsx` (`srcDoc={themedHtml}`) execute in an isolated `srcDoc` document without a base URL.
     Standard browser iframes cannot resolve relative uncompiled TypeScript/JSX modules (e.g., `<script type="module" src="/src/main.tsx">`) or relative asset chunks (`./assets/index-*.js`) against the host dev server.
     Therefore, community plugins must compile into self-contained single-file HTML distributions using `vite-plugin-singlefile` with all JavaScript, CSS, and SVG assets inlined.
   - **Registry Fallback Preservation Invariant:**
     When `CommunityOrgService.ts` discovers repositories via the GitHub Organization API, it must preserve any bundled `htmlContent` already registered in `DEFAULT_STORE_REGISTRY`. It must never overwrite working HTML with `undefined`, which would force the application to download raw uncompiled source trees.
   - **Local Development Loader Invariant:**
     To allow seamless local development within the workspace, TU Cockpit can load compiled single-file bundles directly from `community-plugins/<plugin-id>/dist/index.html` via local disk reading, bypassing remote GitHub downloads.
   - **Production Release Asset Specification (`plugin.zip`):**
     Plugin repositories run a GitHub Actions release workflow on tags (`v*`). The workflow runs `npm run build` with `vite-plugin-singlefile` and packages `dist/index.html` + `manifest.json` into a compressed release artifact `plugin.zip`. The Rust downloader (`plugin_downloader.rs`) checks for release asset `plugin.zip` to ensure only compiled artifacts are installed.
   - **Sidebar Categorization Invariant:**
     All installed plugins must appear in the sidebar accordion navigation (`ConfigurableNav.tsx`).
     `INITIAL_CATEGORIES` in `useAppStore.ts` provides a pre-configured `"community"` category (`"Community Tools"`), and the `installPlugin` action guarantees that any newly installed plugin without an existing category is assigned to `"community"`.

### 5.4 Community Plugin Development Protocol & Isolated Subfolder Pattern
To enable AI agent swarms and human contributors to develop separate community plugins without repository bloat:
* **The Subfolder Pattern (`community-plugins/<plugin-repo>`):**
  - Community repositories are cloned or scaffolded into `/community-plugins/` within the workspace root.
  - The host repo (`Tuwel-Tools`) strictly ignores `/community-plugins/` in `.gitignore`.
  - Agents operate with full filesystem and terminal privileges within the subfolder, running `git -C community-plugins/<repo>` to commit and push to their respective `tu-cockpit-community` GitHub remotes.
* **Strict Externalized Planning Invariant:**
  - Feature roadmaps, milestone prompts, and domain tasks for a community plugin (e.g. `tu-calendar`, `tu-slide-vault`) reside exclusively within the plugin's own `PLAN.md` (`community-plugins/<plugin-repo>/PLAN.md`).
  - The host `PLAN.md` tracks only host-level integration, orchestration, and marketplace discovery.
* **Auto-Discovery by `CommunityOrgService`:**
  - When a plugin repo is pushed to `tu-cockpit-community` with a valid root `manifest.json`, TU Cockpit's Community Store HUB automatically discovers it via the GitHub Organization API, merges with pre-bundled registry assets, and lists it for instant student installation.

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
