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
>
> **Current Sprint Status:**
> - 🟢 **PHASES 1–12 (COMPLETED & ARCHIVED):** Foundational Runtime, Portals, Org Auto-Discovery, Native Child-Webviews, Full-Bleed Canvas, In-App Updater, Workstation Streamlining, "TU Essentials", Invisibility Bus, Authentic Institutional Rendering, Direct SSO Autofill, Headless VoWi Reader, Autonomous `tu-calendar`, Autonomous `tu-slide-vault`, Launching Reliability & Bundling Invariants, Single-File Inlining, and Store Registry Hardening (Milestones 0–49).
> - 🟡 **PHASE 13 (ACTIVE SPRINT):** Unified Spotlight Search (FTS5 Slides & Deadlines) & `tu-mensa` Community Plugin (Milestones 50–52).

---

# ==============================================================================
# 🟡 PART XIII: PHASE 13 — UNIFIED SPOTLIGHT SEARCH & TU MENSA COMMUNITY PLUGIN
# ==============================================================================

> **Phase 13 Summary & Objective:**  
> 1. Transform the Global Command Palette (`Cmd+K`) into an instantaneous academic spotlight by surfacing full-text search across cached PDF lecture slides (`offline_vault.rs` with SQLite FTS5) and upcoming course deadlines (`deadline_aggregator.rs`).
> 2. Engineer and scaffold the 3rd autonomous community plugin: `tu-mensa` (TU Wien Campus Mensa Daily Menu, Price Radar & Dietary Filter), pre-bundled with `vite-plugin-singlefile` and published to `tu-cockpit-community/tu-mensa`.
> 3. Register `tuwien.community.mensa` in `DEFAULT_STORE_REGISTRY` and add instant Command Palette navigation shortcuts.

---

## 60. Phase 13 AI Worker Agent Prompts & Step-by-Step Implementation Milestones

---

### Milestone 50 Prompt: Command Palette (`Cmd+K`) Unified Search Deepening (FTS5 Slides & Deadlines) `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a React and Tauri frontend engineer working on TU Cockpit's Global Command Palette.

### Objective:
Integrate Rust backend search engines into `FuzzySearchService.ts` and `CommandPalette.tsx`:
1. Search cached lecture slide pages using SQLite FTS5 (`search_offline_slides`).
2. Search and display upcoming academic deadlines (`get_academic_deadlines`).

### Context & Files:
- [src-tauri/src/offline_vault.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/offline_vault.rs)
- [src-tauri/src/deadline_aggregator.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/deadline_aggregator.rs)
- [src/services/palette/FuzzySearchService.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/palette/FuzzySearchService.ts)
- [src/components/palette/CommandPalette.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/palette/CommandPalette.tsx)

### Tasks:
1. In `src/services/palette/FuzzySearchService.ts`:
   - Add new `PaletteCategory` types: `"slides"` and `"deadlines"`.
   - Add asynchronous search method `searchAsync(query: string, ctx: PaletteContext): Promise<PaletteItem[]>`.
   - Query `invoke<SlideSearchResult[]>("search_offline_slides", { query })` and map matches into `"slides"` items with file name, page number badge, and highlighted snippet.
   - Query `invoke<AcademicDeadline[]>("get_academic_deadlines")` (or cached deadlines) and match against course code, title, or description with `"deadlines"` category and urgency badge.
   - Selecting a slide item switches active view to `tuwien.community.slide-vault`.
   - Selecting a deadline switches active view to `tuwien.community.calendar`.
2. In `src/components/palette/CommandPalette.tsx`:
   - Debounce and trigger asynchronous search when user types in the input.
   - Render distinct category icons for slides (`BookOpen` / `FileText`) and deadlines (`Calendar` / `Clock`).
   - Display snippets and urgency badges seamlessly.

### Verification:
1. `npm run build` passes with zero errors.
2. `SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk cargo check --manifest-path src-tauri/Cargo.toml` passes.

### Git Hygiene:
Commit message in `Tuwel-Tools`:
`feat(palette): integrate FTS5 slide search and live academic deadlines in command palette`
```

---

### Milestone 51 Prompt: Autonomous `tu-mensa` Community Plugin Scaffolding & Single-File Bundler `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a React 19 and frontend systems developer building the autonomous `tu-mensa` plugin.

### Objective:
Scaffold and build `community-plugins/tu-mensa` as an interactive, zero-dependency TU Wien Mensa Menu & Cafeteria Radar, configured with `vite-plugin-singlefile` and ready for sandboxed iframe execution.

### Context & Subfolder:
- `community-plugins/tu-mensa/`
- Target Remote: `https://github.com/tu-cockpit-community/tu-mensa`

### Tasks:
1. Initialize `community-plugins/tu-mensa/`:
   - `package.json` with React 19, TypeScript, Lucide, Tailwind/CSS variables, and `"vite-plugin-singlefile": "^2.1.0"`.
   - `vite.config.ts` using `viteSingleFile()`.
   - `manifest.json` (`tuwien.community.mensa`, version 1.0.0, category "Campus Life").
   - `.github/workflows/release-plugin.yml` for automated release packaging on `v*` tags.
2. Build interactive UI in `src/App.tsx`:
   - Mensa Location Selector:
     - "TU Mensa Freihaus" (Wiedner Hauptstraße 8-10)
     - "TU Mensa Markt" (Campus Gußhausstraße)
     - "Cafeteria Gußhaus"
   - Date Tabs: "Today", "Tomorrow", "Weekly View".
   - Dishes & Menus:
     - Menü Classic (Traditional Austrian dish + soup/salad, €6.90 student)
     - Menü Veggie / Vegan (Plant-based hearty dish, €6.20 student)
     - Daily Vital Bowl / Salad Bar
   - Allergen badges (A: Gluten, C: Egg, G: Milk, L: Celery) and dietary filters (All, Vegetarian, Vegan).
   - "TU Student Discount Active" indicator.
3. Build and verify:
   - Run `npm install && npm run build`.
   - Verify `dist/index.html` has all assets inlined and no external file references.
4. Commit and push to `tu-cockpit-community/tu-mensa`.

### Git Hygiene:
Commit in `community-plugins/tu-mensa`:
`feat(mensa): scaffold autonomous tu-mensa single-file community plugin`
```

---

### Milestone 52 Prompt: Host Registry Integration & Command Palette Shortcuts for TU Mensa `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a TypeScript and desktop integration engineer working on TU Cockpit.

### Objective:
Integrate `tuwien.community.mensa` into `DEFAULT_STORE_REGISTRY`, bundle its interactive standalone HTML distribution into `CommunityPluginBundles.ts`, and add direct Command Palette shortcuts.

### Context & Files:
- [src/services/marketplace/CommunityPluginBundles.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/marketplace/CommunityPluginBundles.ts)
- [src/services/marketplace/GitHubPluginService.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/marketplace/GitHubPluginService.ts)
- [src/services/palette/FuzzySearchService.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/palette/FuzzySearchService.ts)

### Tasks:
1. In `src/services/marketplace/CommunityPluginBundles.ts`:
   - Export `COMMUNITY_MENSA_HTML` containing the interactive standalone TU Mensa application.
2. In `src/services/marketplace/GitHubPluginService.ts`:
   - Register `tuwien.community.mensa` in `DEFAULT_STORE_REGISTRY.plugins` with category `"Campus Life"`, rating `4.9`, and `htmlContent: COMMUNITY_MENSA_HTML`.
3. In `src/services/palette/FuzzySearchService.ts`:
   - Add direct action: "Open Mensa Menus" (`Cmd+K -> Mensa`), opening `tuwien.community.mensa`.
4. Run standard verification runbook (`npm run build`, `cargo check`).

### Verification:
1. `npm run build` passes.
2. `cargo check` passes.
3. In Community Store HUB, `tuwien.community.mensa` appears with 1-click install.

### Git Hygiene:
Commit message in `Tuwel-Tools`:
`feat(marketplace): catalog tu-mensa community plugin and add spotlight shortcuts`
```
