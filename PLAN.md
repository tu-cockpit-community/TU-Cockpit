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
> - Milestones 59–64 (Phase 16): See [docs/archive/PHASE_16.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASE_16.md)  
> - Milestones 65–66 (Phase 17): See [docs/archive/PHASE_17.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASE_17.md)  
> - Milestones 67–69 (Phase 18): See [docs/archive/PHASE_18.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASE_18.md)  
> - Milestones 70–72 (Phase 19): See [docs/archive/PHASE_19.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASE_19.md)  
>
> **Current Sprint Status:**
> - 🟢 **PHASES 1–19 (COMPLETED & ARCHIVED):** Foundational Runtime, Portals, Org Auto-Discovery, Native Child-Webviews, Full-Bleed Canvas, In-App Updater, Workstation Streamlining, "TU Essentials", Invisibility Bus, Authentic Institutional Rendering, Direct SSO Autofill, Headless VoWi Reader, Autonomous Plugins (`tu-calendar`, `tu-slide-vault`, `tu-mensa`, `tu-room-radar`), Launching Reliability, Single-File Inlining, Unified Academic Spotlight, Workstation Status Bar & ICS Calendar Export, Live Functional Plugin Depth, Real GitHub Marketplace Telemetry, Physical Filesystem Slide Vault, DevStudio Staging Environment, Real GitHub Plugin Download & Safe Deletion Engine, `dev-plugins/` Consolidation & Storage Configuration, Multi-Platform Target Build Suite & 1-Click CI/CD Artifact Builder, Academic Calendar Engine, Real-Time Campus Sentinel & Power-User Desktop Shortcuts (Milestones 0–72).
> - 🟡 **PHASE 20 (ACTIVE SPRINT):** Native System Tray Daemon, Global Hotkey Summoner & Desktop Harmony (Milestones 73–75).

---

# ==============================================================================
# 🟡 PART XX: PHASE 20 — NATIVE SYSTEM TRAY DAEMON, GLOBAL HOTKEY SUMMONER & DESKTOP HARMONY
# ==============================================================================

> **Phase 20 Summary & Objective:**  
> 1. **Native OS System Tray Menu:** Provide a system tray icon with single-click navigation (Open TUWEL, Open TISS, View Slide Vault, Check Deadlines, Quit) that remains active in the background.
> 2. **Global Background Hotkey Summoner (`Cmd+Shift+Space` / `Alt+Space`):** Allow students to summon the TU Cockpit window to foreground and spotlight search from anywhere on their OS (e.g. while taking notes or reading a paper).
> 3. **Minimize-to-Tray Window Management:** Allow users to close the main window into the system tray without stopping deadline background notifications.

---

## 73. Phase 20 AI Worker Agent Prompts & Step-by-Step Implementation Milestones

---

### Milestone 73 Prompt: Native OS System Tray Menu Integration `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a systems desktop engineer integrating Tauri v2 system tray capabilities.

### Objective:
Integrate a native system tray menu in `src-tauri/src/lib.rs` with quick-access menu items for TUWEL, TISS, Slide Vault, Deadlines, and graceful window toggling.

### Context & Files:
- [src-tauri/src/lib.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/lib.rs)
- [src-tauri/tauri.conf.json](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/tauri.conf.json)

### Detailed Implementation Tasks:
1. Configure tray icon and menu in Tauri v2 builder in `src-tauri/src/lib.rs`:
   - Menu items: "Open TU Cockpit", "TUWEL Portal", "TISS Organization", "Slide Vault", "Export Calendar (.ics)", separator, "Quit".
   - Handle tray menu events to focus/show the main window and emit navigation events to the frontend.
2. Verify `tauri.conf.json` tray permissions.

### Verification Runbook:
1. `npm run build`
2. `SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `feat(tray): add native system tray menu with rapid portal jumping`
```

---

### Milestone 74 Prompt: Global Background Hotkey Summoner Daemon `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a desktop ergonomics specialist implementing global system shortcuts in Tauri v2.

### Objective:
Enable the global hotkey (`Cmd+Shift+Space` on macOS, `Alt+Space` on Windows/Linux) to summon or toggle TU Cockpit from anywhere in the OS.

### Context & Files:
- [src-tauri/src/lib.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/lib.rs)
- [src/components/palette/CommandPalette.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/palette/CommandPalette.tsx)

### Detailed Implementation Tasks:
1. Register global shortcut in `tauri_plugin_global_shortcut`:
   - macOS: `CommandOrControl+Shift+Space`.
   - Windows/Linux: `Alt+Space`.
   - When triggered: If main window is focused, minimize or hide it. If unfocused or minimized, show, unminimize, bring to foreground, and focus spotlight search.
2. Allow toggling this feature in Workspace Settings.

### Verification Runbook:
1. `npm run build`
2. `SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `feat(shortcuts): implement global background hotkey summoner daemon`
```

---

### Milestone 75 Prompt: Desktop Harmony & Close-to-Tray Window Preference `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a desktop lifecycle engineer finalizing background process handling.

### Objective:
Implement a "Close to Tray" preference that keeps the TU Cockpit process running silently in the background when the window close button is clicked, maintaining active deadline notification checks.

### Context & Files:
- [src-tauri/src/lib.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/lib.rs)
- [src/components/settings/SettingsModal.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/settings/SettingsModal.tsx)
- [src/store/useAppStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useAppStore.ts)

### Detailed Implementation Tasks:
1. Intercept `WindowEvent::CloseRequested` on main window in Rust if close-to-tray is enabled:
   - Prevent window destruction; instead call `window.hide()`.
2. Add toggle in Settings > Layout / Desktop:
   - "Keep running in background when closed (System Tray)".
3. Comprehensive end-to-end audit and test suite run.

### Verification Runbook:
1. `npm run build`
2. `SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk cargo check --manifest-path src-tauri/Cargo.toml`
3. `SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk cargo test --manifest-path src-tauri/Cargo.toml`
4. Git hygiene commit: `feat(lifecycle): implement close-to-tray background daemon preference`
```
