# TU Cockpit: Codebase Map & AI Agent Navigation Guide

> **Target Audience:** AI Worker, Planning, Explaining, and Advisory Agents  
> **Official Repository:** [`tu-cockpit-community/TU-Cockpit`](https://github.com/tu-cockpit-community/TU-Cockpit)  
> **Purpose:** Instant lookup index to answer *"Where is X located and how do I modify it?"* without searching through the entire repository.

---

## 1. Fast-Lookup Matrix: "Where is X?"

| Feature / System Domain | UI Component (`src/components/`) | State Store (`src/store/`) | Frontend Service (`src/services/`) | Rust Backend (`src-tauri/src/`) |
| :--- | :--- | :--- | :--- | :--- |
| **Workspace Shell & Layout** | [App.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/App.tsx) | [useAppStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useAppStore.ts) | — | [lib.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/lib.rs) |
| **Header & Top Controls** | [ExecutiveHeader.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/header/ExecutiveHeader.tsx) | [usePaletteStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/usePaletteStore.ts) | — | — |
| **Sidebar & Categories** | [ConfigurableNav.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/navigation/ConfigurableNav.tsx), [CategoryManagerModal.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/navigation/CategoryManagerModal.tsx) | [useAppStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useAppStore.ts) | — | — |
| **Official Portals (TUWEL, TISS, Maps)** | [NativePortalContainer.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/plugin-host/NativePortalContainer.tsx) | [useAppStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useAppStore.ts), `useOverlayStore.ts` | [OfficialPlugins.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/plugins/official/OfficialPlugins.ts) | [native_webview.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/native_webview.rs), [embedded_portals.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/embedded_portals.rs) |
| **VoWi MediaWiki Headless Reader** | `VoWiReader.tsx`, [NativePortalContainer.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/plugin-host/NativePortalContainer.tsx) | [useAppStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useAppStore.ts) | `VoWiApiService.ts`, [OfficialPlugins.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/plugins/official/OfficialPlugins.ts) | [native_webview.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/native_webview.rs) |
| **Community Marketplace** | [PluginMarketplace.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/marketplace/PluginMarketplace.tsx), [DeveloperGuideTab.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/marketplace/DeveloperGuideTab.tsx) | [useDeveloperStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useDeveloperStore.ts) | [GitHubPluginService.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/marketplace/GitHubPluginService.ts), [CommunityOrgService.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/marketplace/CommunityOrgService.ts) | [plugin_downloader.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/plugin_downloader.rs) |
| **Sandboxed Plugin Runtime** | [PluginFrame.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/plugin-host/PluginFrame.tsx) | [useAppStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useAppStore.ts) | [PluginHostManager.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/plugin-host/PluginHostManager.ts), [sdk/index.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/sdk/index.ts) | [plugin_gateway.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/plugin_gateway.rs) |
| **Theme Engine & CSS Tokens** | [ThemeCustomizer.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/settings/ThemeCustomizer.tsx) | [useThemeStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useThemeStore.ts) | [styles/theme.css](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/styles/theme.css), [index.css](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/index.css) | — |
| **Student Auth & MFA Vault** | [LoginModal.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/auth/LoginModal.tsx), [AccountAutofillSettings.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/settings/AccountAutofillSettings.tsx) | [useAuthStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useAuthStore.ts), [useVaultStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useVaultStore.ts) | [AuthService.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/auth/AuthService.ts), [AutofillDaemon.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/auth/AutofillDaemon.ts) | [totp_vault.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/totp_vault.rs), `native_webview.rs` (`inject_portal_autofill`) |
| **Command Palette (`Cmd+K`)** | [CommandPalette.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/palette/CommandPalette.tsx) | [usePaletteStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/usePaletteStore.ts) | [FuzzySearchService.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/palette/FuzzySearchService.ts), [tu_rooms_index.json](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/data/tu_rooms_index.json) | — |
| **Settings & Preferences** | [SettingsModal.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/settings/SettingsModal.tsx) | [useAppStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useAppStore.ts) | — | — |
| **Auto-Updater** | [UpdaterToast.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/updater/UpdaterToast.tsx), [UpdateSettings.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/settings/UpdateSettings.tsx) | [useUpdaterStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useUpdaterStore.ts) | — | [lib.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/lib.rs) (`tauri-plugin-updater`) |
| **E2EE State Sync** | [SyncSettings.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/settings/SyncSettings.tsx) | [useAppStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useAppStore.ts) | [CryptoSyncEngine.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/sync/CryptoSyncEngine.ts), [GistSyncAdapter.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/sync/GistSyncAdapter.ts) | — |

---

## 2. Project Documentation Hierarchy

Before reading or editing code, understand which document governs what:

```
├── AGENTS.md                   <-- READ FIRST: Agent swarm operating rules & verification commands
├── PROJECT_MAP.md              <-- YOU ARE HERE: Quick-lookup table & file index for AI agents
├── ARCHITECTURE.md             <-- LIVING SPECIFICATIONS: Ground truth for IPC, CSS tokens, Webviews, Security
├── PLAN.md                     <-- ACTIVE SPRINT ONLY: Phase 15 milestones and worker prompts (< 600 lines)
├── README.md                   <-- USER DOCUMENTATION: End-user features and showcase
└── docs/
    └── archive/
        ├── PHASES_1_TO_6.md    <-- COLD STORAGE: Completed milestones 0–33 (do NOT read unless auditing history)
        ├── PHASE_7.md          <-- COLD STORAGE: Completed milestones 34–37 (Phase 7)
        ├── PHASE_8.md          <-- COLD STORAGE: Completed milestones 38–41 (Phase 8)
        ├── PHASE_9.md          <-- COLD STORAGE: Completed milestone 42 (Phase 9: tu-calendar)
        ├── PHASE_10.md         <-- COLD STORAGE: Completed milestone 43 (Phase 10: tu-slide-vault)
        ├── PHASE_11.md         <-- COLD STORAGE: Completed milestones 44–46 (Phase 11: Launching & Bundling Invariants)
        ├── PHASE_12.md         <-- COLD STORAGE: Completed milestones 47–49 (Phase 12: Single-File Inlining)
        ├── PHASE_13.md         <-- COLD STORAGE: Completed milestones 50–52 (Phase 13: Spotlight Integration & tu-mensa)
        └── PHASE_14.md         <-- COLD STORAGE: Completed milestones 53–55 (Phase 14: Status Bar, ICS & tu-room-radar)
```

### Golden Rules for AI Agents:
1. **Never read `docs/archive/`** during regular feature work. It wastes context tokens and contains superseded milestone prompts.
2. **Read the active Milestone in [PLAN.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/PLAN.md)** for your exact objective, code tasks, verification, and git commit format.
3. **Consult [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md)** whenever you need technical ground truth (e.g. IPC signatures, token names, security constraints).

---

## 3. Directory Anatomy & Code Organization

### 3.1 Frontend (`src/`)
```
src/
├── App.tsx                     # Top-level shell: renders Header, ConfigurableNav, and Active View/Portal
├── main.tsx                    # React 19 entry point and DOM root mount
├── index.css                   # Global Tailwind CSS v4 directives & root baseline
│
├── components/                 # React UI presentation components
│   ├── auth/                   # Student profile modal & badge
│   ├── header/                 # ExecutiveHeader: search bar, profile pill, clock, settings trigger
│   ├── marketplace/            # Community Store HUB, developer guide tab, verified badge
│   ├── navigation/             # ConfigurableNav: vertical/horizontal dock, categories, sidebar collapser
│   ├── palette/                # Cmd+K Spotlight Command Palette (cmdk)
│   ├── plugin-host/            # NativePortalContainer (child webview anchor) & PluginFrame (sandboxed iframe)
│   ├── settings/               # Modal tabs: Theme Customizer, Layout, Sync, Autofill, Auto-Updater
│   └── updater/                # Floating notification toast for in-app updates
│
├── data/
│   └── tu_rooms_index.json     # Pre-indexed TU Wien campus rooms and coordinates for Cmd+K search
│
├── plugins/
│   └── official/               # Official portal definitions (TUWEL, TISS, VoWi, TU Maps)
│       ├── OfficialPlugins.ts  # Pre-bundled manifests, URLs, and fallback HTML templates
│       ├── tiss/manifest.json
│       ├── tumaps/manifest.json
│       ├── tuwel/manifest.json
│       └── vowi/manifest.json
│
├── sdk/
│   └── index.ts                # TypeScript RPC client library injected into untrusted plugin iframes
│
├── services/                   # Business logic and external integration engines
│   ├── auth/                   # Student authentication & in-webview Shibboleth autofill daemon
│   ├── db/                     # Local SQLite interface
│   ├── marketplace/            # GitHub org plugin discovery & strict verification service
│   ├── palette/                # Fuzzy search engine for rooms, plugins, and actions
│   ├── portal/                 # Dynamic CSS theme injection engine for university portals
│   └── sync/                   # E2EE WebCrypto AES-GCM sync engine & GitHub Gist relay adapter
│
├── store/                      # Zustand 5 persistent client-side state stores
│   ├── useAppStore.ts          # Core app state: installed plugins, dock orientation, active view, categories
│   ├── useAuthStore.ts         # Active student credentials, matriculation number, RBAC roles
│   ├── useDeveloperStore.ts    # Developer registration & store submission state
│   ├── usePaletteStore.ts      # Command palette open/closed state
│   ├── useThemeStore.ts        # Central theme tokens, dynamic fonts, UI scaling multiplier
│   ├── useUpdaterStore.ts      # Background update check intervals & release payload
│   └── useVaultStore.ts        # Encrypted student MFA seeds & TOTP configuration
│
└── styles/
    ├── embedded-themes/        # Curated dark/light CSS stylesheets injected into university webviews
    │   ├── tiss.css
    │   ├── tumaps.css
    │   ├── tuwel.css
    │   └── vowi.css
    └── theme.css               # Central --tu-* design tokens definition
```

### 3.2 Rust Desktop Core (`src-tauri/`)
```
src-tauri/
├── Cargo.toml                  # Rust dependencies (tauri v2, rusqlite, reqwest, updater)
├── tauri.conf.json             # Tauri configuration (bundle ID, permissions, updater endpoints)
├── capabilities/
│   └── default.json            # Security capability boundary rules
└── src/
    ├── lib.rs                  # Application builder: plugin registration and IPC command registry
    ├── main.rs                 # Desktop process entry point
    ├── native_webview.rs       # Tauri v2 child-webview lifecycle (add_child, resize, show/hide)
    ├── embedded_portals.rs     # Portal session storage paths and Shibboleth cookie isolation
    ├── plugin_downloader.rs    # GitHub release ZIP extractor & sha256 checksum verifier
    ├── plugin_gateway.rs       # Sandboxed iframe network proxy (enforces capability globs)
    ├── portal_proxy.rs         # CORS-free proxy engine
    └── totp_vault.rs           # Native RFC 6238 TOTP computation & clipboard integration
```

---

## 4. Key Architectural Patterns & Guardrails

### ⚡ 1. Native Webviews vs. Sandboxed Iframes
* **Official Institutional Portals (`tuwien.official.*`):**
  - **Always use `NativePortalContainer.tsx` + `native_webview.rs`.**
  - TUWEL and TISS block standard `<iframe>`s via `X-Frame-Options: SAMEORIGIN`. Native child-webviews (`tauri::Webview`) bypass this natively while maintaining persistent cookies.
* **Community Third-Party Plugins (`tuwien.community.*`):**
  - **Always use `PluginFrame.tsx`.**
  - Third-party code runs in sandboxed iframes with origin nullification (`null` origin) and postMessage RPC to prevent arbitrary host access.

### 🛡️ 2. Strict Marketplace-Only Security Policy
* Never re-introduce arbitrary git clone or raw URL sideloading.
* The application only allows plugins originating from the official community GitHub organization:
  `https://github.com/tu-cockpit-community`

### 🎨 3. CSS Variable Theming Contract
* Never hardcode hex values like `#ffffff` or `#000000` in UI components.
* Always use `--tu-*` tokens defined in [theme.css](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/styles/theme.css):
  - Surfaces: `var(--tu-bg-canvas)`, `var(--tu-bg-surface)`, `var(--tu-bg-elevated)`
  - Text: `var(--tu-text-primary)`, `var(--tu-text-secondary)`, `var(--tu-text-muted)`
  - Accent: `var(--tu-accent)`, `var(--tu-accent-hover)`, `var(--tu-accent-text)`
  - Borders: `var(--tu-border)`, `var(--tu-border-subtle)`, `var(--tu-border-focus)`

### 🧭 4. Sidebar Collapsing & Navigation Authority
* **Single Collapser Rule:** The collapse button is located **strictly on the sidebar itself** ([ConfigurableNav.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/navigation/ConfigurableNav.tsx)).
* Do NOT add a duplicate collapser to [ExecutiveHeader.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/header/ExecutiveHeader.tsx).

---

## 5. Standard Verification Runbook

Before completing any task, run both verification checks:

```bash
# 1. Frontend TypeScript & React Build Verification:
npm run build

# 2. Rust Backend & Tauri Capability Verification:
# (On macOS, specify SDKROOT to ensure the linker picks up the primary SDK)
SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk cargo check --manifest-path src-tauri/Cargo.toml
```
