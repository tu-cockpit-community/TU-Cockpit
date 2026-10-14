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
>
> **Current Sprint Status:**
> - 🟢 **PHASES 1–10 (COMPLETED & ARCHIVED):** Foundational Runtime, Portals, Org Auto-Discovery, Native Child-Webviews, Full-Bleed Canvas, In-App Updater, Workstation Streamlining, "TU Essentials", Invisibility Bus, Authentic Institutional Rendering, Direct SSO Autofill, Headless VoWi Reader, Autonomous `tu-calendar` Community Plugin, and Autonomous `tu-slide-vault` Community Plugin (Milestones 0–43).
> - 🟡 **PHASE 11 (ACTIVE SPRINT):** Launching Reliability, Native Webview Stability & Community Plugin Bundle Invariants (Milestones 44–46).

---

# ==============================================================================
# 🟡 PART XI: PHASE 11 — LAUNCHING RELIABILITY, NATIVE WEBVIEW STABILITY & COMMUNITY PLUGIN BUNDLE INVARIANTS
# ==============================================================================

> **Phase 11 Summary & Objective:**  
> Resolve all barriers preventing reliable launching and interactive execution of both official portals (TUWEL, TISS, VoWi, TU Maps) and community plugins (`tu-calendar`, `tu-slide-vault`).
>
> **Root Cause Breakdown & Architectural Invariants:**
> 1. **Native Portal Window Label & Pointer Events:**
>    - In `src-tauri/tauri.conf.json`, `"windows"` lacked an explicit `"label": "main"`. Rust `create_or_show_native_portal` calls `app.get_window("main")`, which can fail if the window label is omitted.
>    - In `NativePortalContainer.tsx`, the webview anchor container had `pointer-events-none select-none`, which interfered with pointer event dispatching into the child webview on macOS WKWebView.
> 2. **Installed Community Plugin Sidebar Disappearance:**
>    - In `src/store/useAppStore.ts`, `installPlugin` attempted to add newly installed plugins to category `c.id === "tools"`. However, `INITIAL_CATEGORIES` only contained `id: "essentials"`. Consequently, newly installed plugins were never assigned to any category and never rendered in the navigation sidebar (`ConfigurableNav.tsx`).
> 3. **Sandboxed Iframe Uncompiled Vite Modules in `srcDoc`:**
>    - When installing a community plugin, GitHub source zipballs contain uncompiled `<script type="module" src="/src/main.tsx"></script>`. In `PluginFrame.tsx`, passing this raw HTML to `<iframe srcDoc={...}>` fails because `srcDoc` has no base host URL and browsers cannot compile JSX/TypeScript without a build step.
>    - Furthermore, `DEFAULT_STORE_REGISTRY` in `GitHubPluginService.ts` lacked functional embedded HTML distributions for `tu-calendar` and `tu-slide-vault`, falling back to dummy placeholder cards.
>    - **Resolution:** Provide bundled, standalone single-file HTML distributions in `DEFAULT_STORE_REGISTRY` and ensure `PluginMarketplace` installs launch rich, fully functional applications immediately.

---

## 58. Phase 11 AI Worker Agent Prompts & Step-by-Step Implementation Milestones

---

### Milestone 44 Prompt: Fix Native Webview Lifecycle, Container Pointer-Events & Window Label Invariant `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a desktop systems engineer and Rust/React developer working on TU Cockpit.

### Objective:
Ensure official institutional portals (TUWEL, TISS, VoWi live mode, TU Maps) launch with 100% reliability, maintain proper hit testing (clicks, scrolls, typing), and remain synchronized during navigation.

### Context & Files:
- [src-tauri/tauri.conf.json](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/tauri.conf.json)
- [src/components/plugin-host/NativePortalContainer.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/plugin-host/NativePortalContainer.tsx)
- [src-tauri/src/native_webview.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/native_webview.rs)

### Tasks:

#### 1. Explicit Window Label Invariant in `tauri.conf.json`
- In `src-tauri/tauri.conf.json`, verify that the primary window definition explicitly defines:
  ```json
  "windows": [
    {
      "label": "main",
      "title": "TU Cockpit",
      "width": 1280,
      "height": 840,
      "minWidth": 900,
      "minHeight": 600,
      "decorations": true,
      "transparent": false
    }
  ]
  ```

#### 2. Restore Pointer Events in `NativePortalContainer.tsx`
- In `src/components/plugin-host/NativePortalContainer.tsx`:
  - Locate line 379: `<div ref={containerRef} className="flex-1 w-full h-full relative bg-black/10 min-h-[500px] pointer-events-none select-none">`.
  - Replace `pointer-events-none select-none` with `pointer-events-auto select-auto` on the child webview anchor area.
  - Ensure the bounding rect calculations pass non-zero, valid dimensions to `create_or_show_native_portal`.

#### 3. Guard Portal Visibility & Label State Machine in `native_webview.rs`
- In `src-tauri/src/native_webview.rs`:
  - In `create_or_show_native_portal`, ensure that if `app.get_window("main")` is None, it provides a clear diagnostic error and falls back to inspecting available windows via `app.webview_windows()`.
  - In `hide_native_portal`, verify that `ACTIVE_PORTAL` is only cleared if the portal being hidden matches the currently active portal label, preventing unmount race conditions when switching between portals.

### Verification:
1. `npm run build` passes with zero TypeScript errors.
2. `SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk cargo check --manifest-path src-tauri/Cargo.toml` passes with zero errors.

### Git Hygiene:
Commit message: `fix(portals): enforce main window label and pointer-events in native child-webview container`
```

---

### Milestone 45 Prompt: Fix Community Plugin Sidebar Categorization & Discovery `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a React and Zustand state architect working on TU Cockpit.

### Objective:
Ensure all newly installed community plugins appear immediately in the navigation sidebar (`ConfigurableNav.tsx`) under a dedicated "Community Tools" category rather than vanishing into an unassigned state.

### Context & Files:
- [src/store/useAppStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useAppStore.ts)
- [src/components/navigation/ConfigurableNav.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/navigation/ConfigurableNav.tsx)

### Tasks:

#### 1. Add "Community Tools" Category to `INITIAL_CATEGORIES`
- In `src/store/useAppStore.ts`:
  - Update `INITIAL_CATEGORIES` to declare both `essentials` and `community`:
    ```typescript
    const INITIAL_CATEGORIES: PluginCategory[] = [
      {
        id: "essentials",
        name: "TU Essentials",
        icon: "GraduationCap",
        isDefault: true,
        isCollapsed: false,
        pluginIds: [
          "tuwien.official.tuwel",
          "tuwien.official.tiss",
          "tuwien.official.vowi",
          "tuwien.official.tumaps",
        ],
      },
      {
        id: "community",
        name: "Community Tools",
        icon: "Boxes",
        isDefault: true,
        isCollapsed: false,
        pluginIds: [],
      },
    ];
    ```

#### 2. Update `installPlugin` Category Routing
- In `src/store/useAppStore.ts` inside `installPlugin`:
  - When a plugin is installed and is not already part of any category:
    - If a category with `id === "community"` exists, append `manifest.id` to its `pluginIds`.
    - If neither `"community"` nor `"tools"` exists in the user's custom categories, create the `"community"` category and add the plugin.
  - This ensures that every installed plugin is guaranteed to be rendered in the sidebar accordion navigation.

### Verification:
1. `npm run build` compiles cleanly.
2. In React app testing, installing a community plugin adds it directly to the "Community Tools" accordion in the sidebar.

### Git Hygiene:
Commit message: `fix(navigation): ensure installed community plugins are assigned to community category`
```

---

### Milestone 46 Prompt: Bundle Standalone Single-File Distributions for `tu-calendar` and `tu-slide-vault` `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a frontend build engineer and plugin architect working on TU Cockpit.

### Objective:
Provide self-contained, fully functional HTML application bundles for `tu-calendar` and `tu-slide-vault` in `DEFAULT_STORE_REGISTRY` and ensure sandboxed iframes in `PluginFrame.tsx` execute without 404 module script errors or placeholder screens.

### Context & Files:
- [src/services/marketplace/GitHubPluginService.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/marketplace/GitHubPluginService.ts)
- [src/components/marketplace/PluginMarketplace.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/marketplace/PluginMarketplace.tsx)
- [src/components/plugin-host/PluginFrame.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/plugin-host/PluginFrame.tsx)
- [community-plugins/tu-calendar/](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-calendar/)
- [community-plugins/tu-slide-vault/](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-slide-vault/)

### Tasks:

#### 1. Rich Standalone HTML Distributions in `GitHubPluginService.ts`
- In `src/services/marketplace/GitHubPluginService.ts`:
  - Update `DEFAULT_STORE_REGISTRY` to associate complete, interactive, self-contained single-file HTML distributions for:
    1. **`tuwien.community.calendar`:**
       - Interactive Timetable & Weekly Grid (Lecture blocks, rooms, lecturers).
       - TUWEL Deadlines Calendar with countdown badges and urgency styling.
       - Google Tasks-style checklist with add, toggle, and filter capabilities.
       - Adapts dynamically to `--tu-*` CSS design tokens.
    2. **`tuwien.community.slide-vault`:**
       - Course selector sidebar (AlgoDat, Analysis 1, EPROG 1, LinAlg, DBS).
       - Instant fuzzy slide search input.
       - Slide deck grid with lecture cards and offline cached badges.
       - High-contrast Dark-Mode Slide Viewer modal with page controls and zoom.
       - Adapts dynamically to `--tu-*` CSS design tokens.
  - In `DEFAULT_STORE_REGISTRY`, expose an `htmlContent?: string` field on each `StoreRegistryPlugin` containing its verified standalone distribution.

#### 2. Update `PluginMarketplace.tsx` Installation Flow
- In `src/components/marketplace/PluginMarketplace.tsx`:
  - When `handleInstall(entry)` is triggered:
    - If `entry.htmlContent` is available from the registry, prioritize using `entry.htmlContent` so the rich app launches immediately without waiting for GitHub zipball compilation.
    - If falling back, use `entry.htmlContent` instead of the generic "Sandboxed execution verified" placeholder.

#### 3. Verification Across All Tools & Portals
- Verify launching all official portals:
  - TUWEL (`tuwien.official.tuwel`)
  - TISS (`tuwien.official.tiss`)
  - VoWi (`tuwien.official.vowi`) in both Reader and Live modes
  - TU Maps (`tuwien.official.tumaps`)
- Verify launching community plugins:
  - TU Calendar (`tuwien.community.calendar`)
  - TU Slide Vault (`tuwien.community.slide-vault`)
- Ensure every tool can be opened, interacted with, switched between, and closed without freezes or blank screens.

### Verification:
1. `npm run build` passes with zero errors.
2. `SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk cargo check --manifest-path src-tauri/Cargo.toml` passes.

### Git Hygiene:
Commit message: `feat(marketplace): bundle interactive standalone distributions for tu-calendar and tu-slide-vault`
```
