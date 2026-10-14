# TU Cockpit: Active Sprint Plan & Execution Roadmap

> **Target Ecosystem:** Desktop Hub & Dynamic Plugin Ecosystem for TU Wien Students  
> **Core Technologies:** Tauri v2, Rust (2021+), React 19, TypeScript 5.5+, Tailwind CSS v4, SQLite (WAL mode), WebCrypto E2EE  
> **Official Repository:** [`tu-cockpit-community/TU-Cockpit`](https://github.com/tu-cockpit-community/TU-Cockpit)  
> **Living Specifications:** See [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md)  
> **Codebase Navigation Map:** See [PROJECT_MAP.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/PROJECT_MAP.md)  
> **Swarm Protocol & Runbook:** See [AGENTS.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/AGENTS.md)  
> **Historical Archive (Milestones 0–33):** See [docs/archive/PHASES_1_TO_6.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASES_1_TO_6.md)  
>
> **Current Sprint Status:**
> - 🟢 **PHASES 1–6 (COMPLETED & ARCHIVED):** Foundational Runtime, Portals, Org Auto-Discovery, Native Child-Webviews, Full-Bleed Canvas, In-App Updater, Workstation Streamlining, "TU Essentials", and Community Slide Vault Blueprint.
> - 🟢 **PHASE 7 (COMPLETED ✅):** Native Child-Webview Orchestration, Modal Invisibility Bus, Anti-Stuck Defenses, and In-Page Theme & Style Injection (Milestones 34–37)

---

# ==============================================================================
# 🟢 PART VII: PHASE 7 — NATIVE CHILD-WEBVIEW ORCHESTRATION, MODAL VISIBILITY BUS & IN-PAGE THEME INJECTION (COMPLETED ✅)
# ==============================================================================

> **Phase 7 Summary & Objective:**  
> Phase 7 tackles the core usability and rendering challenges of embedding institutional portals (TISS, TUWEL, VoWi, TU Maps):
> 1. **Resolve the Z-Index Overlay Problem:** Because Tauri v2 native child webviews (`tauri::Webview`) are operating system window handles rather than HTML elements, they physically render on top of all React modals (Settings, Command Palette `Cmd+K`, Login, Category Manager) and intercept mouse clicks. Phase 7 implements a **Global Overlay Coordinator & Webview Invisibility Bus** that instantly and losslessly hides native webviews when any modal or overlay is open, restoring them seamlessly upon closure with zero page reload or state loss.
> 2. **Eliminate Freezing & Coordinate Desync:** Fix webviews getting stuck during rapid sidebar collapse/expand animations (`Cmd+B`) and window resizing by introducing requestAnimationFrame-throttled bounds calculations and exclusive single-portal lifecycle invariants.
> 3. **In-Page Theme & Style Injection:** Confirm and implement full website theming inside native child webviews! Utilizing Tauri v2's `initialization_script` and `webview.eval()` APIs, custom curated stylesheets (`tuwel.css`, `tiss.css`, `vowi.css`, `tumaps.css`) and dynamic `--tu-*` CSS tokens are injected directly into institutional pages, eliminating white flashes and harmonizing portals with student themes in real time.
> 4. **Enhanced Navigation Toolbar & Usability Controls:** Add Back/Forward history navigation, in-page zoom controls, and clean up cumbersome university banners.

---

## 48. Architectural Problem Analysis: The Native Webview Hierarchy in Tauri v2

### 48.1 OS View Surface vs. HTML DOM Elements
In Tauri v2, when `window.add_child(webview_builder, pos, size)` executes in Rust, the operating system creates a native view (`WKWebView` on macOS, `CoreWebView2Controller` on Windows, `WebKitWebView` on Linux) positioned as a child subview of the window.

```
OPERATING SYSTEM VIEW HIERARCHY (THE ROOT CAUSE):
+-----------------------------------------------------------------------------------+
| OS Window Container (`NSWindow` / `HWND`)                                         |
|                                                                                   |
|  [Layer 1: Main React Webview]                                                    |
|  - Renders Navigation Sidebar, Executive Header                                   |
|  - Renders Modals (`SettingsModal`, `CommandPalette`, `LoginModal` at z-index: 50)|
|                                                                                   |
|  [Layer 2: Native Child Webview (`tauri::Webview`)] <-- SITS AT NATIVE OS LEVEL! |
|  - Renders live TUWEL / TISS page                                                 |
|  - Sits PHYSICALLY ON TOP OF Layer 1!                                             |
|  - Intercepts all clicks and obscures any HTML modal opening in that coordinate!   |
+-----------------------------------------------------------------------------------+
```

### 48.2 The Solution: The Lossless Visibility Bus
Because Tauri v2 webviews remain resident in memory when hidden via `webview.hide()`, the web page's JavaScript execution, form inputs, video player position, and Shibboleth session remain **100% active**. Hiding takes **0 milliseconds**.

```
VISIBILITY BUS ORCHESTRATION:
[Student presses Cmd+K or clicks Settings]
         │
         ▼
[Global useOverlayStore.isAnyOverlayActive = true]
         │
         ▼
[Rust IPC: set_portals_visibility(false)] ──► Native Webview hides instantly (0ms)
                                                │
                                                ▼
                                         [React HTML Modal displays unobstructed]
                                                │
                                    [Student closes Modal]
                                                │
                                                ▼
[Rust IPC: set_portals_visibility(true)]  ──► Native Webview reveals instantly!
                                              (Zero reload, form data preserved)
```

---

## 49. In-Page Theme Injection Architecture (Tauri v2)

### 49.1 Is It Possible to Change What is Displayed on the Websites?
**YES. It is 100% possible.** Tauri v2 provides direct, unrestricted access to the webview DOM:

1. **`WebviewBuilder::initialization_script(&str)`:**
   Executes arbitrary JavaScript in every page/frame **before any server script runs**. We inject a `<style id="tu-cockpit-injected-theme">` tag that attaches immediately as the document is created, preventing bright white flashes during dark mode browsing!
2. **`webview.eval(&str)`:**
   Executes JavaScript dynamically at runtime. When the student changes their theme in Settings (`useThemeStore`), Rust updates the injected `<style>` tag in real time without refreshing the page!

```
IN-PAGE THEME INJECTION FLOW:
+---------------------+      theme tokens change      +---------------------------------+
| useThemeStore (CSS) | ────────────────────────────► | Rust: inject_portal_theme(css)  |
+---------------------+                               +---------------------------------+
                                                                      │
                                                   webview.eval(...)  │
                                                                      ▼
                                                      +---------------------------------+
                                                      | TUWEL / TISS Native Webview     |
                                                      | <style id="tu-cockpit-theme">   |
                                                      |   body { background: #0f172a! } |
                                                      |   .card { border: #334155! }    |
                                                      | </style>                        |
                                                      +---------------------------------+
```

---

## 50. Phase 7 Target File Hierarchy & Dependencies

```
Tuwel-Tools/
├── src/
│   ├── App.tsx                                 # Connects overlay coordinator; calls hide_all_native_portals on view change
│   ├── components/
│   │   ├── palette/
│   │   │   └── CommandPalette.tsx              # Registers open/close state with useOverlayStore
│   │   ├── plugin-host/
│   │   │   └── NativePortalContainer.tsx       # Subscribes to overlay bus; RAF-throttled bounds; theme eval integration
│   │   └── settings/
│   │       ├── SettingsModal.tsx               # Registers open/close state with useOverlayStore
│   │       └── ThemeCustomizer.tsx             # Broadcasts theme updates to active portals
│   ├── services/
│   │   └── portal/
│   │       └── PortalThemeInjector.ts          # Compiles CSS token rules for TUWEL, TISS, VoWi, TU Maps
│   └── store/
│       └── useOverlayStore.ts                  # Global overlay coordinator tracking modal state
│
└── src-tauri/
    └── src/
        ├── lib.rs                              # Registers set_portals_visibility, inject_portal_theme, portal navigation
        └── native_webview.rs                   # Visibility bus, initialization scripts, bounds clamping, eval engine
```

---

## 51. Phase 7 AI Worker Agent Prompts & Step-by-Step Implementation Milestones

---

### Milestone 34 Prompt: Global Overlay Coordinator & Webview Invisibility Bus `[STATUS: COMPLETED ✅ - Commit 4a8ce76]`

```markdown
You are a desktop core and frontend engineer working on TU Cockpit.

### Objective:
Fix the critical bug where native child-webviews (TUWEL, TISS, VoWi, TU Maps) render on top of React modals (Command Palette `Cmd+K`, Settings, Login, Category Manager, Sync), obscuring them and trapping mouse clicks.

### Tasks:
1. Create `src/store/useOverlayStore.ts`:
   - Define `OverlayState`:
     ```typescript
     interface OverlayState {
       activeOverlays: Set<string>;
       openOverlay: (id: string) => void;
       closeOverlay: (id: string) => void;
       isAnyOverlayActive: boolean;
     }
     ```
   - Whenever `activeOverlays.size > 0`, `isAnyOverlayActive` is `true`.
2. In `src-tauri/src/native_webview.rs`:
   - Implement `set_portals_visibility(app: AppHandle, visible: bool) -> Result<(), String>`:
     - Iterates all known portal labels (`portal_tuwien_official_tuwel`, `portal_tuwien_official_tiss`, `portal_tuwien_official_vowi`, `portal_tuwien_official_tumaps`).
     - If `visible == false`, invokes `.hide()` on each existing webview.
     - If `visible == true`, checks which portal should be active and invokes `.show()`.
   - Implement `hide_all_native_portals(app: AppHandle) -> Result<(), String>`.
   - In `src-tauri/src/lib.rs`, register `set_portals_visibility` and `hide_all_native_portals` in `tauri::generate_handler![]`.
3. In `src/components/plugin-host/NativePortalContainer.tsx`:
   - Subscribe to `useOverlayStore((state) => state.isAnyOverlayActive)`.
   - When `isAnyOverlayActive` changes:
     - If `true`, call `invoke("set_portals_visibility", { visible: false })`.
     - If `false`, call `invoke("set_portals_visibility", { visible: true })` and refresh bounds.
4. In `src/App.tsx`:
   - In a `useEffect` on `activeView`, if `activeView !== "plugin"`, call `invoke("hide_all_native_portals")`.
   - Connect `isSettingsModalOpen`, `isSyncModalOpen`, etc. to `useOverlayStore` via `openOverlay("settings")` / `closeOverlay("settings")`.
5. In `src/components/palette/CommandPalette.tsx`:
   - Register open/close lifecycle with `useOverlayStore`: `openOverlay("palette")` when opened, `closeOverlay("palette")` when closed.

### Verification:
- Run `npm run build` and `SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk cargo check --manifest-path src-tauri/Cargo.toml`.
- Open TUWEL or TISS:
  - Press `Cmd+K`: verify Command Palette appears cleanly in front, receives typing and arrow key navigation, and is NOT blocked by the portal.
  - Press `Escape`: verify Command Palette closes and the portal re-appears with form state and scroll position preserved.
  - Click Settings gear: verify SettingsModal opens cleanly above the canvas.

### Git Hygiene:
Commit message:
`fix(portals): implement global overlay coordinator and webview invisibility bus`
```

---

### Milestone 35 Prompt: High-Frequency Bounds Synchronization & Anti-Freezing Defenses `[STATUS: COMPLETED ✅ - Commit d5b9330]`

```markdown
You are a desktop runtime engineer working on Tauri child webview orchestration in TU Cockpit.

### Objective:
Eliminate native webview freezing, coordinate stutter, and layout desync during sidebar collapse/expand animations (`Cmd+B`), dock orientation switching, and window resizing.

### Tasks:
1. In `src/components/plugin-host/NativePortalContainer.tsx`:
   - Replace unthrottled `ResizeObserver` callbacks with a `requestAnimationFrame`-throttled loop:
     - Store pending RAF ID and only dispatch `resize_native_portal` when dimensions actually change.
     - Round coordinates and dimensions with `Math.round`.
   - Listen to CSS transition lifecycle:
     - When the sidebar toggles (`Cmd+B`), the CSS width animates over 200ms (`transition-all duration-200`).
     - Run a smooth RAF tracking loop for 220ms post-toggle to keep the webview locked to the container edge with zero lag.
2. In `src-tauri/src/native_webview.rs`:
   - In `create_or_show_native_portal` and `resize_native_portal`:
     - Guard against zero or negative dimensions (clamp `width = width.max(10.0)`, `height = height.max(10.0)`).
     - Explicitly use `LogicalPosition::new(x, y)` and `LogicalSize::new(width, height)`.
   - Enforce exclusive portal visibility:
     - When showing portal `X`, atomically hide all other portals in the loop so multiple child webviews never fight for focus.
3. In `src/components/plugin-host/NativePortalContainer.tsx`:
   - Add a manual recovery icon (`RotateCw`) in the top bar that re-triggers bounds synchronization if ever requested by the user.

### Verification:
- Run `npm run build` and `cargo check`.
- In TUWEL or TISS:
  - Press `Cmd+B` rapidly 10 times: verify the child webview animates fluidly into the 56px collapsed layout and back without clipping or freezing.
  - Drag and resize the desktop window vigorously: verify the webview resizes cleanly without glitching.

### Git Hygiene:
Commit message:
`perf(portals): implement requestanimationframe bounds synchronization and transition defenses`
```

---

### Milestone 36 Prompt: In-Page Theme & CSS Style Injection Engine for Native Portals `[STATUS: COMPLETED ✅ - Commit 9b1c5e3]`

```markdown
You are a frontend theming and webview integration engineer working on TU Cockpit.

### Objective:
Implement in-page CSS theme and style injection directly into live institutional portals (TUWEL, TISS, VoWi, TU Maps) in Tauri v2 native child webviews.

### Tasks:
1. In `src-tauri/src/native_webview.rs`:
   - In `create_or_show_native_portal`:
     - Add an `initialization_script` to `WebviewBuilder`:
       ```javascript
       (function() {
         window.__TU_COCKPIT_THEMED__ = true;
         function inject() {
           if (!document.getElementById('tu-cockpit-injected-theme')) {
             const style = document.createElement('style');
             style.id = 'tu-cockpit-injected-theme';
             (document.head || document.documentElement).appendChild(style);
           }
         }
         inject();
         document.addEventListener('DOMContentLoaded', inject);
       })();
       ```
     - This guarantees the `<style>` tag exists on every page navigation before white pixels render.
   - Implement `inject_portal_theme(app: AppHandle, portal_id: String, css: String) -> Result<(), String>`:
     - Retrieves the webview by sanitized label.
     - Executes:
       ```rust
       let escaped_css = serde_json::to_string(&css).map_err(|e| e.to_string())?;
       let script = format!(
           r#"(() => {{
               let el = document.getElementById('tu-cockpit-injected-theme');
               if (!el) {{
                   el = document.createElement('style');
                   el.id = 'tu-cockpit-injected-theme';
                   (document.head || document.documentElement).appendChild(el);
               }}
               el.textContent = {};
           }})();"#,
           escaped_css
       );
       webview.eval(&script).map_err(|e| e.to_string())?;
       ```
   - In `src-tauri/src/lib.rs`, register `inject_portal_theme` in `tauri::generate_handler![]`.
2. In `src/services/portal/PortalThemeInjector.ts`:
   - Verify rules for TUWEL (`TUWEL_RULES`), TISS (`TISS_RULES`), VoWi (`VOWI_RULES`), and TU Maps (`TUMAPS_RULES`).
   - Export helper function `generateThemePayload(portalId: string, tokens: ThemeTokens, fontSans: string, uiScale: number): string`.
3. In `src/components/plugin-host/NativePortalContainer.tsx`:
   - Connect to `useThemeStore`:
     ```tsx
     const { tokens, fontSans, uiScale } = useThemeStore();
     ```
   - In a `useEffect` on `[portalId, tokens, fontSans, uiScale]`:
     - Generate the compiled CSS string using `PortalThemeInjector`.
     - Invoke `inject_portal_theme({ portalId, css })`.
   - Also invoke theme injection 500ms and 1500ms after initial mount to guarantee injection after cross-origin page loads.

### Verification:
- Run `npm run build` and `cargo check`.
- Launch the application and open TUWEL:
  - **Verify:** The page renders in sleek dark mode with `--tu-bg-base`, `--tu-border`, and `--tu-accent` styling!
  - Open Settings -> Themes, and switch to "TU Wien Daylight" or "High Contrast":
  - **Verify:** The live portal instantly changes its colors without reloading or losing student session state!

### Git Hygiene:
Commit message:
`feat(theming): implement live in-page css style injection for native child webviews`
```

---

### Milestone 37 Prompt: Portal Navigation Toolbar, In-Page Zoom & Usability Polish `[STATUS: COMPLETED ✅ - Commit 8eb2a2e]`

```markdown
You are a frontend UI engineer working on the desktop portal experience in TU Cockpit.

### Objective:
Provide full student browsing controls (Back, Forward, Reload, Zoom scaling) in the Native Viewport header and clean up cumbersome legacy university banners via targeted CSS.

### Tasks:
1. In `src-tauri/src/native_webview.rs`:
   - Implement `portal_go_back(app: AppHandle, portal_id: String) -> Result<(), String>`:
     `webview.eval("window.history.back()")`.
   - Implement `portal_go_forward(app: AppHandle, portal_id: String) -> Result<(), String>`:
     `webview.eval("window.history.forward()")`.
   - In `src-tauri/src/lib.rs`, register these commands.
2. In `src/components/plugin-host/NativePortalContainer.tsx`:
   - Enhance the header toolbar:
     - Add Back (`<ChevronLeft />`) and Forward (`<ChevronRight />`) buttons.
     - Add Zoom controls: `[-]` `[Zoom %]` `[+]` that adjust zoom via CSS zoom / transform or Tauri webview zoom API.
     - Add active page security indicator (`<Lock />` HTTPS badge).
     - Display clean portal title and favicon.
3. In `src/styles/embedded-themes/tuwel.css` and `tiss.css`:
   - Refine rules to hide redundant university headers (e.g. legacy top marketing banner on TUWEL) so coursework and course modules take 100% of the view.
   - Add sticky headers to TISS grade and exam tables.

### Verification:
- Run `npm run build` and `cargo check`.
- Click into course modules in TUWEL:
  - Click the Back button in the Native Viewport toolbar: verify it returns to the previous page.
  - Test the Zoom controls: verify content scales legibly.
  - Verify that the layout feels clean, native, and deeply integrated into the workstation.

### Git Hygiene:
Commit message:
`feat(portals): implement navigation toolbar, in-page zoom, and layout polish`
```
