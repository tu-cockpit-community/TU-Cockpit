# TU Cockpit: Archive of Phase 9 (Milestone 42)

> **Official Repository:** [`tu-cockpit-community/TU-Cockpit`](https://github.com/tu-cockpit-community/TU-Cockpit)  
> **Status:** COMPLETED & ARCHIVED ✅  
> **Preceding Archives:**  
> - Milestones 0–33 (Phases 1–6): See [docs/archive/PHASES_1_TO_6.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASES_1_TO_6.md)  
> - Milestones 34–37 (Phase 7): See [docs/archive/PHASE_7.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASE_7.md)  
> - Milestones 38–41 (Phase 8): See [docs/archive/PHASE_8.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASE_8.md)  
> **Active Sprint Roadmap:** See [PLAN.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/PLAN.md)

---

# ==============================================================================
# 🟢 PART IX: PHASE 9 — COMMUNITY CALENDAR PLUGIN SCAFFOLDING & MARKETPLACE INTEGRATION (COMPLETED ✅)
# ==============================================================================

> **Phase 9 Summary & Architectural Accomplishments:**  
> 1. **Autonomous Plugin Repository Setup:** Created and scaffolded the isolated community plugin repository [`tu-cockpit-community/tu-calendar`](https://github.com/tu-cockpit-community/tu-calendar) inside `community-plugins/tu-calendar/` (ignored by the host repository `.gitignore`).
> 2. **Externalized Plugin Planning Invariant:** Authoritative milestones and architectural specifications for the calendar plugin itself were housed exclusively inside `community-plugins/tu-calendar/PLAN.md`.
> 3. **Full Student Academic Calendar Suite:**
>    - **Timetable (Stundenplan):** Full Monday–Friday interactive weekly lecture schedule mapping lecture halls (Freihaus HS 1, AudiMax, EI 7, etc.), course codes, and course categories (VO, UE, VU, PR).
>    - **Deadlines Calendar (Kalender):** Interactive monthly grid overlaying TUWEL submission deadlines and TISS exam dates with selected-day agenda drawer.
>    - **Google Tasks-Style Checklist (Aufgaben):** Interactive task manager for TUWEL deadlines with completion checkboxes, strikethrough styling, countdown urgency badges, and persistent `localStorage` storage.
>    - **iCal Feed Engine:** RFC 5545 `.ics` feed parser for importing TUWEL and TISS calendar feeds.
>    - **Adaptive Theming:** Zero-re-render styling synchronization hooking into TU Cockpit `--tu-*` CSS design tokens with standalone fallback.
> 4. **Community Marketplace Auto-Discovery:** Declared compliant `manifest.json` (`tuwien.community.calendar`), pushed to GitHub remote `refs/heads/main` (commit `e620db4`), and registered in TU Cockpit's `DEFAULT_STORE_REGISTRY` in `GitHubPluginService.ts` for immediate discovery and installation.

---

## 54. Workspace Subfolder & Multi-Repo Architecture

```
Tuwel-Tools/                                <--- [Host Repository: tu-cockpit-community/TU-Cockpit]
├── .gitignore                              <--- Ignores /community-plugins/
├── ARCHITECTURE.md
├── PLAN.md                                 <--- Active sprint roadmap
├── src/                                    <--- Desktop Cockpit client
└── community-plugins/                      <--- ISOLATED WORKSPACE ROOT
    └── tu-calendar/                        <--- [Standalone Repo: tu-cockpit-community/tu-calendar]
        ├── .git/                           <--- Separate Git history & remote origin
        ├── .gitignore
        ├── manifest.json                   <--- TU Cockpit Plugin Manifest (id: tuwien.community.calendar)
        ├── PLAN.md                         <--- AUTONOMOUS SPRINT ROADMAP FOR THE CALENDAR PLUGIN
        ├── README.md                       <--- Plugin showcase & documentation
        ├── package.json                    <--- Standalone React 19 + TypeScript + Vite SPA
        ├── tsconfig.json
        ├── vite.config.ts                  <--- base: './' for sandboxed iframe compatibility
        ├── index.html
        └── src/
            ├── main.tsx
            ├── App.tsx                     <--- Tabbed view: Timetable, Calendar, Tasks Checklist
            ├── index.css                   <--- Uses --tu-* CSS variables for adaptive theme syncing
            ├── components/
            │   ├── TimetableView.tsx       <--- Weekly schedule grid
            │   ├── CalendarMonthView.tsx   <--- Month & deadline agenda view
            │   └── TasksChecklistView.tsx  <--- Google Tasks-style checklist with completed states
            └── services/
                ├── iCalParser.ts           <--- Parses TUWEL & TISS iCal feeds
                └── taskStorage.ts          <--- Local persistence for user checkboxes and custom tasks
```

---

## 55. Phase 9 Milestones & Implementation History

---

### Milestone 42 Prompt: Scaffold Standalone `tu-calendar` Repository & Hook into Marketplace `[STATUS: COMPLETED ✅ - Commit 794acb7]`

```markdown
You are a full-stack developer and community tools engineer working on the TU Cockpit ecosystem.

### Objective:
Create and scaffold the standalone `tu-calendar` community plugin repository inside `community-plugins/tu-calendar`, create the remote GitHub repository under `tu-cockpit-community/tu-calendar`, write its internal `PLAN.md` and feature implementation, and verify its auto-discovery by the TU Cockpit Community Store.

### Context & Rules:
- The host repository (`Tuwel-Tools`) ignores `/community-plugins/` in `.gitignore`.
- All plugin files, git commits, and planning for the calendar plugin MUST live exclusively inside `community-plugins/tu-calendar/`.
- The plugin runs inside TU Cockpit's sandboxed `<iframe>` (`PluginFrame.tsx`) and adapts to the host's themes via `--tu-*` CSS Custom Properties.

### Tasks:
1. Remote GitHub Repository Creation (`tu-cockpit-community/tu-calendar`).
2. Local Directory & Git Initialization (`community-plugins/tu-calendar`).
3. Author Plugin Specification & Dedicated `PLAN.md`.
4. Scaffolding the React + Vite Application with Timetable, Calendar, Tasks Checklist, and iCal parser.
5. Push to GitHub remote and register in `DEFAULT_STORE_REGISTRY` in `src/services/marketplace/GitHubPluginService.ts`.

### Verification:
1. Build in `community-plugins/tu-calendar`: `npm run build` passed.
2. Build in host `Tuwel-Tools`: `npm run build` and `cargo check` passed.
3. Remote GitHub repository verified: public under `tu-cockpit-community/tu-calendar`.

### Git Hygiene:
Commit message in `tu-calendar` repo:
`feat(init): scaffold tu-calendar community plugin with timetable and tasks checklist` (commit `e620db4`)
Commit message in `Tuwel-Tools` repo:
`feat(marketplace): register tu-calendar community plugin in default store registry` (commit `794acb7`)
```
