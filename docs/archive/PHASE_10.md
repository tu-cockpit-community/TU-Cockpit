# Phase 10: Community Slide Vault Plugin Scaffolding & Marketplace Integration

> **Cold Storage Archive**  
> **Status:** COMPLETED ✅  
> **Milestones:** Milestone 43  
> **Repository:** [`tu-cockpit-community/TU-Cockpit`](https://github.com/tu-cockpit-community/TU-Cockpit)  
> **Plugin Repository:** [`tu-cockpit-community/tu-slide-vault`](https://github.com/tu-cockpit-community/tu-slide-vault)  
> **Date Archived:** 2026-10-14  

---

# ==============================================================================
# 🟢 PART X: PHASE 10 — COMMUNITY SLIDE VAULT PLUGIN SCAFFOLDING & MARKETPLACE INTEGRATION
# ==============================================================================

> **Phase 10 Summary & Objective:**  
> Phase 10 continues the expansion of the TU Cockpit community ecosystem by establishing the second major autonomous community plugin: **TU Slide Vault** ([`tu-cockpit-community/tu-slide-vault`](https://github.com/tu-cockpit-community/tu-slide-vault)).
> 
> **Core Deliverables:**
> 1. **Autonomous Plugin Repository Setup:** Establish an isolated repository (`tu-slide-vault`) within `community-plugins/tu-slide-vault/` (ignored in the host `.gitignore`), linked to `https://github.com/tu-cockpit-community/tu-slide-vault`.
> 2. **Externalized Plugin Planning Invariant:** The architecture, design, and execution milestones for the slide vault plugin itself are housed exclusively inside `community-plugins/tu-slide-vault/PLAN.md`.
> 3. **Full Student Slide Vault Feature Spec:**
>    - **Offline Lecture Slide Indexer & Cache:** High-speed client-side storage for lecture slides and course documents.
>    - **Instant Full-Text Search Across Course Materials:** Instant search bar matching slide titles, course tags, keywords, and extracted notes.
>    - **Dark-Mode PDF Reader:** High-contrast reading mode with canvas tile inversion, page navigation, zoom, and fullscreen support.
>    - **Curated TU Wien Course Vaults:** Pre-configured course bundles (AlgoDat, Analysis 1, EPROG 1, LinAlg, DBS) with sample slides and upload capability.
> 4. **Cockpit Marketplace Auto-Discovery:** Ensure the plugin declares a compliant `manifest.json` (`tuwien.community.slide-vault`) so that TU Cockpit's `CommunityOrgService` discovers it in the Community Store HUB for instant student installation.

---

## 56. Workspace Subfolder & Multi-Repo Architecture

```
Tuwel-Tools/                                <--- [Host Repository: tu-cockpit-community/TU-Cockpit]
├── .gitignore                              <--- Ignores /community-plugins/
├── ARCHITECTURE.md
├── PLAN.md                                 <--- Phase 10 active sprint
├── src/                                    <--- Desktop Cockpit client
└── community-plugins/                      <--- ISOLATED WORKSPACE ROOT
    ├── tu-calendar/                        <--- [Standalone Repo: tu-cockpit-community/tu-calendar]
    └── tu-slide-vault/                     <--- [Standalone Repo: tu-cockpit-community/tu-slide-vault]
        ├── .git/                           <--- Separate Git history & remote origin
        ├── .gitignore
        ├── manifest.json                   <--- TU Cockpit Plugin Manifest (id: tuwien.community.slide-vault)
        ├── PLAN.md                         <--- AUTONOMOUS SPRINT ROADMAP FOR SLIDE VAULT PLUGIN
        ├── README.md                       <--- Plugin showcase & documentation
        ├── package.json                    <--- Standalone React 19 + TypeScript + Vite SPA
        ├── tsconfig.json
        ├── vite.config.ts                  <--- base: './' for sandboxed iframe compatibility
        ├── index.html
        └── src/
            ├── main.tsx
            ├── App.tsx                     <--- Course Explorer, Search Bar, Slide Grid & Viewer
            ├── index.css                   <--- Uses --tu-* CSS variables for adaptive theme syncing
            ├── components/
            │   ├── CourseSidebar.tsx       <--- Course selection & filter tree
            │   ├── SlideSearchBar.tsx      <--- Instant fuzzy slide search input
            │   ├── SlideDeckGrid.tsx       <--- Course slide decks with download/offline badges
            │   └── PDFViewerModal.tsx      <--- Dark-mode slide reader with page controls
            └── services/
                ├── slideStorage.ts         <--- Offline slide metadata & IndexedDB/localStorage storage
                └── pdfIndexer.ts           <--- Slide text extraction & fuzzy search indexing
```

---

## 57. Phase 10 AI Worker Agent Prompts & Step-by-Step Implementation Milestones

---

### Milestone 43 Prompt: Scaffold Standalone `tu-slide-vault` Repository & Hook into Marketplace `[STATUS: COMPLETED ✅ - Commit 52f2111]`

```markdown
You are a full-stack developer and community tools engineer working on the TU Cockpit ecosystem.

### Objective:
Create and scaffold the standalone `tu-slide-vault` community plugin repository inside `community-plugins/tu-slide-vault`, create the remote GitHub repository under `tu-cockpit-community/tu-slide-vault`, write its internal `PLAN.md` and feature implementation, and verify its auto-discovery by the TU Cockpit Community Store.

### Context & Rules:
- The host repository (`Tuwel-Tools`) ignores `/community-plugins/` in `.gitignore`.
- All plugin files, git commits, and planning for the slide vault plugin MUST live exclusively inside `community-plugins/tu-slide-vault/`.
- The plugin runs inside TU Cockpit's sandboxed `<iframe>` (`PluginFrame.tsx`) and adapts to the host's themes via `--tu-*` CSS Custom Properties.

### Tasks:

#### 1. Remote GitHub Repository Creation
- Check if `https://github.com/tu-cockpit-community/tu-slide-vault` already exists using GitHub MCP tool `search_repositories` or `get_file_contents`.
- If it does not exist, create the repository under the `tu-cockpit-community` organization using GitHub MCP tool `create_repository`:
  - `name`: `"tu-slide-vault"`
  - `description`: `"Offline lecture slide cache, full-text search and dark-mode viewer plugin for TU Cockpit"`
  - `private`: `false`

#### 2. Local Directory & Git Initialization
- In `community-plugins/tu-slide-vault`:
  - Initialize local git repo on `main` branch.
  - Set remote origin to `https://github.com/tu-cockpit-community/tu-slide-vault.git`.

#### 3. Author Plugin Specification & Dedicated `PLAN.md`
- In `community-plugins/tu-slide-vault/manifest.json`:
  ```json
  {
    "id": "tuwien.community.slide-vault",
    "name": "TU Slide Vault",
    "version": "1.0.0",
    "description": "Offline lecture slide cache, instant full-text search across course PDF materials, and dark-mode slide viewer.",
    "author": {
      "name": "TU Cockpit Community Contributors",
      "github": "tu-cockpit-community",
      "url": "https://github.com/tu-cockpit-community"
    },
    "entrypoint": "index.html",
    "category": "Academic",
    "homepage": "https://github.com/tu-cockpit-community/tu-slide-vault",
    "capabilities": {
      "network": [
        "https://tuwel.tuwien.ac.at/*",
        "https://vowi.fsinf.at/*"
      ],
      "storage": {
        "quotaBytes": 104857600
      },
      "notifications": true,
      "systemClipboard": true
    },
    "permissions": [
      "storage.localstorage",
      "storage.indexeddb",
      "network.fetch"
    ]
  }
  ```
- In `community-plugins/tu-slide-vault/PLAN.md`:
  - Author the dedicated roadmap for the slide vault plugin covering:
    - Milestone 1: App Shell, Course Navigation & Adaptive `--tu-*` Theming.
    - Milestone 2: Slide Deck Grid & Offline Caching Engine.
    - Milestone 3: Instant Full-Text Slide Search & Topic Filtering.
    - Milestone 4: Dark-Mode Slide Viewer with Inversion, Zoom & Page Navigation.

#### 4. Scaffolding the React + Vite Application
- Create `package.json`, `tsconfig.json`, `vite.config.ts` (`base: "./"`), `index.html`.
- Create `src/App.tsx` and UI components implementing:
  - **Course Sidebar:** Filter slides by course (AlgoDat, Analysis 1, EPROG 1, LinAlg, DBS, etc.) or view all.
  - **Slide Search Bar:** Real-time query input filtering across courses, titles, tags, and lecture topics.
  - **Slide Deck Grid:** Displays slide cards showing lecture number, title, page count, date, file size, and cached status badge.
  - **PDF Viewer Modal:** High-contrast reading viewer with dark mode toggle (canvas/content inversion), page flip controls (`<`, `>`), zoom slider, and download button.
  - **Local Persistence & Cache:** Stores offline cached slide states and bookmarks in `localStorage`/IndexedDB.

#### 5. Commit, Push & Marketplace Verification
- In `community-plugins/tu-slide-vault`:
  - Push initial codebase to remote `main` branch.
- In host TU Cockpit application:
  - Register `tuwien.community.slide-vault` in `DEFAULT_STORE_REGISTRY` in `src/services/marketplace/GitHubPluginService.ts`.
  - Verify auto-discovery and presence in Community Store.

### Verification:
1. Inside `community-plugins/tu-slide-vault`: `npm install && npm run build` (or verify bundled dist).
2. Inside host `Tuwel-Tools`: `npm run build` and `cargo check`.
3. Verify `git status` in `Tuwel-Tools` shows clean working tree with `community-plugins/` uncommitted/ignored.

### Git Hygiene:
Commit message in `tu-slide-vault` repo:
`feat(init): scaffold tu-slide-vault community plugin with slide search and dark-mode viewer`
Commit message in `Tuwel-Tools` repo:
`feat(marketplace): register tu-slide-vault community plugin in default store registry`
```
