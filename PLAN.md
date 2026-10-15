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
>
> **Current Sprint Status:**
> - 🟢 **PHASES 1–14 (COMPLETED & ARCHIVED):** Foundational Runtime, Portals, Org Auto-Discovery, Native Child-Webviews, Full-Bleed Canvas, In-App Updater, Workstation Streamlining, "TU Essentials", Invisibility Bus, Authentic Institutional Rendering, Direct SSO Autofill, Headless VoWi Reader, Autonomous Plugins (`tu-calendar`, `tu-slide-vault`, `tu-mensa`, `tu-room-radar`), Launching Reliability, Single-File Inlining, Unified Academic Spotlight, Workstation Status Bar & ICS Calendar Export (Milestones 0–55).
> - 🟡 **PHASE 15 (ACTIVE SPRINT):** Live Functional Plugin Depth, Real GitHub Marketplace Telemetry & Workflow Error Rectification (Milestones 56–58).

---

# ==============================================================================
# 🟡 PART XV: PHASE 15 — LIVE FUNCTIONAL PLUGIN DEPTH, REAL GITHUB MARKETPLACE TELEMETRY & WORKFLOW ERROR RECTIFICATION
# ==============================================================================

> **Phase 15 Summary & Objective:**  
> 1. **Rectify Workflow & Syntax Errors:** Fix invalid YAML indentation across all community plugin release workflows (`.github/workflows/release-plugin.yml`) that produced IDE error markers.
> 2. **Real Live GitHub Marketplace Telemetry:** Eliminate synthetic mock ratings (e.g. `4.9 stars`) and fake download numbers (`14,200 users`). Fetch authentic live statistics directly from GitHub REST APIs: real Star counts (`stargazers_count`), real Fork counts (`forks_count`), authentic release asset downloads, and actual "Last Updated" timestamps.
> 3. **Deep Functional Autonomy for All 4 Community Plugins:** Replace static sample cards with real operational features:
>    - `tu-calendar`: Real TUWEL/TISS iCal subscriptions, local ICS file parsing, and persistent tasks checklist.
>    - `tu-slide-vault`: Real PDF lecture uploads, IndexedDB persistence, keyword search, and dark-mode viewer.
>    - `tu-mensa`: Real daily menus for TU Wien cafeterias (Freihaus, Gußhaus, Schütte-Lihotzky) with allergen indicators and student prices.
>    - `tu-room-radar`: Authentic TU Wien campus room index, real-time day/hour occupancy heuristics, and quiet study room discovery.

---

## 62. Phase 15 AI Worker Agent Prompts & Step-by-Step Implementation Milestones

---

### Milestone 56 Prompt: Fix Workflow Indentation Syntax Errors across Community Plugin Repositories `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a DevOps engineer and GitHub Actions specialist working on the TU Cockpit community ecosystem.

### Objective:
Fix the YAML syntax indentation errors in `.github/workflows/release-plugin.yml` across all 4 community plugins (`tu-calendar`, `tu-slide-vault`, `tu-mensa`, `tu-room-radar`), eliminating all IDE parser errors.

### Context & Files:
- [community-plugins/tu-calendar/.github/workflows/release-plugin.yml](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-calendar/.github/workflows/release-plugin.yml)
- [community-plugins/tu-slide-vault/.github/workflows/release-plugin.yml](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-slide-vault/.github/workflows/release-plugin.yml)
- [community-plugins/tu-mensa/.github/workflows/release-plugin.yml](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-mensa/.github/workflows/release-plugin.yml)
- [community-plugins/tu-room-radar/.github/workflows/release-plugin.yml](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-room-radar/.github/workflows/release-plugin.yml)

### Problem & Fix:
In all 4 workflow files, lines 16–19 contain invalid YAML indentation where `- run:` steps were indented underneath `with:`:
```yaml
      - uses: actions/setup-node@v4
        with:
          node-version: 20
        - run: npm ci          # <-- ERROR: Invalid indentation
        - run: npm run build
```

Replace with properly formatted GitHub Actions step sequences:
```yaml
name: Release Plugin Bundle

on:
  push:
    tags:
      - "v*"

jobs:
  build-and-release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - name: Package Plugin Archive
        run: |
          mkdir -p bundle
          cp dist/index.html bundle/index.html
          cp manifest.json bundle/manifest.json
          cd bundle && zip -r ../plugin.zip *
      - name: Create Release
        uses: softprops/action-gh-release@v2
        with:
          files: plugin.zip
          draft: false
          prerelease: false
```

### Tasks:
1. Update `.github/workflows/release-plugin.yml` in:
   - `community-plugins/tu-calendar/`
   - `community-plugins/tu-slide-vault/`
   - `community-plugins/tu-mensa/`
   - `community-plugins/tu-room-radar/`
2. Commit the fix in each respective repository:
   `git -C community-plugins/<repo> commit -am "fix(ci): correct YAML step indentation in release workflow"`
3. Verify zero YAML lint or syntax errors.

### Verification:
1. Run a YAML linter or verify valid YAML structure across all 4 files.
```

---

### Milestone 57 Prompt: Real GitHub Marketplace Telemetry (Stars, Forks, Releases & Actual Metrics) `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a full-stack TypeScript engineer working on the TU Cockpit Community Store.

### Objective:
Replace synthetic mock ratings (e.g. "4.9") and fake user counts ("14,200") with real, live GitHub telemetry fetched from the GitHub REST API.

### Context & Files:
- [src/services/marketplace/CommunityOrgService.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/marketplace/CommunityOrgService.ts)
- [src/services/marketplace/GitHubPluginService.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/marketplace/GitHubPluginService.ts)
- [src/components/marketplace/PluginMarketplace.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/marketplace/PluginMarketplace.tsx)

### Tasks:

#### 1. Expand `StoreRegistryPlugin` Telemetry Model
In `GitHubPluginService.ts`:
- Update `StoreRegistryPlugin` interface to track authentic GitHub telemetry:
  ```typescript
  export interface StoreRegistryPlugin {
    id: string;
    name: string;
    version: string;
    author: {
      name: string;
      github?: string;
      url?: string;
      avatarUrl?: string;
    };
    description: string;
    category: string;
    icon?: string;
    homepage?: string;
    githubRepo?: string;
    downloadUrl?: string;
    capabilities: {
      network?: string[];
      storage?: { quotaBytes?: number };
      notifications?: boolean;
      systemClipboard?: boolean;
    };
    verified: boolean;
    // Real GitHub Telemetry
    stars: number;             // Real GitHub stargazers_count
    forks: number;             // Real GitHub forks_count
    openIssues: number;        // Real GitHub open_issues_count
    updatedAt: string;         // Real GitHub pushed_at or updated_at
    releaseTag?: string;       // Latest release tag (e.g. "v1.0.0")
    htmlContent?: string;
  }
  ```

#### 2. Query Authentic GitHub Telemetry in `CommunityOrgService.ts`
- When querying `https://api.github.com/orgs/${orgName}/repos`:
  - Extract `repo.stargazers_count` directly into `stars`.
  - Extract `repo.forks_count` directly into `forks`.
  - Extract `repo.open_issues_count` directly into `openIssues`.
  - Extract `repo.pushed_at` into `updatedAt`.
  - Extract `repo.owner.avatar_url` into `author.avatarUrl`.
  - Eliminate synthetic math formulas (e.g. `repo.stargazers_count * 15 + 120`).

#### 3. Update Marketplace UI Cards in `PluginMarketplace.tsx`
- Replace the fake rating star and fake download user count with authentic GitHub metrics:
  - **Stars:** `<Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {plugin.stars}`
  - **Forks:** `<GitFork className="w-3 h-3 text-[var(--tu-text-muted)]" /> {plugin.forks}`
  - **Last Updated:** `<Clock className="w-3 h-3 text-[var(--tu-text-muted)]" /> {formatRelativeTime(plugin.updatedAt)}`
  - **Releases:** Display release tag badge (e.g. `v1.0.0`) or `Verified Community Org`.
- Ensure fallback embedded plugins in `DEFAULT_STORE_REGISTRY` use real base counts (0 or actual GitHub counts) rather than fabricated numbers.

### Verification:
1. `npm run build` compiles with zero TypeScript errors.
2. The Community Store displays real GitHub Stars, Forks, and Last Updated dates.

### Git Hygiene:
Commit message in `Tuwel-Tools`:
`feat(marketplace): integrate authentic GitHub telemetry for stars, forks, and release metrics`
```

---

### Milestone 58 Prompt: Live Functional Depth & Real Data for All 4 Community Plugins `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a full-stack student tools developer working on the 4 autonomous TU Cockpit community plugins.

### Objective:
Upgrade all 4 community plugins (`tu-calendar`, `tu-slide-vault`, `tu-mensa`, `tu-room-radar`) so they are genuinely functional and useful for TU Wien students instead of rendering static mock cards.

### Context & Files:
- [community-plugins/tu-calendar/src/App.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-calendar/src/App.tsx)
- [community-plugins/tu-slide-vault/src/App.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-slide-vault/src/App.tsx)
- [community-plugins/tu-mensa/src/App.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-mensa/src/App.tsx)
- [community-plugins/tu-room-radar/src/App.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-room-radar/src/App.tsx)
- [src/services/marketplace/CommunityPluginBundles.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/marketplace/CommunityPluginBundles.ts)

### Tasks:

#### 1. Live Functional Depth in `tu-calendar`
- **Live TUWEL / TISS Calendar Sync:**
  - Provide an intuitive input for students to paste their personal TUWEL calendar export URL (`https://tuwel.tuwien.ac.at/calendar/export_execute.php?...`) or upload `.ics` files.
  - Automatically parse VEVENT entries into real deadline tasks and timetable lecture slots.
  - Persist synced deadlines into `localStorage` / IndexedDB.
  - Interactive checklist allowing students to check off completed assignments with date countdowns.

#### 2. Live Document Management in `tu-slide-vault`
- **Real PDF Document Upload & Local Vault Storage:**
  - Add a functional "Upload PDF Slides / Notes" file picker (`<input type="file" accept=".pdf">`).
  - Read uploaded PDFs using `FileReader` as base64/ArrayBuffer and persist in IndexedDB (`idb-keyval` or native IndexedDB).
  - Extract document metadata (title, file size, upload date, course tag).
  - Real in-app Dark-Mode PDF/Canvas previewer rendering the actual student's course slides.
  - Instant client-side search filtering across uploaded student documents.

#### 3. Real TU Wien Mensa Menus in `tu-mensa`
- **Real Cafeteria Feeds:**
  - Locations: *Mensa Markt Freihaus* (Wiedner Hauptstr. 8-10), *Mensa Buffet Freihaus*, *Café Schütte-Lihotzky* (Karlsplatz 13), *Mensa Gußhaus*.
  - Pull live daily Austrian Mensen menus (or current week's authentic student menu schedules) with:
    - Real dish descriptions (e.g. Tagesteller, Vegetarisch, Vegan, Menü Classic).
    - Real student prices (€ 6.20 / € 7.50 / € 8.90).
    - Real allergen indicators (A: Gluten, C: Ei, G: Milch, L: Sellerie).
    - Operating hours (11:00 – 14:00) and open/closed status indicator based on current system time.

#### 4. Grounded Campus Navigation in `tu-room-radar`
- **Authentic TU Wien Room Index:**
  - Build comprehensive real room indices for Freihaus (Hörsäle 1–8, FH Hörsaal 1–7), Karlsplatz (Audimax, Boecklsaal, HS 11–18), Gußhaus (EI 1–7), and Getreidemarkt (GM 1–4).
  - Time-aware availability algorithm: Checks current hour and weekday to estimate whether a hall is currently in scheduled lecture or free for self-study.
  - Quiet Study Zone index: TU Wien Main Library (TU Bibliothek Resselgasse floors 1–5, silent study cubicles, group study rooms) with live opening hours.

#### 5. Compile & Re-Bundle into `CommunityPluginBundles.ts`
- Run `npm run build` in each plugin directory (`vite-plugin-singlefile`).
- Read the generated `dist/index.html` from each subfolder and update `COMMUNITY_CALENDAR_HTML`, `COMMUNITY_SLIDE_VAULT_HTML`, `COMMUNITY_MENSA_HTML`, and `COMMUNITY_ROOM_RADAR_HTML` in `CommunityPluginBundles.ts`.

### Verification:
1. `npm run build` in each `community-plugins/<repo>` succeeds with single-file HTML generation.
2. Host `npm run build` passes with zero errors.
3. Every plugin provides real interactive student features (real calendar sync, real PDF upload, real Mensa menus, real campus rooms).

### Git Hygiene:
Commit within each plugin repository and host repository with:
`feat(plugins): implement live functional data and real interactive workflows for community plugins`
```
