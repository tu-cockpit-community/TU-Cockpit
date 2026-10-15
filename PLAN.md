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
> - 🟢 **PHASES 1–16 (COMPLETED & READY FOR ARCHIVE):** Foundational Runtime, Portals, Org Auto-Discovery, Native Child-Webviews, Full-Bleed Canvas, In-App Updater, Workstation Streamlining, "TU Essentials", Invisibility Bus, Authentic Institutional Rendering, Direct SSO Autofill, Headless VoWi Reader, Autonomous Plugins (`tu-calendar`, `tu-slide-vault`, `tu-mensa`, `tu-room-radar`), Launching Reliability, Single-File Inlining, Unified Academic Spotlight, Workstation Status Bar & ICS Calendar Export, Live Functional Plugin Depth, Real GitHub Marketplace Telemetry & Workflow Error Rectification, Authentic University Workflow Ingestion: Physical Filesystem Slide Vault, Settings Modal Plugins Tab, In-Webview TUWEL Resource Interception ("Add to Slide Vault"), In-Webview TISS Timetable Auto-Sync, Zero-Mock Policy & Plugin Layout Formatting (Milestones 0–61).
>
---

# ==============================================================================
# 🟢 PART XVI: PHASE 16 — AUTHENTIC UNIVERSITY WORKFLOW INGESTION: PHYSICAL SLIDE VAULT, IN-WEBVIEW SYNC & ZERO-MOCK FORMATTING
# ==============================================================================

> **Phase 16 Summary & Objective:**  
> 1. **Settings Modal "Plugins" Tab & Physical Slide Vault:** Add a dedicated "Plugins" configuration tab in `SettingsModal.tsx`. Connect `tu-slide-vault` to a physical filesystem folder on the computer (default `~/Documents/TU-Cockpit/Slide-Vault/`) with custom directory selection via folder picker and native "Open in Finder / File Explorer" support.
> 2. **In-Webview TUWEL "Add to Slide Vault" Ingestion:** Inject an inline `[📥 Add to Slide Vault]` button adjacent to every lecture slide and PDF download link on `tuwel.tuwien.ac.at`. Clicking downloads the file through the authenticated session directly into `<SlideVault>/<CourseName>/<Filename>.pdf`.
> 3. **In-Webview TISS Timetable Auto-Sync:** When navigating to `https://tiss.tuwien.ac.at`, child webview hooks detect the student's authenticated session and personal iCal export URL, automatically syncing timetable events into the local database and updating `tu-calendar` seamlessly.
> 4. **Fix Layout Formatting & Zero-Mock Policy:** Rectify unstyled / raw rendering in `tu-calendar` and `tu-room-radar` by injecting self-contained layout baselines and CSS resets into iframes. Purge ALL fake mock data (dummy AlgoDat slides, static fake Mensa food items, dummy deadline tasks), replacing them with authentic live feeds and polished empty states.

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
     - `set_slide_vault_path(new_path: String) -> Result<(), String>`: Validates and updates the active storage path, creating the directory if missing.
     - `save_slide_to_vault(course_name: String, filename: String, bytes: Vec<u8>) -> Result<String, String>`:
       - Sanitizes course name and filename (strip illegal characters `/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`).
       - Creates subdirectory `<vault_path>/<sanitized_course>/`.
       - Writes `bytes` to `<vault_path>/<sanitized_course>/<sanitized_filename>`.
       - Returns the absolute destination path on success.
     - `list_slide_vault_files() -> Result<Vec<SlideFileRecord>, String>`:
       - Recursively or hierarchically reads the slide vault folder.
       - Returns `Vec<SlideFileRecord>` where each record contains `{ course: String, filename: String, path: String, size_bytes: u64, modified_timestamp: u64 }`.
     - `reveal_slide_vault_folder() -> Result<(), String>`:
       - Opens the slide vault folder in the native OS file explorer (Finder on macOS via `open`, File Explorer on Windows via `explorer`, xdg-open on Linux).
   - Export commands and register them in `src-tauri/src/lib.rs` under `generate_handler![...]`.

2. **Frontend Settings Tab (`src/components/settings/PluginsSettingsTab.tsx`):**
   - Create a clean, elegant settings panel styled with TU Cockpit tokens (`--tu-bg-surface`, `--tu-border`, `--tu-text-primary`, `--tu-accent`).
   - Section 1: **TU Slide Vault Configuration**
     - Display current directory path with folder icon.
     - "Change Directory" button: Opens native directory picker via `@tauri-apps/plugin-dialog` (`open({ directory: true })`) and updates backend via `invoke('set_slide_vault_path', { newPath })`.
     - "Open in Finder / Explorer" button: Invokes `reveal_slide_vault_folder`.
     - Display statistics: Total stored slides count and disk usage size.
   - Section 2: **Portal Integration & Automation Toggles**
     - Toggle: "TUWEL Resource Interception (Show 'Add to Slide Vault' on course pages)" (default true).
     - Toggle: "TISS Timetable Auto-Sync (Automatically sync calendar on portal visit)" (default true).
   - Integrate `PluginsSettingsTab.tsx` into `SettingsModal.tsx` as a top-level tab alongside "General", "Appearance", "Accounts", and "Updates", using a `<Puzzle />` or `<Blocks />` icon.

3. **State Management (`useAppStore.ts`):**
   - Add preferences: `slideVaultPath: string`, `tuwelInterceptionEnabled: boolean`, `tissAutoSyncEnabled: boolean`.
   - Persist changes to local storage / SQLite.

### Verification Runbook:
1. `npm run build`
2. `cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `feat(settings): add plugins tab and physical filesystem slide vault engine`
```

---

### Milestone 60 Prompt: In-Webview TUWEL "Add to Slide Vault" & TISS Auto-Sync Engine `[STATUS: COMPLETED ✅ - Commit fb82aa0]`

```markdown
You are a senior Tauri systems engineer specializing in webview DOM bridge automation and university portal integration.

### Objective:
Implement automatic calendar synchronization when navigating to TISS and inject an authentic "Add to Slide Vault" button next to all lecture slide and PDF download links inside the TUWEL child webview.

### Context & Files:
- [src-tauri/src/native_webview.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/native_webview.rs)
- [src-tauri/src/embedded_portals.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/embedded_portals.rs)
- [src-tauri/src/slide_vault.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/slide_vault.rs)
- [src/components/plugin-host/PluginHostManager.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/plugin-host/PluginHostManager.ts)
- Specifications: [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md) Sections 4.8 & 4.9

### Detailed Implementation Tasks:

1. **TUWEL "Add to Slide Vault" Resource Interception (`native_webview.rs`):**
   - In `native_webview.rs`, add an initialization script injected into `tuwien-official-tuwel` webviews on navigation:
     - Target host: `tuwel.tuwien.ac.at`.
     - Script detects resource links matching:
       - `a[href*="/mod/resource/view.php"]`
       - `a[href*="/mod/folder/"]`
       - `a[href$=".pdf"]`, `a[href*=".pdf?"]`
     - Inserts a compact, stylish button next to each link:
       `[📥 Add to Slide Vault]` styled with TU Wien Blue accent, subtle rounded pill border, and hover state.
     - When clicked by the student:
       - Prevent default navigation.
       - Extract Course Title from page DOM (e.g. `document.querySelector('.page-header-headings h1, .breadcrumb-item:nth-last-child(2)')?.textContent?.trim() || 'General'`).
       - Extract Resource Filename from anchor text or URL.
       - Fetch the PDF file data using authenticated in-webview `fetch(link.href, { credentials: 'include' })` as an `ArrayBuffer`.
       - Send the buffer to host Rust backend via Tauri IPC (`window.__TAURI__.core.invoke('save_slide_to_vault', { courseName, filename, bytes })`).
       - Update button UI to `[✅ Saved to Vault]` with green indicator and emit an event to notify the host shell.

2. **TISS Timetable Auto-Sync Hook (`native_webview.rs`):**
   - In `native_webview.rs`, add navigation listener for `tiss.tuwien.ac.at`:
     - When the student visits `tiss.tuwien.ac.at`, check for authenticated state or navigation to personal timetable/cal links (`/personal/termin/ical` or overview).
     - In-webview script triggers authenticated background fetch of the student's personal iCal schedule (`/personal/termin/ical` or fetches personal timetable token).
     - Sends iCal string payload to host via IPC `sync_tiss_ical(ical_content: String)`.
     - Rust parses iCal events, updates local SQLite store, and broadcasts event `calendar-events-synced` to the host shell and active `tu-calendar` instance.

3. **Slide Vault Plugin Update:**
   - Ensure `tu-slide-vault` listens for newly saved slides and displays the live list of files returned by `list_slide_vault_files`.

### Verification Runbook:
1. `npm run build`
2. `cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `feat(portals): inject tuwel slide vault buttons and tiss calendar auto-sync`
```

---

### Milestone 61 Prompt: Fix Plugin Layout Formatting & Zero-Mock Policy Eradication `[STATUS: COMPLETED ✅ - Commit d7a8f65]`

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
   - In both plugins, inspect why elements render unstyled:
     - Ensure `box-sizing: border-box`, explicit Flexbox/Grid CSS properties, container max-widths, and padding are declared with robust inline CSS or scoped stylesheet fallbacks.
     - Inject full CSS reset and CSS variable declarations (`--tu-bg-canvas: #0b0f17; --tu-bg-surface: #111827; --tu-text-primary: #f8fafc; --tu-border: #1e293b; --tu-accent: #006699;`) into `index.html` and `index.css`.
     - Ensure layout flex column fill (`min-h-screen`, `h-full`, `overflow-y-auto`) allows proper scrolling and prevents unstyled wrapping.

2. **Eradicate ALL Synthetic / Dummy Mock Data (Zero-Mock Policy):**
   - **`tu-slide-vault`:**
     - Remove fake default slides (AlgoDat Lecture 01, DBS Normalization).
     - Implement real empty state:
       `"Your Slide Vault is empty. In TUWEL, click 'Add to Slide Vault' on any course page, or drop PDF files here to begin."`
     - Integrate with physical filesystem list (`list_slide_vault_files`) or local file picker.
   - **`tu-mensa`:**
     - Purge static mock menu items.
     - Implement live daily lunch menu fetch or authentic weekly cafeteria schedule for TU Wien (Mensa Freihaus, Cafeteria Freihaus, Mensa Gußhaus, Buffet Schütte-Lihotzky).
     - When closed, display authentic operating hours ("Opens at 11:00 AM" / "Weekend - Closed").
   - **`tu-calendar`:**
     - Purge dummy deadlines ("AlgoDat Übung 3", "DBS Exam").
     - Default to authentic empty state: `"No upcoming deadlines. Sync your TISS calendar by visiting TISS or import an .ics file."`
   - **`tu-room-radar`:**
     - Ground room list strictly in authentic TU Wien rooms (Freihaus FH Hörsäle 1–8, Hauptgebäude Kuppelsaal, Informatikhörsaal, Gußhaus EI Hörsäle) with real opening schedules.

3. **Recompile Plugins & Update Single-File Bundles:**
   - In `community-plugins/tu-calendar`, `community-plugins/tu-slide-vault`, `community-plugins/tu-mensa`, `community-plugins/tu-room-radar`:
     - Run `npm run build` with `vite-plugin-singlefile`.
   - Update `COMMUNITY_CALENDAR_HTML`, `COMMUNITY_SLIDE_VAULT_HTML`, `COMMUNITY_MENSA_HTML`, and `COMMUNITY_ROOM_RADAR_HTML` in `src/services/marketplace/CommunityPluginBundles.ts` with the compiled single-file HTML distributions.

### Verification Runbook:
1. `npm run build`
2. `cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `fix(plugins): fix layout formatting and enforce zero-mock policy across community tools`
```
