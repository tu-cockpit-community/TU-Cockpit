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
>
> **Current Sprint Status:**
> - 🟢 **PHASES 1–18 (COMPLETED & ARCHIVED):** Foundational Runtime, Portals, Org Auto-Discovery, Native Child-Webviews, Full-Bleed Canvas, In-App Updater, Workstation Streamlining, "TU Essentials", Invisibility Bus, Authentic Institutional Rendering, Direct SSO Autofill, Headless VoWi Reader, Autonomous Plugins (`tu-calendar`, `tu-slide-vault`, `tu-mensa`, `tu-room-radar`), Launching Reliability, Single-File Inlining, Unified Academic Spotlight, Workstation Status Bar & ICS Calendar Export, Live Functional Plugin Depth, Real GitHub Marketplace Telemetry, Physical Filesystem Slide Vault, DevStudio Staging Environment, Real GitHub Plugin Download & Safe Deletion Engine, `dev-plugins/` Consolidation & Storage Configuration, Multi-Platform Target Build Suite & 1-Click CI/CD Artifact Builder (Milestones 0–69).
> - 🟡 **PHASE 19 (ACTIVE SPRINT):** Academic Calendar Engine, Real-Time Campus Sentinel & Power-User Desktop Shortcuts Suite (Milestones 70–72).

---

# ==============================================================================
# 🟡 PART XIX: PHASE 19 — ACADEMIC CALENDAR ENGINE, REAL-TIME CAMPUS SENTINEL & POWER-USER SHORTCUTS SUITE
# ==============================================================================

> **Phase 19 Summary & Objective:**  
> 1. **Dynamic TU Wien Academic Calendar & Live Deadline Progression:** Replace static term indicators with a mathematical TU Wien semester engine (computes WS/SS, current lecture week 1–15, vacation/exam phase, and percentage completion) coupled with live countdown tickers for upcoming assignments.
> 2. **Power-User Desktop Shortcuts Suite & Keyboard Cheat Sheet Modal (`Cmd+/` / `?`):** Implement full keyboard ergonomics (`Cmd+,` for Settings, `Cmd+1..5` for portal and marketplace hopping, `Cmd+Shift+V` for Slide Vault, `Cmd+Shift+D` for DevStudio) and a styled interactive shortcut cheat sheet modal.
> 3. **Campus Network Sentinel & Graceful Offline Fallback Banner:** Proactively detect connectivity drops or disconnects from TU Wien services, gracefully showing an intelligent offline banner providing immediate 1-click jumps to local cached Slide Vault PDFs and offline FTS5 notes.

---

## 70. Phase 19 AI Worker Agent Prompts & Step-by-Step Implementation Milestones

---

### Milestone 70 Prompt: Dynamic TU Wien Academic Calendar & Live Deadline Progression Engine `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a senior frontend architect specializing in academic time calculation and student productivity interfaces.

### Objective:
Build `src/services/calendar/AcademicCalendarEngine.ts` to calculate real-time TU Wien academic terms, lecture weeks, break periods, and semester progress, and integrate live upcoming deadline tickers into `ExecutiveHeader.tsx` and `WorkstationStatusBar.tsx`.

### Context & Files:
- [src/components/header/ExecutiveHeader.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/header/ExecutiveHeader.tsx)
- [src/components/layout/WorkstationStatusBar.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/layout/WorkstationStatusBar.tsx)
- Create: `src/services/calendar/AcademicCalendarEngine.ts`

### Detailed Implementation Tasks:

1. **Build `AcademicCalendarEngine.ts`:**
   - Define TU Wien academic periods:
     - Wintersemester (WS): Oct 1 to Jan 31 (Lecture phase: ~15 weeks), Feb (Semester break / Exam phase).
     - Sommersemester (SS): Mar 1 to Jun 30 (Lecture phase: ~15 weeks), Jul to Sep (Summer break / September exam phase).
   - Export helper functions:
     - `getCurrentSemester(date?: Date)`: Returns label (e.g. "WS 2026/27"), code (`WS26`), isLecturePeriod (`boolean`), currentWeek (`number | null`), phaseLabel (`"Week 4"` | `"Vorlesungsfreie Zeit"` | `"Prüfungsphase"`).
     - `getSemesterProgress(date?: Date)`: Returns number from `0` to `100` representing elapsed semester percentage.
     - `formatTimeRemaining(dueDateStr: string)`: Returns concise student-friendly countdown (e.g., `"in 4h"`, `"tomorrow at 23:55"`, `"in 2d"`, `"Overdue"`).

2. **Update `ExecutiveHeader.tsx`:**
   - Replace static `"WS 2026/27"` pill with dynamic badge:
     - Shows current term + lecture week (e.g., `WS 2026/27 • Week 3` or `SS 2027 • Prüfungsphase`).
     - Tooltip showing exact semester start, end, and % completed with mini visual progress bar.

3. **Update `WorkstationStatusBar.tsx`:**
   - Replace static term display with semester progress percentage pill (`XX%`).
   - Add imminent deadline ticker next to pending count:
     - If pending deadlines exist, find earliest non-completed deadline.
     - Display: `⏳ Next: [Course] [Title] ([Time remaining])`.
     - Clicking the ticker jumps directly to the course in TUWEL or TU Calendar.

### Verification Runbook:
1. `npm run build`
2. `SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `feat(calendar): implement dynamic academic term engine and live deadline progression ticker`
```

---

### Milestone 71 Prompt: Power-User Desktop Shortcuts Suite & Keyboard Cheat Sheet Modal `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a desktop UX engineer designing fluent keyboard ergonomics for the TU Cockpit workstation.

### Objective:
Implement comprehensive keyboard navigation shortcuts across the application and create an interactive Keyboard Shortcuts Cheat Sheet modal triggered by `Cmd+/` or `?`.

### Context & Files:
- [src/App.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/App.tsx)
- [src/store/useAppStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useAppStore.ts)
- Create: `src/components/navigation/KeyboardShortcutsModal.tsx`

### Detailed Implementation Tasks:

1. **Implement Keyboard Event Bus in `App.tsx`:**
   - `Cmd+,` / `Ctrl+,`: Open Settings modal directly.
   - `Cmd+1` / `Ctrl+1`: Switch to TUWEL portal (`tuwien.official.tuwel`).
   - `Cmd+2` / `Ctrl+2`: Switch to TISS portal (`tuwien.official.tiss`).
   - `Cmd+3` / `Ctrl+3`: Switch to VoWi reader (`tuwien.official.vowi`).
   - `Cmd+4` / `Ctrl+4`: Switch to TU Maps (`tuwien.official.tumaps`).
   - `Cmd+5` / `Ctrl+5`: Switch to Marketplace Hub (`marketplace`).
   - `Cmd+Shift+V` / `Ctrl+Shift+V`: Switch to Slide Vault plugin (`tuwien.community.slide-vault`).
   - `Cmd+Shift+D` / `Ctrl+Shift+D`: Jump to DevStudio tab in Marketplace.
   - `Cmd+/` / `Ctrl+/` or `?` (when not typing in an input/textarea): Toggle Keyboard Shortcuts Cheat Sheet modal.

2. **Create `KeyboardShortcutsModal.tsx`:**
   - Display cleanly organized shortcut categories:
     - **Navigation:** `Cmd+1..5`, `Cmd+K` (Spotlight), `Cmd+B` (Toggle Sidebar).
     - **Study & Portals:** `Cmd+Shift+V` (Slide Vault), `Cmd+Shift+D` (DevStudio).
     - **System:** `Cmd+,` (Settings), `Cmd+/` (Cheat Sheet), `Esc` (Close modals).
   - Render styled keyboard keycaps (`<kbd>`) with modern dark/light glass aesthetics matching `--tu-*` tokens.
   - Register with `useOverlayStore` so native webviews hide while the cheat sheet modal is open.

### Verification Runbook:
1. `npm run build`
2. `SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `feat(shortcuts): add power-user keyboard shortcuts and interactive cheat sheet modal`
```

---

### Milestone 72 Prompt: Real-Time Campus Network Sentinel & Graceful Offline Fallback Banner `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a networking and offline-first resilience engineer.

### Objective:
Implement a real-time network connectivity sentinel and an intelligent offline fallback banner that guides students to locally cached materials when disconnected from campus Wi-Fi or internet.

### Context & Files:
- Create: `src/services/network/CampusNetworkSentinel.ts`
- Create: `src/store/useNetworkStore.ts`
- Create: `src/components/layout/OfflineNoticeBanner.tsx`
- [src/components/layout/WorkstationStatusBar.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/layout/WorkstationStatusBar.tsx)
- [src/App.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/App.tsx)

### Detailed Implementation Tasks:

1. **Build `CampusNetworkSentinel.ts` & `useNetworkStore.ts`:**
   - Monitor `window.addEventListener('online')` and `window.addEventListener('offline')`.
   - Perform lightweight periodic HEAD/fetch probe to detect whether TU Wien endpoints (`tuwel.tuwien.ac.at`) are reachable.
   - State properties: `isOnline: boolean`, `isTuwienReachable: boolean`, `lastChecked: number`.

2. **Build `OfflineNoticeBanner.tsx`:**
   - Appears at the top of the canvas below the header when `!isOnline`.
   - Non-intrusive amber/orange banner with Wi-Fi off icon:
     - Message: *"Offline Mode Active — You are disconnected from campus networks."*
     - Quick Action Buttons:
       - **"Open Slide Vault"**: Switches to `tuwien.community.slide-vault` to access physical cached PDFs.
       - **"Search Offline Slides"**: Opens Cmd+K or FTS5 search.
       - **Dismiss (X)**.

3. **Update `WorkstationStatusBar.tsx`:**
   - Reflect real connectivity in the status bar pill:
     - Green: *"TU Services Online"* (when TU services reachable).
     - Blue: *"Internet Connected"* (when general internet reachable but TU Wien slow/degraded).
     - Amber/Red: *"Offline Mode"* (when disconnected).

### Verification Runbook:
1. `npm run build`
2. `SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `feat(network): add campus network sentinel and offline resilience banner`
```
