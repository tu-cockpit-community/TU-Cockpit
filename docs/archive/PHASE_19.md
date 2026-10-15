# Phase 19 Archive: Academic Calendar Engine, Real-Time Campus Sentinel & Power-User Desktop Shortcuts Suite

> **Phase:** 19  
> **Status:** Completed ✅  
> **Commits:**
> - Milestone 70: `a07c578` (`feat(calendar): implement dynamic academic term engine and live deadline progression ticker`)
> - Milestone 71: `fb5da03` (`feat(shortcuts): add power-user keyboard shortcuts and interactive cheat sheet modal`)
> - Milestone 72: `4a8016b` (`feat(network): add campus network sentinel and offline resilience banner`)

---

## 70. Phase 19 Summary & Implementation Milestones

### Milestone 70: Dynamic TU Wien Academic Calendar & Live Deadline Progression Engine `[STATUS: COMPLETED ✅ - Commit a07c578]`

1. **Created `src/services/calendar/AcademicCalendarEngine.ts`:**
   - Evaluates TU Wien academic year periods:
     - Wintersemester (WS): Oct 1 to Jan 31 (Lecture phase: 15 weeks), Feb (Semester break / Exam period).
     - Sommersemester (SS): Mar 1 to Jun 30 (Lecture phase: 15 weeks), Jul to Sep (Summer break / September exam period).
   - Functions implemented:
     - `getCurrentSemester(refDate?)`: Returns `{ label, code, termType, academicYear, isLecturePeriod, currentWeek, phaseLabel, startDate, endDate }`.
     - `getSemesterProgress(refDate?)`: Returns percentage (`0` to `100%`) through the active semester.
     - `formatTimeRemaining(dueDateStr, refDate?)`: Formats upcoming student deadline countdowns (`"in 4h"`, `"tomorrow at 23:55"`, `"in 2d"`, `"Overdue"`).
     - `getUrgencyLevel(dueDateStr, refDate?)`: Returns `"critical"` (< 24h), `"warning"` (< 3d), `"normal"` (>= 3d), `"overdue"`.
2. **Updated `ExecutiveHeader.tsx`:**
   - Replaced static term text with dynamic badge showing current semester code and lecture week (e.g. `WS 2026/27 • Week 3` or `SS 2027 • Prüfungsphase`) with visual mini progress bar and tooltip.
3. **Updated `WorkstationStatusBar.tsx`:**
   - Added live next-deadline ticker next to pending count:
     - Shows earliest uncompleted deadline with course name and urgency-styled countdown badge.
     - 1-click jump to course in TUWEL or TU Calendar.
   - Shows dynamic semester code and progression percentage on the right (`WS26 • 24%`).

---

### Milestone 71: Power-User Desktop Shortcuts Suite & Keyboard Cheat Sheet Modal `[STATUS: COMPLETED ✅ - Commit fb5da03]`

1. **Created `src/components/navigation/KeyboardShortcutsModal.tsx`:**
   - Designed clean categorical shortcuts cheat sheet modal:
     - **Navigation & Portals:** `Cmd+1` (TUWEL), `Cmd+2` (TISS), `Cmd+3` (VoWi), `Cmd+4` (TU Maps), `Cmd+5` (Marketplace).
     - **Study Vault & DevStudio:** `Cmd+Shift+V` (Slide Vault), `Cmd+Shift+D` (DevStudio).
     - **Workstation Controls:** `Cmd+K` (Spotlight), `Cmd+B` (Toggle Sidebar), `Cmd+,` (Settings), `Cmd+/` or `?` (Cheat Sheet), `Esc` (Dismiss).
   - Styled glassmorphism modal with adaptive `--tu-*` tokens and platform-aware `<kbd>` keys (`⌘` on macOS, `Ctrl` on Windows/Linux).
   - Registered with `useOverlayStore` so native child webviews auto-hide when the modal is active.
2. **Integrated Global Key Event Bus in `src/App.tsx`:**
   - Wired all shortcuts with proper input field guard detection (`isInput`).
   - Added shortcuts trigger button next to Settings gear in `ExecutiveHeader.tsx`.

---

### Milestone 72: Real-Time Campus Network Sentinel & Graceful Offline Fallback Banner `[STATUS: COMPLETED ✅ - Commit 4a8016b]`

1. **Created `src/store/useNetworkStore.ts` & `src/services/network/CampusNetworkSentinel.ts`:**
   - Subscribes to browser `online` and `offline` events.
   - Periodically probes TU Wien endpoints (`https://tuwel.tuwien.ac.at/favicon.ico`) with fallback probe.
   - Accurately distinguishes between total offline state, degraded campus network, and full online state.
2. **Created `src/components/layout/OfflineNoticeBanner.tsx`:**
   - Renders a prominent, non-intrusive amber banner below the header when disconnected.
   - Provides 1-click action buttons to jump directly to physical cached PDFs in Slide Vault or search offline notes via Spotlight (`Cmd+K`).
3. **Updated `WorkstationStatusBar.tsx`:**
   - Live network indicator reflects exact connectivity:
     - Green pulsing dot: *"TU Services Online"*
     - Amber dot: *"Campus Degraded"*
     - Red/Rose pulsing dot: *"Offline Mode"*
