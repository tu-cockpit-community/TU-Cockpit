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
>
> **Current Sprint Status:**
> - 🟢 **PHASES 1–14 (COMPLETED ✅):** Foundational Runtime, Portals, Org Auto-Discovery, Native Child-Webviews, Full-Bleed Canvas, In-App Updater, Workstation Streamlining, "TU Essentials", Invisibility Bus, Authentic Institutional Rendering, Direct SSO Autofill, Headless VoWi Reader, Autonomous `tu-calendar`, Autonomous `tu-slide-vault`, Autonomous `tu-mensa`, Autonomous `tu-room-radar`, Launching Reliability, Single-File Inlining, Unified Academic Spotlight, Workstation Status Bar & ICS Calendar Export (Milestones 0–55).

---

# ==============================================================================
# 🟡 PART XIV: PHASE 14 — CAMPUS ROOM RADAR, WORKSTATION STATUS BAR & ICS SYNC
# ==============================================================================

> **Phase 14 Summary & Objective:**  
> 1. Implement an unobtrusive, native `WorkstationStatusBar` (24px bottom rail) displaying real-time university network reachability, pending academic deadline count, and a 1-click Apple/Google Calendar export (`export_local_ics_feed`).
> 2. Engineer and scaffold the 4th autonomous community plugin: `tu-room-radar` (TU Wien Free Lecture Hall Finder & Quiet Study Spot Radar), pre-bundled with `vite-plugin-singlefile` and published to `tu-cockpit-community/tu-room-radar`.
> 3. Register `tuwien.community.room-radar` in `DEFAULT_STORE_REGISTRY` and connect Global Command Palette room searches directly to the interactive room navigator.

---

## 61. Phase 14 AI Worker Agent Prompts & Step-by-Step Implementation Milestones

---

### Milestone 53 Prompt: Academic Workstation Status Bar & 1-Click ICS Export `[STATUS: COMPLETED ✅ - Commit 7a73a5d]`

```markdown
You are a React and Tauri desktop integration engineer working on TU Cockpit.

### Objective:
Build an executive `WorkstationStatusBar` anchored at the bottom of the desktop client that displays real-time connectivity status, pending deadlines countdown, and provides 1-click ICS export.

### Context & Files:
- [src-tauri/src/deadline_aggregator.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/deadline_aggregator.rs)
- [src/App.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/App.tsx)
- Create: [src/components/layout/WorkstationStatusBar.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/layout/WorkstationStatusBar.tsx)

### Tasks:
1. Create `src/components/layout/WorkstationStatusBar.tsx`:
   - Height: 24px (`h-6`), border-t border-[var(--tu-border)], bg-[var(--tu-bg-surface)], text-[11px].
   - Left section:
     - Online / Connected indicator dot (green pulse for active TU connection).
     - Active view badge (e.g. `Portal: TUWEL`, `Plugin: TU Mensa`, or `Marketplace`).
   - Center section:
     - Pending deadlines counter (e.g. `invoke("get_student_deadlines")` -> "📅 X deadlines pending"), clicking triggers navigation to `tuwien.community.calendar`.
   - Right section:
     - "Export Calendar (ICS)" button invoking `export_local_ics_feed` with a brief success confirmation tooltip.
     - Academic term info (`WS 2026/27`).
2. In `src/App.tsx`:
   - Mount `WorkstationStatusBar` at the bottom of the main viewport across all layout orientations (`left`, `right`, `top`, `bottom`).
3. Run verification runbook (`npm run build`, `cargo check`).

### Verification:
1. `npm run build` passes with zero errors.
2. `SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk cargo check --manifest-path src-tauri/Cargo.toml` passes.

### Git Hygiene:
Commit message in `Tuwel-Tools`:
`feat(layout): implement workstation status bar with live deadline count and ICS export`
```

---

### Milestone 54 Prompt: Autonomous `tu-room-radar` Community Plugin Scaffolding & Single-File Bundler `[STATUS: COMPLETED ✅ - Commit c901de0 (tu-cockpit-community/tu-room-radar)]`

```markdown
You are a React 19 and frontend systems developer building the autonomous `tu-room-radar` plugin.

### Objective:
Scaffold and build `community-plugins/tu-room-radar` as an interactive, zero-dependency TU Wien Campus Room & Study Spot Radar, configured with `vite-plugin-singlefile` and ready for sandboxed iframe execution.

### Context & Subfolder:
- `community-plugins/tu-room-radar/`
- Target Remote: `https://github.com/tu-cockpit-community/tu-room-radar`

### Tasks:
1. Initialize `community-plugins/tu-room-radar/`:
   - `package.json` with React 19, TypeScript, Lucide, and `"vite-plugin-singlefile": "^2.1.0"`.
   - `vite.config.ts` using `viteSingleFile()`.
   - `manifest.json` (`tuwien.community.room-radar`, version 1.0.0, category "Campus Life").
   - `.github/workflows/release-plugin.yml` for automated release packaging on `v*` tags.
2. Build interactive UI in `src/App.tsx`:
   - Building Filters:
     - "Freihaus" (Wiedner Hauptstr. 8-10, Turm Grün/Gelb/Rot)
     - "Hauptgebäude" (Karlsplatz 13, Audimax, Boecklsaal, HS 11-18)
     - "Campus Gußhaus" (Gußhausstraße 25-29, EI 1-7)
     - "Getreidemarkt" (Plus-Energie-Hochhaus, GM 1-4)
   - Study Space Types:
     - Free Lecture Halls ("Frei für Selbststudium bis 14:00")
     - Quiet Study Zones ("Lernraum Bibliothek", "Silent Study Area")
     - Group Study Rooms (Project tables, whiteboards)
   - Room Amenities:
     - Power outlets (🔌), High-speed eduroam (📶), Capacity (Seats).
   - Instant Search & Room Code Resolver (e.g. "EI 7", "HS 1", "FH 2").
3. Build and verify:
   - Run `npm install && npm run build`.
   - Verify `dist/index.html` has all assets inlined and no external file references.
4. Commit and push to `tu-cockpit-community/tu-room-radar`.

### Git Hygiene:
Commit in `community-plugins/tu-room-radar`:
`feat(room-radar): scaffold autonomous tu-room-radar single-file community plugin`
```

---

### Milestone 55 Prompt: Host Registry Integration & Command Palette Room Routing for Room Radar `[STATUS: COMPLETED ✅ - Commit ca24fe1]`

```markdown
You are a TypeScript and desktop integration engineer working on TU Cockpit.

### Objective:
Integrate `tuwien.community.room-radar` into `DEFAULT_STORE_REGISTRY`, bundle its interactive standalone HTML distribution into `CommunityPluginBundles.ts`, and link Command Palette room searches directly to the Room Radar.

### Context & Files:
- [src/services/marketplace/CommunityPluginBundles.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/marketplace/CommunityPluginBundles.ts)
- [src/services/marketplace/GitHubPluginService.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/marketplace/GitHubPluginService.ts)
- [src/services/palette/FuzzySearchService.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/palette/FuzzySearchService.ts)

### Tasks:
1. In `src/services/marketplace/CommunityPluginBundles.ts`:
   - Export `COMMUNITY_ROOM_RADAR_HTML` containing the interactive standalone TU Room Radar application.
2. In `src/services/marketplace/GitHubPluginService.ts`:
   - Register `tuwien.community.room-radar` in `DEFAULT_STORE_REGISTRY.plugins` with category `"Campus Life"`, rating `4.9`, and `htmlContent: COMMUNITY_ROOM_RADAR_HTML`.
3. In `src/services/palette/FuzzySearchService.ts`:
   - Add direct action: "Find Free Lecture Halls & Study Spots" (`Cmd+K -> Room Radar`).
   - When user clicks a room search item, route into `tuwien.community.room-radar`.
4. Run standard verification runbook (`npm run build`, `cargo check`).

### Verification:
1. `npm run build` passes.
2. `cargo check` passes.
3. In Community Store HUB, `tuwien.community.room-radar` appears with 1-click install.

### Git Hygiene:
Commit message in `Tuwel-Tools`:
`feat(marketplace): catalog tu-room-radar community plugin and connect room search routing`
```
