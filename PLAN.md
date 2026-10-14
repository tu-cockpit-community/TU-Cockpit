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
>
> **Current Sprint Status:**
> - 🟢 **PHASES 1–7 (COMPLETED & ARCHIVED):** Foundational Runtime, Portals, Org Auto-Discovery, Native Child-Webviews, Full-Bleed Canvas, In-App Updater, Workstation Streamlining, "TU Essentials", and Invisibility Bus (Milestones 0–37).
> - 🟡 **PHASE 8 (ACTIVE SPRINT):** Portal Reliability, Authentic Institutional Rendering, Direct SSO Autofill & Headless VoWi Reader (Milestones 38–41).

---

# ==============================================================================
# 🟡 PART VIII: PHASE 8 — PORTAL RELIABILITY, AUTHENTIC RENDERING, SSO AUTOFILL & HEADLESS VOWI READER
# ==============================================================================

> **Phase 8 Summary & Architectural Goals:**  
> 1. **Decommission In-Page Website Theming & Restore Authentic Rendering:** In-page CSS injection (`!important` rules) broke Moodle YUI/Bootstrap components and TISS JSF tables, causing visual bugs and unreadable text. Phase 8 removes in-page theme injection from university portals, restoring 100% authentic, reliable institutional rendering while keeping Cockpit chrome theming intact.
> 2. **Eliminate Mouse Cursor Flickering:** Remove recurring `applyTheme` timeouts and eval loops. Clamp bounds synchronization with threshold checks ($\ge 1\text{px}$) to prevent subpixel layout fighting between WebKit and the host window.
> 3. **Correct Direct TUWEL SSO URL:** Update the primary TUWEL target to `https://tuwel.tuwien.ac.at/login/index.php` so clicking TUWEL immediately triggers university Shibboleth authentication (`login.tuwien.ac.at`) rather than landing on the generic unauthenticated homepage.
> 4. **In-Webview SSO/MFA Autofill Daemon:** Implement `inject_portal_autofill` in Rust. Read student matriculation number (`eXXXXXXXX`), encrypted password, and live TOTP token from `totp_vault`, injecting them directly into `login.tuwien.ac.at` form fields (`j_username`, `j_password`, `token`/`totp`) with a one-click manual toolbar trigger and automatic post-navigation injection.
> 5. **Native Headless VoWi MediaWiki Reader:** Build a high-performance native React reader using the public MediaWiki Action API (`https://vowi.fsinf.at/api.php`) for instant course search, student reviews, and exam tips, while preserving a toggle to open the live web portal.
> 6. **Headless Deadlines Invariant:** Guarantee assignment tracking remains headless via the iCal aggregator (`deadline_aggregator.rs`), pulling tasks in the background without needing to load the heavy TUWEL Moodle web page.

---

## 52. Target File Hierarchy & Dependencies

```
Tuwel-Tools/
├── src/
│   ├── App.tsx                                 # Updates official TUWEL URL to /login/index.php
│   ├── components/
│   │   ├── plugin-host/
│   │   │   └── NativePortalContainer.tsx       # Removes theme eval loops; adds Autofill button; stabilizes bounds
│   │   └── vowi/
│   │       └── VoWiReader.tsx                  # Native React MediaWiki reader (courses, reviews, search)
│   ├── plugins/
│   │   └── official/
│   │       ├── OfficialPlugins.ts              # Updates TUWEL entrypoint to https://tuwel.tuwien.ac.at/login/index.php
│   │       └── tuwel/manifest.json             # Updates official manifest target URL
│   ├── services/
│   │   ├── marketplace/
│   │   │   └── GitHubPluginService.ts          # Updates official catalog definition
│   │   ├── portal/
│   │   │   └── PortalThemeInjector.ts          # Deprecates forced !important styles; retains utilities
│   │   └── vowi/
│   │       └── VoWiApiService.ts               # MediaWiki action=opensearch & action=parse client
│   └── store/
│       └── useThemeStore.ts                    # Focuses theming on Cockpit shell & UI chrome
│
└── src-tauri/
    └── src/
        ├── embedded_portals.rs                 # Updates default TUWEL URL to /login/index.php
        ├── lib.rs                              # Registers inject_portal_autofill command
        └── native_webview.rs                   # Removes PORTAL_INIT_SCRIPT style tags; adds inject_portal_autofill
```

---

## 53. Phase 8 AI Worker Agent Prompts & Step-by-Step Implementation Milestones

---

### Milestone 38 Prompt: Decommission In-Page Theming Injection & Eliminate Mouse Flickering `[STATUS: COMPLETED ✅ - Commit c660428]`

```markdown
You are a desktop core and frontend runtime engineer working on TU Cockpit.

### Objective:
1. Decommission artificial in-page CSS style injection into live university portals (TUWEL, TISS, VoWi, TU Maps). Restore 100% authentic, unmodified website layouts so Moodle quizzes, JavaServer Faces dropdowns, and exam forms render with complete reliability.
2. Eliminate mouse cursor flickering on TUWEL and TISS caused by repeated theme evaluation timeouts and continuous WebKit pointer re-evaluations.

### Tasks:
1. In `src-tauri/src/native_webview.rs`:
   - Remove `PORTAL_INIT_SCRIPT` style tag injection in `WebviewBuilder` (strip `<style id="tu-cockpit-injected-theme">`).
   - Deprecate or no-op `inject_portal_theme`: return `Ok(())` without executing CSS DOM mutations that corrupt third-party web elements.
2. In `src/services/portal/PortalThemeInjector.ts`:
   - Clear out the destructive `!important` rule overrides (`TUWEL_RULES`, `TISS_RULES`, `VOWI_RULES`, `TUMAPS_RULES`) that forced background and text colors onto third-party components.
3. In `src/components/plugin-host/NativePortalContainer.tsx`:
   - Remove all `applyTheme` callbacks, `setTimeout(applyTheme, ...)` timers, and theme injection `useEffect` hooks.
   - Stabilize bounds synchronization:
     - Only dispatch `resize_native_portal` IPC if bounds have changed by $\ge 1$px (`Math.abs(last.x - x) >= 1 || Math.abs(last.y - y) >= 1 || Math.abs(last.width - width) >= 1 || Math.abs(last.height - height) >= 1`).
     - Remove redundant interval timers that fire during steady-state browsing.
   - Prevent mouse cursor flickering:
     - Ensure the DOM placeholder container behind the child webview has `pointer-events: none` and `user-select: none` so mouse pointer events are cleanly owned by the native child webview without boundary stutter.
4. In `src/components/settings/ThemeCustomizer.tsx`:
   - Add a brief helper badge or note: "Cockpit Chrome Theme (Institutional websites render in authentic mode for exam and form stability)."

### Verification:
- Run `npm run build` and `SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk cargo check --manifest-path src-tauri/Cargo.toml`.
- Open TUWEL and TISS:
  - Verify TUWEL and TISS render with their authentic, native institutional styling with crisp contrast.
  - Hover and move the mouse over links, navigation drawers, and course tables: verify the cursor does NOT flicker.
  - Toggle the sidebar with `Cmd+B`: verify the viewport resizes cleanly with zero jitter or lag.

### Git Hygiene:
Commit message:
`refactor(portals): decommission in-page theming and eliminate mouse cursor flickering`
```

---

### Milestone 39 Prompt: Direct Shibboleth Login Linkage & In-Webview SSO/MFA Autofill Daemon `[STATUS: COMPLETED ✅ - Commit 867d5dc]`

```markdown
You are a security and desktop backend engineer working on TU Cockpit.

### Objective:
1. Point the official TUWEL portal directly to its SSO login entrypoint (`https://tuwel.tuwien.ac.at/login/index.php`) so users immediately trigger university authentication instead of landing on the unauthenticated home screen.
2. Connect the credential and TOTP vault to the live child webview via an in-webview autofill daemon IPC command (`inject_portal_autofill`).

### Tasks:
1. Update TUWEL Target URL:
   - In `src/App.tsx`: change `"tuwien.official.tuwel"` default URL to `"https://tuwel.tuwien.ac.at/login/index.php"`.
   - In `src/plugins/official/OfficialPlugins.ts`: update TUWEL manifest URL to `"https://tuwel.tuwien.ac.at/login/index.php"`.
   - In `src/plugins/official/tuwel/manifest.json`: update `"url"` to `"https://tuwel.tuwien.ac.at/login/index.php"`.
   - In `src/services/marketplace/GitHubPluginService.ts`: update TUWEL catalog entry to `"https://tuwel.tuwien.ac.at/login/index.php"`.
   - In `src-tauri/src/embedded_portals.rs`: update `"tuwel"` default URL to `"https://tuwel.tuwien.ac.at/login/index.php"`.
2. In `src-tauri/src/native_webview.rs`:
   - Implement `inject_portal_autofill(app: AppHandle, portal_id: String) -> Result<bool, String>`:
     - Look up the child webview by `sanitize_portal_label(&portal_id)`.
     - Fetch `payload = crate::totp_vault::get_autofill_payload()?`.
     - If `payload.auto_fill` is false or credentials are empty, return `Ok(false)`.
     - Construct a self-contained JavaScript snippet using `payload.username`, `payload.password`, and `payload.totp_code`:
       - Detects `input[name="j_username"]`, `input#username`, `input[autocomplete="username"]` and sets the value + dispatches `input` and `change` events.
       - Detects `input[name="j_password"]`, `input#password`, `input[type="password"]` and sets the value + dispatches events.
       - Detects MFA fields (`input[name="token"]`, `input[name="totp"]`, `input[name="otp"]`, `input#token`) and fills `payload.totp_code`.
       - Displays a non-intrusive floating badge: `🔐 Autofilled by TU Cockpit`.
     - Execute `webview.eval(&script)`.
     - Return `Ok(true)`.
   - In `src-tauri/src/lib.rs`, register `inject_portal_autofill` in `tauri::generate_handler![]`.
3. In `src/components/plugin-host/NativePortalContainer.tsx`:
   - Add an **Autofill** button in the header toolbar (`<KeyRound className="w-3.5 h-3.5 text-accent" />` + label "Autofill"):
     - When clicked, calls `invoke("inject_portal_autofill", { portalId })`.
   - Automatically call `invoke("inject_portal_autofill", { portalId })` 700ms and 2000ms after container mount to seamlessly catch Shibboleth SSO redirects.

### Verification:
- Run `npm run build` and `cargo check`.
- Set student credentials and a test TOTP secret in Settings -> Account & Autofill.
- Click on TUWEL in the sidebar:
  - Verify it navigates directly to `https://tuwel.tuwien.ac.at/login/index.php` and redirects to `login.tuwien.ac.at`.
  - Verify credentials and MFA code are automatically filled (or instantly filled upon clicking the "Autofill" button in the toolbar).
  - Verify the floating badge `🔐 Autofilled by TU Cockpit` appears.

### Git Hygiene:
Commit message:
`feat(auth): implement direct tuwel sso linkage and in-webview autofill daemon`
```

---

### Milestone 40 Prompt: Native Headless VoWi MediaWiki API Reader `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a frontend applications engineer working on student utilities in TU Cockpit.

### Objective:
Implement a native React reader for VoWi using the public MediaWiki API (`https://vowi.fsinf.at/api.php`). This provides instantaneous, high-performance course information, student reviews, and exam tips without iframe or child-webiew overhead, while retaining an option to switch to the live portal.

### Tasks:
1. Create `src/services/vowi/VoWiApiService.ts`:
   - Implement `searchCourses(query: string): Promise<Array<{ title: string; snippet?: string; url: string }>>`:
     - Calls `https://vowi.fsinf.at/api.php?action=opensearch&search={query}&limit=15&format=json&origin=*`.
   - Implement `fetchPageContent(title: string): Promise<{ title: string; html: string; rawText: string }>`:
     - Calls `https://vowi.fsinf.at/api.php?action=parse&page={title}&prop=text|wikitext&format=json&origin=*`.
     - Cleans external links to open safely in external browser or internal navigation.
2. Create `src/components/vowi/VoWiReader.tsx`:
   - Search bar with instant debounced course lookup (e.g. "Analysis 1", "Algorithmen und Datenstrukturen", "Einführung in die Programmierung", "VU").
   - Course overview layout: displays course summary, difficulty ratings, recommendations, and exam tips in clean native React with TU Cockpit dark/light styling.
   - Header control: "View Live Wiki Portal" toggle button that seamlessly switches the view to the live child webview (`NativePortalContainer` for `tuwien.official.vowi`).
3. In `src/App.tsx`:
   - When the active plugin is `tuwien.official.vowi`, provide seamless switching between `<VoWiReader />` (default reading view) and `<NativePortalContainer />` (live interactive wiki view).

### Verification:
- Run `npm run build` and `cargo check`.
- Open VoWi from the sidebar:
  - Search for a common TU Wien course (e.g. "Algorithmen" or "Analysis").
  - Click a search result: verify the course tips, student feedback, and summaries load instantaneously in the native reader.
  - Click "View Live Wiki Portal": verify it seamlessly loads the full `vowi.fsinf.at` page in the native webview.

### Git Hygiene:
Commit message:
`feat(vowi): implement native headless mediawiki api reader with live portal toggle`
```

---

### Milestone 41 Prompt: Viewport Stability Polish & Headless Deadlines Aggregator Invariant `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a desktop UI and runtime engineer working on TU Cockpit.

### Objective:
Polish native child-webview viewport controls (URL display, HTTPS security lock, reload, detach) and guarantee that assignment deadlines remain headless via the background iCal aggregator.

### Tasks:
1. In `src/components/plugin-host/NativePortalContainer.tsx`:
   - Polish the header toolbar:
     - Clean portal badge ("TUWEL", "TISS", "VoWi", "TU Maps") with official TU blue styling.
     - HTTPS Lock icon with status tooltip ("Secure Institutional Connection").
     - Reload button (`<RotateCw />`), Back (`<ChevronLeft />`), Forward (`<ChevronRight />`), and Zoom controls (`[-] 100% [+]`).
     - "Detach Window" button (`<ExternalLink />`) allowing students to pop out the portal into a secondary desktop monitor.
2. In `src/store/useDeadlineStore.ts` and `src/components/deadlines/DeadlineAgendaModal.tsx`:
   - Verify that the iCal feed aggregator (`deadline_aggregator.rs`) parses assignment dates, deadlines, and course titles in the background.
   - Ensure students can check their upcoming submission deadlines directly in the agenda modal without needing to load the heavy TUWEL Moodle web page.

### Verification:
- Run `npm run build` and `cargo check`.
- Open TUWEL, TISS, and VoWi:
  - Verify toolbar controls function smoothly (Back, Forward, Zoom, Reload).
  - Open Deadlines agenda: verify assignments are displayed from local cache/iCal feed with zero network delay.

### Git Hygiene:
Commit message:
`polish(portals): enhance viewport toolbar controls and solidify headless deadlines aggregator`
```
