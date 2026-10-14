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
>
> **Current Sprint Status:**
> - 🟢 **PHASES 1–8 (COMPLETED & ARCHIVED):** Foundational Runtime, Portals, Org Auto-Discovery, Native Child-Webviews, Full-Bleed Canvas, In-App Updater, Workstation Streamlining, "TU Essentials", Invisibility Bus, Authentic Institutional Rendering, Direct SSO Autofill, and Headless VoWi Reader (Milestones 0–41).
> - 🟡 **PHASE 9 (ACTIVE SPRINT):** Community Calendar Plugin Scaffolding & Marketplace Integration (Milestone 42).

---

# ==============================================================================
# 🟡 PART IX: PHASE 9 — COMMUNITY CALENDAR PLUGIN SCAFFOLDING & MARKETPLACE INTEGRATION
# ==============================================================================

> **Phase 9 Summary & Objective:**  
> Phase 9 expands the TU Cockpit ecosystem beyond built-in portals into community plugins hosted in separate repositories under the [`tu-cockpit-community`](https://github.com/tu-cockpit-community) organization.
> 
> **Core Deliverables:**
> 1. **Autonomous Plugin Repository Setup:** Establish an isolated repository (`tu-calendar`) within `community-plugins/tu-calendar/` (ignored in the host `.gitignore`), linked to `https://github.com/tu-cockpit-community/tu-calendar`.
> 2. **Externalized Plugin Planning Invariant:** The architecture, design, and execution milestones for the calendar plugin itself are housed exclusively inside `community-plugins/tu-calendar/PLAN.md` (never polluting this host repository).
> 3. **Full Student Calendar Feature Spec:**
>    - **Timetable (Stundenplan):** Weekly lecture schedule, lecture hall locations, and course slots from TISS iCal feeds.
>    - **Deadlines Calendar (Kalender):** Unified monthly and weekly view plotting TUWEL submission deadlines and TISS exam dates.
>    - **Google Tasks-Style Checklist (Aufgaben):** Interactive task manager for TUWEL deadlines with completion checkboxes, countdowns, status tags, and personal notes.
> 4. **Cockpit Marketplace Auto-Discovery:** Ensure the plugin declares a compliant `manifest.json` so that TU Cockpit's `CommunityOrgService` discovers it in the Community Store HUB for instant student installation.

---

## 54. Workspace Subfolder & Multi-Repo Architecture

```
Tuwel-Tools/                                <--- [Host Repository: tu-cockpit-community/TU-Cockpit]
├── .gitignore                              <--- Ignores /community-plugins/
├── ARCHITECTURE.md
├── PLAN.md                                 <--- Phase 9 active sprint
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

## 55. Phase 9 AI Worker Agent Prompts & Step-by-Step Implementation Milestones

---

### Milestone 42 Prompt: Scaffold Standalone `tu-calendar` Repository & Hook into Marketplace `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a full-stack developer and community tools engineer working on the TU Cockpit ecosystem.

### Objective:
Create and scaffold the standalone `tu-calendar` community plugin repository inside `community-plugins/tu-calendar`, create the remote GitHub repository under `tu-cockpit-community/tu-calendar`, write its internal `PLAN.md` and feature implementation, and verify its auto-discovery by the TU Cockpit Community Store.

### Context & Rules:
- The host repository (`Tuwel-Tools`) ignores `/community-plugins/` in `.gitignore`.
- All plugin files, git commits, and planning for the calendar plugin MUST live exclusively inside `community-plugins/tu-calendar/`.
- The plugin runs inside TU Cockpit's sandboxed `<iframe>` (`PluginFrame.tsx`) and adapts to the host's themes via `--tu-*` CSS Custom Properties.

### Tasks:

#### 1. Remote GitHub Repository Creation
- Check if `https://github.com/tu-cockpit-community/tu-calendar` already exists using GitHub MCP tool `search_repositories` or `get_file_contents`.
- If it does not exist, create the repository under the `tu-cockpit-community` organization using GitHub MCP tool `create_repository`:
  - `name`: `"tu-calendar"`
  - `description`: `"TU Wien Academic Calendar, Timetable & Deadlines Task Manager plugin for TU Cockpit"`
  - `private`: `false`
  - (If organization creation requires user token permissions or is restricted, initialize the local git repo and configure `origin` to `https://github.com/tu-cockpit-community/tu-calendar.git`).

#### 2. Local Directory & Git Initialization
- In `community-plugins/tu-calendar`:
  - Run `git init -b main`.
  - Set remote: `git remote add origin https://github.com/tu-cockpit-community/tu-calendar.git` (or verify existing).

#### 3. Author Plugin Specification & Dedicated `PLAN.md`
- In `community-plugins/tu-calendar/manifest.json`:
  ```json
  {
    "id": "tuwien.community.calendar",
    "name": "TU Calendar & Tasks",
    "version": "1.0.0",
    "description": "Interactive academic timetable, TUWEL deadlines calendar, and Google Tasks-style assignment checklist for TU Wien students.",
    "author": {
      "name": "TU Cockpit Community Contributors",
      "github": "tu-cockpit-community",
      "url": "https://github.com/tu-cockpit-community"
    },
    "entrypoint": "index.html",
    "category": "Academic",
    "homepage": "https://github.com/tu-cockpit-community/tu-calendar",
    "capabilities": {
      "network": [
        "https://tuwel.tuwien.ac.at/*",
        "https://tiss.tuwien.ac.at/*"
      ],
      "storage": {
        "quotaBytes": 52428800
      },
      "notifications": true,
      "systemClipboard": true
    },
    "permissions": [
      "storage.localstorage",
      "network.fetch"
    ]
  }
  ```
- In `community-plugins/tu-calendar/PLAN.md`:
  - Write the dedicated development sprint plan for the calendar plugin itself:
    - **Milestone 1:** App Shell, Tab Navigation & Adaptive `--tu-*` Theming.
    - **Milestone 2:** Timetable View (Weekly Grid with lecture hall locations and course codes).
    - **Milestone 3:** Google Tasks-Style Deadlines Checklist (Interactive checkboxes, crossed-out completed items, priority sorting, personal tasks, and localStorage persistence).
    - **Milestone 4:** Full Calendar Grid View & iCal Feed Import (TUWEL assignment feed & TISS calendar import).

#### 4. Scaffolding the React + Vite Application
- Create `package.json`:
  - React 19, TypeScript, Lucide React, Vite, Tailwind CSS / Vanilla CSS.
- Create `vite.config.ts`:
  - Set `base: "./"` so assets load cleanly with relative URLs inside sandboxed iframes.
- Create `src/App.tsx` and UI components implementing the core features:
  - **Header & Navigation Tabs:** `Timetable` (Stundenplan), `Calendar` (Monatsansicht), `Tasks Checklist` (Aufgaben & Deadlines).
  - **Tasks Checklist Component (Google Tasks-style):**
    - Displays deadlines aggregated from TUWEL.
    - Checkbox to mark tasks as done (moves to collapsible "Completed" section with strikethrough).
    - Quick-add input to add custom personal study tasks or exam prep items.
    - Due date badges (e.g. "Due in 2 days", "Overdue", "Today").
  - **Timetable Component:**
    - Clean Monday–Friday grid layout with time slots (08:00–20:00).
    - Course cards showing course name, room, and type (VO, UE, VU).
  - **Calendar Component:**
    - Interactive month view with day cells showing badges for deadlines and exams.
  - **Theme Synchronization:**
    - Reads CSS variables (`--tu-bg-canvas`, `--tu-bg-surface`, `--tu-border`, `--tu-accent`, `--tu-text-primary`) so the plugin seamlessly adapts to whatever theme the student selects in TU Cockpit.

#### 5. Commit, Push & Marketplace Verification
- In `community-plugins/tu-calendar`:
  - Run `git add .`
  - Run `git commit -m "feat(init): scaffold tu-calendar community plugin with timetable and tasks checklist"`
  - Run `git push -u origin main` (handling any credentials / token).
- In the host TU Cockpit application:
  - Verify that `CommunityOrgService.fetchCommunityPlugins("tu-cockpit-community")` discovers the new repository and its `manifest.json`.
  - Open the Community Store HUB in TU Cockpit: verify `TU Calendar & Tasks` is displayed with its verified community badge, description, and install button.

### Verification:
1. Inside `community-plugins/tu-calendar`:
   - Run `npm install && npm run build` (or verify bundled distribution).
2. Inside host `Tuwel-Tools`:
   - Run `npm run build` and `cargo check`.
   - Verify `git status` in `Tuwel-Tools` shows clean working tree with `community-plugins/` uncommitted/ignored.
   - Test plugin rendering in the sandboxed iframe.

### Git Hygiene:
Commit message in `tu-calendar` repo:
`feat(init): scaffold tu-calendar community plugin with timetable and tasks checklist`
```
