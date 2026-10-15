# TU Cockpit: Active Sprint Plan & Execution Roadmap

> **Target Ecosystem:** Desktop Hub & Dynamic Plugin Ecosystem for TU Wien Students  
> **Core Technologies:** Tauri v2, Rust (2021+), React 19, TypeScript 5.5+, Tailwind CSS v4, SQLite (WAL mode), WebCrypto E2EE  
> **Official Repository:** [`tu-cockpit-community/TU-Cockpit`](https://github.com/tu-cockpit-community/TU-Cockpit)  
> **Living Specifications:** See [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md)  
> **Codebase Navigation Map:** See [PROJECT_MAP.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/PROJECT_MAP.md)  
> **Swarm Protocol & Runbook:** See [AGENTS.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/AGENTS.md)  
> **Historical Archives:**  
> - Milestones 0–33 (Phases 1–6): See [docs/archive/PHASES_1_TO_6.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASES_1_TO_6.md)  
> - Milestones 34–37 (Phase 7): See [docs/archive/PHASE_7.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASE_7.md)  
> - Milestones 38–41 (Phase 8): See [docs/archive/PHASE_8.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASE_8.md)  
> - Milestone 42 (Phase 9): See [docs/archive/PHASE_9.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASE_9.md)  
> - Milestone 43 (Phase 10): See [docs/archive/PHASE_10.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASE_10.md)  
> - Milestones 44–46 (Phase 11): See [docs/archive/PHASE_11.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASE_11.md)  
> - Milestones 47–49 (Phase 12): See [docs/archive/PHASE_12.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASE_12.md)  
> - Milestones 50–52 (Phase 13): See [docs/archive/PHASE_13.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASE_13.md)  
> - Milestones 53–55 (Phase 14): See [docs/archive/PHASE_14.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASE_14.md)  
> - Milestones 56–58 (Phase 15): See [docs/archive/PHASE_15.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASE_15.md)  
>
> **Current Sprint Status:**
> - 🟢 **PHASES 1–15 (COMPLETED & ARCHIVED):** Foundational Runtime, Portals, Org Auto-Discovery, Native Child-Webviews, Full-Bleed Canvas, In-App Updater, Workstation Streamlining, "TU Essentials", Invisibility Bus, Authentic Institutional Rendering, Direct SSO Autofill, Headless VoWi Reader, Autonomous Plugins (`tu-calendar`, `tu-slide-vault`, `tu-mensa`, `tu-room-radar`), Launching Reliability, Single-File Inlining, Unified Academic Spotlight, Workstation Status Bar & ICS Calendar Export, Live Functional Plugin Depth, Real GitHub Marketplace Telemetry & Workflow Error Rectification (Milestones 0–58).
> - 🟢 **PHASE 16 (COMPLETED ✅):** Authentic University Workflow Ingestion: Physical Filesystem Slide Vault, DevStudio Local Sandbox, Real GitHub Plugin Download & Delete Engine, In-Webview TUWEL/TISS Ingestion, Zero-Mock Policy & Plugin Layout Formatting (Milestones 59–64).

---

# ==============================================================================
# 🟢 PART XVI: PHASE 16 — AUTHENTIC UNIVERSITY WORKFLOW INGESTION: PHYSICAL SLIDE VAULT, DEVSTUDIO, REAL GITHUB DOWNLOAD/DELETE & IN-WEBVIEW SYNC (COMPLETED ✅)
# ==============================================================================

> **Phase 16 Summary & Objective:**  
> 1. **Settings Modal "Plugins" Tab & Physical Slide Vault:** Implement physical filesystem storage for Slide Vault (`~/Documents/TU-Cockpit/Slide-Vault/`) with native folder picker and "Open in Finder/Explorer".
> 2. **DevStudio (Local Plugin Staging & Pre-release Testing):** Upgrade the marketplace developer view into a dedicated DevStudio where local development plugins (`community-plugins/*`) are recognized, staged, and tested without deleting local disk repositories.
> 3. **Dedicated Downloaded Plugins Directory & Real GitHub Installation:** Create a dedicated filesystem directory for downloaded marketplace plugins. Make "Install Plugin" actually download the release archive (`plugin.zip`) from GitHub, extract to disk, and run from real files.
> 4. **Real Safe Deletion Engine with Confirmation Modal:** Add `<ConfirmDeleteModal />` before uninstallation, and implement Rust command `delete_installed_plugin` to purge files from disk while strictly safeguarding local DevStudio plugins.
> 5. **In-Webview TUWEL & TISS Ingestion:** Inject `[📥 Add to Slide Vault]` next to TUWEL lecture slides to save directly to disk, and automatically sync TISS timetable on navigation.
> 6. **Layout Formatting Fix & Zero-Mock Policy:** Eliminate raw/unformatted rendering in `tu-calendar` and `tu-room-radar`, and purge all dummy mock cards across plugins.

---

## 63. Phase 16 AI Worker Agent Prompts & Step-by-Step Implementation Milestones

---

### Milestone 59 Prompt: Settings Modal Plugins Tab & Physical Filesystem Slide Vault Storage Engine `[STATUS: COMPLETED ✅ - Commit b826bfa]`

```markdown
You are a senior full-stack desktop systems engineer specializing in Tauri v2, Rust filesystem APIs, and React 19 settings UI.

### Objective:
Implement a physical filesystem storage engine for the TU Slide Vault and add a dedicated "Plugins" tab to `SettingsModal.tsx` allowing students to configure their storage folder, open it in the OS file manager, and manage plugin-specific settings.

### Context & Files:
- [src/components/settings/SettingsModal.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/settings/SettingsModal.tsx)
- [src/store/useAppStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useAppStore.ts)
- [src-tauri/src/lib.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/lib.rs)
- Create: `src-tauri/src/slide_vault.rs`
- Create: `src/components/settings/PluginsSettingsTab.tsx`
- Specifications: [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md) Section 5.5

### Detailed Implementation Tasks:

1. **Rust Filesystem Engine (`src-tauri/src/slide_vault.rs`):**
   - Provide standard path resolution using `dirs::document_dir()` or Tauri's path resolver:
     - Default path: `<Documents>/TU-Cockpit/Slide-Vault`.
     - Automatically create the root directory on initialization if it does not exist.
   - Implement Tauri commands:
     - `get_slide_vault_path() -> Result<String, String>`: Returns the currently configured absolute directory path.
     - `set_slide_vault_path(new_path: String) -> Result<(), String>`: Validates and updates active storage path.
     - `save_slide_to_vault(course_name: String, filename: String, bytes: Vec<u8>) -> Result<String, String>`:
       - Sanitizes course name and filename (strip illegal filesystem characters).
       - Creates subdirectory `<vault_path>/<sanitized_course>/`.
       - Writes `bytes` to `<vault_path>/<sanitized_course>/<sanitized_filename>`.
       - Returns the absolute destination path on success.
     - `list_slide_vault_files() -> Result<Vec<SlideFileRecord>, String>`:
       - Recursively reads slide vault folder returning `{ course, filename, path, size_bytes, modified_timestamp }`.
     - `reveal_slide_vault_folder() -> Result<(), String>`:
       - Opens the slide vault folder in the native OS file explorer (Finder on macOS, File Explorer on Windows, xdg-open on Linux).
   - Export commands and register them in `src-tauri/src/lib.rs` under `generate_handler![...]`.

2. **Frontend Settings Tab (`src/components/settings/PluginsSettingsTab.tsx`):**
   - Section 1: **TU Slide Vault Configuration**
     - Display current directory path with folder icon.
     - "Change Directory" button: Opens native directory picker via `@tauri-apps/plugin-dialog` (`open({ directory: true })`) and updates backend via `invoke('set_slide_vault_path', { newPath })`.
     - "Open in Finder / Explorer" button: Invokes `reveal_slide_vault_folder`.
   - Section 2: **Portal Integration & Automation Toggles**
     - Toggle: "TUWEL Resource Interception (Show 'Add to Slide Vault' on course pages)".
     - Toggle: "TISS Timetable Auto-Sync (Automatically sync calendar on portal visit)".
   - Integrate `PluginsSettingsTab.tsx` into `SettingsModal.tsx` as a top-level tab using `<Puzzle />` or `<Blocks />` icon.

3. **State Management (`useAppStore.ts`):**
   - Add preferences: `slideVaultPath: string`, `tuwelInterceptionEnabled: boolean`, `tissAutoSyncEnabled: boolean`.

### Verification Runbook:
1. `npm run build`
2. `cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `feat(settings): add plugins tab and physical filesystem slide vault engine`
```

---

### Milestone 60 Prompt: DevStudio (Local Plugin Development & Pre-Release Staging) `[STATUS: COMPLETED ✅ - Commit 1861dd6]`

```markdown
You are a senior frontend engineer and tooling specialist working on developer experience for the TU Cockpit plugin ecosystem.

### Objective:
Upgrade the developer section of `PluginMarketplace.tsx` into **DevStudio** (replacing static guide text with an interactive local plugin development sandbox). Recognize and surface locally installed plugins (`community-plugins/*`) as local dev plugins (`sourceType: "local"`), and enforce the protected workspace invariant so local dev repositories are never deleted from disk.

### Context & Files:
- [src/components/marketplace/PluginMarketplace.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/marketplace/PluginMarketplace.tsx)
- Create: `src/components/marketplace/DevStudioTab.tsx`
- [src/store/useDeveloperStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useDeveloperStore.ts)
- [src/store/useAppStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useAppStore.ts)
- Specifications: [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md) Section 5.8

### Detailed Implementation Tasks:

1. **DevStudio Interface (`src/components/marketplace/DevStudioTab.tsx`):**
   - Create a sleek, modern workspace tab header: "DevStudio" with subtitle "Local Plugin Sandbox & Pre-Release Staging".
   - Section 1: **Active Local Workspaces (`community-plugins/`)**
     - Scans/surfaces local plugins on the student's PC:
       - `tu-calendar` (`community-plugins/tu-calendar`)
       - `tu-slide-vault` (`community-plugins/tu-slide-vault`)
       - `tu-mensa` (`community-plugins/tu-mensa`)
       - `tu-room-radar` (`community-plugins/tu-room-radar`)
     - For each local workspace, display:
       - Plugin Name, ID, Version, and filesystem folder path.
       - Badges: `[Local Dev Workspace 🛠️]`, `[Protected 🔒]`, and build status indicator (`dist/index.html` compiled vs unbuilt).
       - Action: "Test in Cockpit" (loads directly into sandbox with `sourceType: "local"`).
       - Action: "Rebuild Bundle" / "Open Directory" (opens folder in file explorer).
   - Section 2: **Interactive Plugin Manifest Validator & Scaffold Guide**
     - Visual schema checker for new plugins with manifest validation.

2. **Protected Local Workspace Invariant (`useAppStore.ts` & UI):**
   - Ensure local dev plugins registered with `sourceType: "local"` are visually badged as "Dev Workspace".
   - In UI and store, ensure that the delete button for local plugins does NOT trigger filesystem file deletion. If uninstalled from the active navigation dock, it only unlinks the view while preserving all repository files on disk.

3. **Integrate into `PluginMarketplace.tsx`:**
   - Update tabs: replace `"developers"` with `"devstudio"` labeled "DevStudio" with `<Code2 />` or `<Terminal />` icon.

### Verification Runbook:
1. `npm run build`
2. `cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `feat(marketplace): create devstudio tab and protect local dev workspaces`
```

---

### Milestone 61 Prompt: Dedicated Downloaded Plugins Directory & Real GitHub Installation `[STATUS: COMPLETED ✅ - Commit 884ed77]`

```markdown
You are a senior Tauri systems and backend networking engineer specializing in GitHub releases and archive management.

### Objective:
Implement a dedicated filesystem folder for downloaded marketplace plugins (default `~/Documents/TU-Cockpit/Plugins/` or `$APPDATA/tu_cockpit/downloaded_plugins/`) and ensure the "Install Plugin" button in `PluginMarketplace.tsx` actually downloads compiled release bundles (`plugin.zip`) from GitHub, extracts them into this folder, and runs them from real files on disk.

### Context & Files:
- [src-tauri/src/plugin_downloader.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/plugin_downloader.rs)
- [src-tauri/src/lib.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/lib.rs)
- [src/services/marketplace/GitHubPluginService.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/marketplace/GitHubPluginService.ts)
- [src/components/marketplace/PluginMarketplace.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/marketplace/PluginMarketplace.tsx)
- [src/components/settings/PluginsSettingsTab.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/settings/PluginsSettingsTab.tsx)
- Specifications: [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md) Section 5.9

### Detailed Implementation Tasks:

1. **Dedicated Download Directory Management (`src-tauri/src/plugin_downloader.rs`):**
   - Provide standard path resolution for downloaded plugins:
     - Default path: `<Documents>/TU-Cockpit/Plugins` or `<app_data_dir>/downloaded_plugins`.
     - Automatically create on startup.
   - Implement Tauri commands:
     - `get_downloaded_plugins_path() -> Result<String, String>`
     - `set_downloaded_plugins_path(new_path: String) -> Result<(), String>`
     - `reveal_downloaded_plugins_folder() -> Result<(), String>`
   - Expose this path in `PluginsSettingsTab.tsx` with a directory picker and "Open in Finder/Explorer" button.

2. **Real GitHub Download Pipeline (`plugin_downloader.rs` & `GitHubPluginService.ts`):**
   - In `install_plugin_from_github`:
     - Target directory: `<downloaded_plugins_path>/<plugin_id>/`.
     - Query GitHub Releases API for release asset `plugin.zip`.
     - If release asset exists, stream download bytes and unpack into `<downloaded_plugins_path>/<plugin_id>/`.
     - If no release tag exists yet on GitHub, provide clear feedback or fall back to repository release builder.
     - Extract `manifest.json` and entrypoint HTML. Read compiled HTML from disk into return payload.
     - Return `{ id, name, version, install_dir, entrypoint_html, ... }`.

3. **Marketplace Ingestion Update (`PluginMarketplace.tsx`):**
   - In `handleInstallPlugin`, do NOT bypass the GitHub download when installing from the marketplace!
   - Invoke `GitHubPluginService.installFromGitHub(repoUrl)`.
   - Call `installPlugin(result.manifest, result.htmlContent, "github", result.installDir)`.
   - Display real progress state (`Downloading...`, `Extracting...`, `Installed!`).

### Verification Runbook:
1. `npm run build`
2. `cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `feat(plugins): implement real github download pipeline into dedicated storage folder`
```

---

### Milestone 62 Prompt: Real Plugin Deletion Engine with Confirmation Modal & Safety Safeguards `[STATUS: COMPLETED ✅ - Commit 31d4700]`

```markdown
You are a senior desktop software engineer specializing in safe filesystem manipulation and accessible confirmation dialogues.

### Objective:
Implement a real plugin deletion engine in Rust that purges downloaded marketplace plugins from disk, accompanied by a mandatory "Confirm Deletion" modal dialog in the UI. Strictly enforce safeguards preventing any filesystem deletion of local DevStudio plugins.

### Context & Files:
- [src-tauri/src/plugin_downloader.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/plugin_downloader.rs)
- [src-tauri/src/lib.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/lib.rs)
- Create: `src/components/marketplace/ConfirmDeleteModal.tsx`
- [src/components/marketplace/PluginMarketplace.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/marketplace/PluginMarketplace.tsx)
- [src/store/useAppStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useAppStore.ts)
- Specifications: [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md) Section 5.9

### Detailed Implementation Tasks:

1. **Rust Deletion Engine (`src-tauri/src/plugin_downloader.rs`):**
   - Implement Tauri command:
     `delete_installed_plugin(plugin_id: String) -> Result<(), String>`
   - Security Validation:
     - Verify that the target plugin directory is strictly located inside the configured `<downloaded_plugins_path>`.
     - Reject any path traversal (`..`) or paths pointing outside the downloaded plugins folder (e.g. project root, `community-plugins/`, OS system folders).
     - Remove the directory recursively using `std::fs::remove_dir_all`.
   - Register command in `src-tauri/src/lib.rs`.

2. **Confirmation Modal (`src/components/marketplace/ConfirmDeleteModal.tsx`):**
   - Reusable modal dialog with backdrop blur and accessible focus management:
     - Title: "Uninstall Plugin"
     - Warning message:
       `"Are you sure you want to uninstall '{pluginName}'? This will permanently delete all downloaded files for this plugin from your computer."`
     - Destructive Action Button: "Delete Plugin" (red accent with trash icon).
     - Cancel Button: "Cancel" (neutral outline).

3. **Store & UI Integration (`useAppStore.ts` & `PluginMarketplace.tsx`):**
   - When student clicks delete icon on an installed plugin:
     - If `plugin.sourceType === "local"`, show an informative dialog: "Local Development Plugin: This plugin is linked to a local workspace on your computer. It cannot be deleted from the filesystem. You can unlink it from the cockpit view without affecting your files."
     - If `plugin.sourceType === "github"` (or marketplace download), open `ConfirmDeleteModal`.
     - Upon confirmation:
       - Call `invoke("delete_installed_plugin", { pluginId })`.
       - Call `uninstallPlugin(pluginId)` to clean up state and navigation dock.
       - Display a confirmation toast: `"{pluginName} was removed from your computer."`

### Verification Runbook:
1. `npm run build`
2. `cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `feat(plugins): implement safe physical plugin deletion and confirmation modal`
```

---

### Milestone 63 Prompt: In-Webview TUWEL "Add to Slide Vault" & TISS Auto-Sync Engine `[STATUS: COMPLETED ✅ - Commit fb82aa0]`

```markdown
You are a senior Tauri systems engineer specializing in webview DOM bridge automation and university portal integration.

### Objective:
Implement automatic calendar synchronization when navigating to TISS and inject an authentic "Add to Slide Vault" button next to all lecture slide and PDF download links inside the TUWEL child webview.

### Context & Files:
- [src-tauri/src/native_webview.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/native_webview.rs)
- [src-tauri/src/embedded_portals.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/embedded_portals.rs)
- [src-tauri/src/slide_vault.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/slide_vault.rs)
- Specifications: [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md) Sections 4.8 & 4.9

### Detailed Implementation Tasks:

1. **TUWEL "Add to Slide Vault" Resource Interception (`native_webview.rs`):**
   - Inject script into `tuwien-official-tuwel` webviews targeting `tuwel.tuwien.ac.at`:
     - Detects links matching `a[href*="/mod/resource/view.php"]`, `a[href*="/mod/folder/"]`, `a[href$=".pdf"]`.
     - Inserts compact button: `[📥 Add to Slide Vault]`.
     - On click: fetches PDF with session cookies as `ArrayBuffer` and invokes `save_slide_to_vault({ courseName, filename, bytes })`.
     - Updates button UI to `[✅ Saved to Vault]` with checkmark.

2. **TISS Timetable Auto-Sync Hook (`native_webview.rs`):**
   - On navigation to `tiss.tuwien.ac.at`, detect authenticated session and timetable export (`/personal/termin/ical`).
   - Fetches personal iCal feed and invokes `sync_tiss_ical(ical_content: String)`.
   - Parses events into local database and updates `tu-calendar`.

### Verification Runbook:
1. `npm run build`
2. `cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `feat(portals): inject tuwel slide vault buttons and tiss calendar auto-sync`
```

---

### Milestone 64 Prompt: Fix Plugin Layout Formatting & Zero-Mock Policy Eradication `[STATUS: COMPLETED ✅ - Commit d7a8f65]`

```markdown
You are a senior frontend engineer and CSS architecture specialist working across React 19, Tailwind CSS v4, and iframe sandboxes.

### Objective:
Fix unformatted / raw layout rendering in `tu-calendar` and `tu-room-radar`, and eradicate ALL synthetic dummy data across all 4 community plugins, replacing fake cards with authentic empty states and live data feeds.

### Context & Files:
- [community-plugins/tu-calendar/src/App.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-calendar/src/App.tsx)
- [community-plugins/tu-calendar/src/index.css](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-calendar/src/index.css)
- [community-plugins/tu-room-radar/src/App.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-room-radar/src/App.tsx)
- [community-plugins/tu-room-radar/src/index.css](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-room-radar/src/index.css)
- [community-plugins/tu-slide-vault/src/App.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-slide-vault/src/App.tsx)
- [community-plugins/tu-mensa/src/App.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-mensa/src/App.tsx)
- [src/services/marketplace/CommunityPluginBundles.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/marketplace/CommunityPluginBundles.ts)
- Specifications: [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md) Sections 5.6 & 5.7

### Detailed Implementation Tasks:

1. **Fix In-Frame CSS & Layout Formatting (`tu-calendar` & `tu-room-radar`):**
   - Inject self-contained CSS reset, flex column hierarchy, and `--tu-*` token fallbacks in both plugins so they format beautifully without raw HTML elements.

2. **Eradicate ALL Synthetic / Dummy Mock Data (Zero-Mock Policy):**
   - `tu-slide-vault`: Remove fake AlgoDat/DBS slides. Provide clean empty state ("No slides in vault yet...").
   - `tu-mensa`: Remove static fake menu entries. Connect to live daily lunch menu or real campus opening schedule.
   - `tu-calendar`: Remove dummy deadlines. Hydrate strictly from TISS auto-sync or student-created tasks.
   - `tu-room-radar`: Ground room list in authentic TU Wien rooms with real opening hours.

3. **Recompile Plugins & Update Single-File Bundles:**
   - In all 4 plugins, run `npm run build` with `vite-plugin-singlefile`.
   - Update `CommunityPluginBundles.ts` with newly compiled distributions.

### Verification Runbook:
1. `npm run build`
2. `cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `fix(plugins): fix layout formatting and enforce zero-mock policy across community tools`
```
