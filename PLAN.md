# TU Cockpit: Active Sprint Plan & Execution Roadmap

> **Target Ecosystem:** Desktop Hub & Dynamic Plugin Ecosystem for TU Wien Students  
> **Core Technologies:** Tauri v2, Rust (2021+), React 19, TypeScript 5.5+, Tailwind CSS v4, SQLite (WAL mode), WebCrypto E2EE  
> **Official Repository:** [`tu-cockpit-community/TU-Cockpit`](https://github.com/tu-cockpit-community/TU-Cockpit)  
> **Living Specifications:** See [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md)  
> **Swarm Protocol & Runbook:** See [AGENTS.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/AGENTS.md)  
> **Historical Archive (Milestones 0–29):** See [docs/archive/PHASES_1_TO_5.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASES_1_TO_5.md)  
>
> **Current Sprint Status:**
> - 🟢 **PHASES 1–5 (COMPLETED & ARCHIVED):** Foundational Runtime, Portals, Org Auto-Discovery, Native Child-Webviews, Full-Bleed Canvas, In-App Updater.
> - 🟡 **PHASE 6 (READY FOR EXECUTION):** Workstation Streamlining, Single Sidebar Collapser, Purge Deadlines & Split-View, Fix VoWi & Official Portal Child-Webviews, Purge Mock Plugins, "TU Essentials" Category, Standalone Community Slide Vault Repository (Milestones 30–33)

---

# ==============================================================================
# 🟡 PART VI: PHASE 6 — STREAMLINED WORKSTATION, PLUGIN ENGINE REPAIR & COMMUNITY SLIDE VAULT (READY FOR EXECUTION)
# ==============================================================================

> **Phase 6 Summary & Objective:**  
> Phase 6 delivers radical workstation decluttering, repairs the plugin execution lifecycle, purges all mock demonstration data, and standardizes the community plugin architecture:
> 1. **Executive Header Simplification:** Remove the redundant sidebar collapser from the header (retaining exclusively the collapser anchored on the sidebar rail), and purge the Deadlines, Split View, and Slide Vault buttons from the global chrome to restore a focused, distraction-free student workstation canvas.
> 2. **Plugin Execution Engine Repair:** Diagnose and resolve the `"✓ Sandboxed execution verified"` bug where installing and opening portals like VoWi failed to mount the real webview. Enforce valid manifest propagation (`homepage`) and seamless fallback to `OFFICIAL_PLUGINS`.
> 3. **Purge Mock Plugins & Consolidate "TU Essentials":** Eliminate all 6 mock demonstration plugins (`smart-tuwel`, `tiss-schedule`, `vowi-companion`, `mensa-today`, `room-locator`, `freihaus-timer`). Consolidate the pre-bundled portals under a single, professionally branded category: **"TU Essentials"** (`tuwien.official.tuwel`, `tuwien.official.tiss`, `tuwien.official.vowi`, `tuwien.official.tumaps`).
> 4. **Decoupled Community Slide Vault Plugin (`tu-slide-vault`):** Extract the Slide Vault feature from the core shell into a dedicated, standalone GitHub repository under the community organization (`https://github.com/tu-cockpit-community/tu-slide-vault`), proving the end-to-end community plugin lifecycle.

---

## 41. Phase 6 Architecture: Minimalist Workstation Shell & Decoupled Community Plugins

### 41.1 Architectural Rationale: The Lean Workstation Paradigm
During earlier iterations, features such as Split View, Deadlines, and Slide Vault were prototyped as first-party buttons directly in the top header chrome. While functional, this introduced visual density, increased cognitive load, and violated the core tenet of TU Cockpit: **The core application shell must remain a lightweight, lightning-fast operating canvas, while specialized student tools live as modular plugins.**

Furthermore, having two sidebar collapser controls—one located in the header and another situated directly in the sidebar navigation header—created navigational ambiguity and visual dissonance.

```
CURRENT HEADER (CLUTTERED):
+------------------------------------------------------------------------------------------------------------------------+
| [Store HUB] [|<-] | [|<-] [TU Cockpit] [Search Cmd+K] [WS 2026/27] | [Deadlines] [Slide Vault] [Split View] [User] [⚙] |
+------------------------------------------------------------------------------------------------------------------------+
                         ^                                                 ^             ^            ^
                Duplicate Collapser                                        Hardcoded Experimental Features

REFINED PHASE 6 HEADER (MINIMALIST & PRODUCTIVE):
+------------------------------------------------------------------------------------------------------------------------+
| [Store HUB] [|<-] | [TU Cockpit] [> Active Plugin]   [Search rooms, plugins... Cmd+K]   [WS 2026/27]   [User] [Clock] [⚙] |
+------------------------------------------------------------------------------------------------------------------------+
              ^                                                                                             ^
       Single Collapser                                                                             Settings & Profile
       (On Sidebar Rail)
```

### 41.2 The "TU Essentials" Category Architecture
Previously, categories were fragmented between "University Portals" and "Community Tools", while the marketplace UI displayed arbitrary tags like "Academic", "Campus Life", and "Productivity". To create a cohesive, first-party experience, all built-in services that ship pre-configured with the application are consolidated under the moniker:

> **"TU Essentials"** (Internal Identifier: `essentials`, Display Icon: `GraduationCap`)

This cleanly designates official, core-supported TU Wien student portals (TUWEL, TISS, VoWi, TU Maps) without confusing users with internal developer jargon like "internal" or "system". When community plugins are installed from GitHub repositories, they populate dedicated community categories.

---

## 42. Executive Header Streamlining & Single Sidebar Collapser Enforcement

### 42.1 Excision of Duplicate Sidebar Collapser
In `ExecutiveHeader.tsx`, the conditional toggle button rendered on the left flank when `navOrientation` is `"left"` or `"right"` is eliminated:
- **Removed:** Lines rendering `<PanelLeftOpen />` / `<PanelLeftClose />` inside `ExecutiveHeader.tsx`.
- **Retained & Strengthened:** The collapser button located inside `ConfigurableNav.tsx` directly adjacent to the "Community Store HUB" button in expanded mode, and at the apex of the 56px icon rail in collapsed mode.
- **Global Keybinding Intact:** The `Cmd+B` / `Ctrl+B` keyboard shortcut continues to toggle the sidebar smoothly without requiring any header button.

### 42.2 Purging Non-Core Global Controls
The following controls and modal triggers are excised from `ExecutiveHeader.tsx` and `App.tsx`:
1. **Deadlines Button & Pulse Badge:** Removed from header. The deadline logic is deferred to a future community calendar plugin.
2. **Slide Vault Button:** Removed from header. Slide Vault is extracted into an external community repository.
3. **Split View Multitasking Toggle:** Removed from header and `App.tsx`. The workspace returns to a stable, full-bleed single-surface canvas, maximizing screen real estate for TUWEL and TISS coursework.

---

## 43. Plugin Installation Engine Diagnostics & VoWi / Official Portal Mount Fix

### 43.1 Root Cause Forensics: The `"✓ Sandboxed execution verified"` Bug
When students clicked "Install" on the VoWi Student Wiki in the Community Store, navigating to the installed plugin displayed a generic dark-mode card reading:
`VoWi Student Wiki: ✓ Sandboxed execution verified`
rather than rendering the actual VoWi wiki portal.

**Forensic Breakdown of the Failure Chain:**
1. **Manifest Attribute Omission:** In `GitHubPluginService.ts`, the `DEFAULT_STORE_REGISTRY` entry for `tuwien.official.vowi` specified `author.url: "https://vowi.fsinf.at"`, but lacked the top-level `homepage` field:
   ```ts
   // BUG IN DEFAULT_STORE_REGISTRY:
   {
     id: "tuwien.official.vowi",
     name: "VoWi Student Wiki",
     // Missing: homepage: "https://vowi.fsinf.at"
     author: { url: "https://vowi.fsinf.at" }
   }
   ```
2. **Network Fallback Synthesis:** In `PluginMarketplace.tsx`, `handleInstallPlugin` attempted `GitHubPluginService.installFromGitHub(...)`. Because the repository has no GitHub Release binary yet, the catch-block synthesized a fallback manifest:
   ```ts
   // BUG IN handleInstallPlugin catch block:
   const manifest = {
     id: entry.id,
     name: entry.name,
     version: entry.version,
     description: entry.description,
     entrypoint: "index.html",
     githubRepo: entry.githubRepo,
     capabilities: entry.capabilities,
     // Missing: homepage: entry.homepage
   };
   const fallbackHtml = `...<div class="card">...✓ Sandboxed execution verified</div>...`;
   installPlugin(manifest, fallbackHtml, "registry");
   ```
3. **View Resolver Bypass:** In `App.tsx`, the active view switch checked:
   ```tsx
   {activePlugin.manifest.id.startsWith("tuwien.official.") && activePlugin.manifest.homepage ? (
     <NativePortalContainer ... />
   ) : (
     <PluginFrame htmlContent={activePlugin.htmlContent} ... />
   )}
   ```
   Because `activePlugin.manifest.homepage` was `undefined`, the application fell through to `PluginFrame`, rendering the fallback string!

### 43.2 The 3-Tier Defensive Resolution Strategy
To guarantee that VoWi and all official portals render flawlessly regardless of installation vector:
* **Tier 1 (Manifest Integrity):** `StoreRegistryPlugin` entries in `DEFAULT_STORE_REGISTRY` explicitly declare top-level `homepage: "https://vowi.fsinf.at"` (and respective portal URLs).
* **Tier 2 (Official Golden Lookup):** In `PluginMarketplace.tsx`, when `handleInstallPlugin` encounters any plugin ID matching `tuwien.official.*`, it bypasses mock HTML generation and directly sources the authoritative definition from `OFFICIAL_PLUGINS[entry.id]`, ensuring complete manifest metadata and real embedded portal HTML.
* **Tier 3 (View Mount Defense):** In `App.tsx`, portal URL resolution includes a fallback mapping:
  ```ts
  const KNOWN_PORTALS: Record<string, string> = {
    "tuwien.official.tuwel": "https://tuwel.tuwien.ac.at",
    "tuwien.official.tiss": "https://tiss.tuwien.ac.at",
    "tuwien.official.vowi": "https://vowi.fsinf.at",
    "tuwien.official.tumaps": "https://maps.tuwien.ac.at",
  };
  const portalUrl = activePlugin.manifest.homepage || KNOWN_PORTALS[activePlugin.manifest.id];
  ```
  If `portalUrl` exists and ID starts with `tuwien.official.`, `NativePortalContainer` is guaranteed to mount.

---

## 44. Complete Mock Plugin Purge & "TU Essentials" Category Consolidation

### 44.1 Permanent Elimination of Example Mock Plugins
All 6 prototype mock plugins remaining in `src/services/marketplace/GitHubPluginService.ts` are permanently deleted:
- ❌ `tuwien.community.smart-tuwel` (Mock AI helper)
- ❌ `tuwien.community.tiss-schedule` (Mock iCal exporter)
- ❌ `tuwien.community.vowi-companion` (Mock search widget)
- ❌ `tuwien.community.mensa-today` (Mock cafeteria menu)
- ❌ `tuwien.community.room-locator` (Mock GPS tracker)
- ❌ `tuwien.community.freihaus-timer` (Mock study timer)

### 44.2 The Canonical Official Quad
The `DEFAULT_STORE_REGISTRY` contains strictly the four official TU services:
1. **TUWEL Moodle LMS** (`tuwien.official.tuwel`) — `https://tuwel.tuwien.ac.at`
2. **TISS Campus Portal** (`tuwien.official.tiss`) — `https://tiss.tuwien.ac.at`
3. **VoWi Student Wiki** (`tuwien.official.vowi`) — `https://vowi.fsinf.at`
4. **TU Maps Navigator** (`tuwien.official.tumaps`) — `https://maps.tuwien.ac.at`

All four are assigned `category: "TU Essentials"`, with `verified: true`, `rating: 5.0`, and authentic student union / institutional authorship attribution.

---

## 45. Standalone Community Plugin Architecture: Slide Vault (`tu-slide-vault`)

### 45.1 Architectural Decoupling: Community Plugin Paradigm
To prevent the core TU Cockpit desktop binary from bloating with specialized PDF parsers, OCR models, and document databases, the Slide Vault is architected as an autonomous community plugin repository:

* **Official Repository:** [`https://github.com/tu-cockpit-community/tu-slide-vault`](https://github.com/tu-cockpit-community/tu-slide-vault)
* **Plugin Identifier:** `tuwien.community.slide-vault`
* **Distribution Channel:** Community Store auto-discovery via GitHub Releases (`plugin.zip`)

```
+-------------------------------------------------------------------------------+
|                      tu-cockpit-community / tu-slide-vault                    |
|                                                                               |
|  +------------------+    +--------------------+    +-----------------------+  |
|  |  manifest.json   |    | index.html (Vite)  |    | .github/workflows/    |  |
|  |  - Capabilities  |    | - React 19 UI      |    |   release-plugin.yml  |  |
|  |  - Scoped URLs   |    | - PDF.js / Worker  |    | - Bundles plugin.zip  |  |
|  |  - Storage Quota |    | - Local IndexedDB  |    | - Signs release asset |  |
|  +------------------+    +--------------------+    +-----------------------+  |
+-------------------------------------------------------------------------------+
                                    |
            Published to GitHub Releases (tag: v1.0.0)
                                    v
+-------------------------------------------------------------------------------+
|                         TU COCKPIT COMMUNITY STORE                            |
|  - Auto-discovers tu-slide-vault repository from organization                 |
|  - Validates manifest schema and sha256 checksum                              |
|  - Installs bundle into ~/Library/Application Support/tu-cockpit/plugins/     |
+-------------------------------------------------------------------------------+
```

### 45.2 Community Plugin Manifest Specification (`manifest.json`)
```json
{
  "$schema": "https://raw.githubusercontent.com/tu-cockpit-community/TU-Cockpit/main/schemas/plugin-manifest.v1.json",
  "id": "tuwien.community.slide-vault",
  "name": "TU Slide Vault",
  "version": "1.0.0",
  "description": "Offline lecture slide indexer, instant full-text search across course PDF materials, and dark-mode slide viewer.",
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
    "storage.indexeddb",
    "network.fetch"
  ]
}
```

### 45.3 Automated Plugin Packaging Workflow (`.github/workflows/release-plugin.yml`)
Community plugin repositories use an automated GitHub Action that compiles the frontend and generates a release artifact consumable by the TU Cockpit store:
```yaml
name: Release Community Plugin Bundle

on:
  push:
    tags:
      - 'v*'

jobs:
  bundle-plugin:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies & Build
        run: |
          npm ci
          npm run build

      - name: Package Plugin Archive
        run: |
          cp manifest.json dist/
          cd dist
          zip -r ../plugin.zip ./*
          cd ..
          sha256sum plugin.zip > checksum.sha256

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: |
            plugin.zip
            checksum.sha256
            manifest.json
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 46. Phase 6 Target File Hierarchy & Dependencies

```
Tuwel-Tools/
├── src/
│   ├── App.tsx                                 # Excises SplitView & Deadlines containers; fixes portal URL mounting
│   ├── components/
│   │   ├── header/
│   │   │   └── ExecutiveHeader.tsx             # Excises duplicate sidebar toggle, Deadlines, Split View & Slide Vault
│   │   ├── navigation/
│   │   │   └── ConfigurableNav.tsx             # Remains sole authority for sidebar collapse/expand controls
│   │   └── marketplace/
│   │       └── PluginMarketplace.tsx           # Category filter to "TU Essentials"; fixes official plugin install fallback
│   ├── plugins/
│   │   └── official/
│   │       └── OfficialPlugins.ts              # Canonical definitions with verified URLs & homepage parameters
│   ├── services/
│   │   └── marketplace/
│   │       └── GitHubPluginService.ts          # Purges mock plugins; enforces official quad under "TU Essentials"
│   └── store/
│       └── useAppStore.ts                      # Resets INITIAL_CATEGORIES to single "TU Essentials" accordion
│
# Standalone Community Project (Separate GitHub Repository):
tu-slide-vault/                                 # https://github.com/tu-cockpit-community/tu-slide-vault
├── manifest.json                               # Plugin manifest with scoped network & storage
├── package.json                                # Standalone React + Vite project
├── vite.config.ts                              # Bundles self-contained relative assets for sandboxing
├── src/
│   ├── App.tsx                                 # Slide Vault UI (Course Explorer, PDF Reader, Search)
│   ├── services/
│   │   ├── pdfIndexer.ts                       # Client-side WebWorker PDF text extractor
│   │   └── storageService.ts                   # IndexedDB storage within sandbox quota
│   └── components/
│       ├── SlideSearchBar.tsx                  # Instant fuzzy full-text query input
│       └── PDFViewerModal.tsx                  # Canvas-based dark-inverted PDF renderer
└── .github/
    └── workflows/
        └── release-plugin.yml                  # Automated compilation to plugin.zip GitHub release
```

---

## 47. Phase 6 AI Worker Agent Prompts & Step-by-Step Implementation Milestones

---

### Milestone 30 Prompt: Executive Header Decluttering & Single Sidebar Collapser Enforcement `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a frontend UI engineer working on the TU Cockpit desktop application.

### Objective:
Streamline the Executive Header according to user feedback:
1. Eliminate the duplicate sidebar collapser button from `ExecutiveHeader.tsx`. The collapse/expand button must exist solely on the sidebar navigation component (`ConfigurableNav.tsx`).
2. Remove the Deadlines button, the Slide Vault button, and the Split View button from `ExecutiveHeader.tsx`.
3. In `App.tsx`, remove the Deadlines agenda modal and Split View container overlays, returning the main application area to a pristine, focused workstation canvas.

### Tasks:
1. In `src/components/header/ExecutiveHeader.tsx`:
   - Remove lines 70–82 rendering the duplicate `PanelLeftOpen` / `PanelLeftClose` toggle button.
   - Remove the Deadlines Agenda button (`setAgendaOpen(true)`).
   - Remove the Offline Lecture Vault button (`setVaultModalOpen(true)`).
   - Remove the Split View button (`toggleSplit()`).
   - Remove unused imports (`Calendar`, `FolderArchive`, `Columns2`, `PanelLeftClose`, `PanelLeftOpen`, `useDeadlineStore`, `useSlideVaultStore`).
   - Retain strictly:
     - Left: TU Cockpit branding logo and active plugin breadcrumb (when viewing a plugin).
     - Center: Global Search trigger (`Cmd+K`) and academic semester indicator (`WS 2026/27`).
     - Right: Student Profile Pill (`currentUser`), Live Clock, and Settings gear icon.
2. In `src/App.tsx`:
   - Remove `isSplitActive` check and `<SplitViewContainer />` from `renderMainContent`.
   - Remove `<DeadlinesAgendaModal />` and `<OfflineVaultView />` modals from the main render tree.
   - Remove unused imports related to split view and deadlinestore.
3. In `src/components/navigation/ConfigurableNav.tsx`:
   - Verify that the sidebar collapse button functions reliably in both expanded (`w-64`) and collapsed (`w-14`) states, as well as via the `Cmd+B` keyboard shortcut.

### Verification:
- Run `npm run build` to confirm zero TypeScript compilation errors or broken imports.
- Launch the application and observe the Executive Header:
  - Verify that only one sidebar toggle button is visible (on the sidebar rail).
  - Verify that Deadlines, Slide Vault, and Split View buttons are completely gone from the header.
  - Verify the header looks clean, balanced, and responsive.

### Git Hygiene:
Commit message:
`refactor(header): streamline executive header, remove duplicate collapser, deadlines, and splitview`
```

---

### Milestone 31 Prompt: Purge Example Mock Plugins & Consolidate "TU Essentials" Category `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a software engineer working on the TU Cockpit plugin registry and category system.

### Objective:
Completely eliminate all 6 hardcoded mock/example plugins and consolidate the application's built-in tools under a single, official category named **"TU Essentials"**.

### Tasks:
1. In `src/services/marketplace/GitHubPluginService.ts`:
   - In `StoreRegistryPlugin` interface, update `category` type to allow `"TU Essentials"`:
     `category: "TU Essentials" | "Academic" | "Campus Life" | "Productivity" | string;`
   - In `DEFAULT_STORE_REGISTRY.plugins`:
     - Delete the 6 mock plugins completely:
       - `tuwien.community.smart-tuwel`
       - `tuwien.community.tiss-schedule`
       - `tuwien.community.vowi-companion`
       - `tuwien.community.mensa-today`
       - `tuwien.community.room-locator`
       - `tuwien.community.freihaus-timer`
     - Retain strictly the 4 official plugins:
       1. `tuwien.official.tuwel`
       2. `tuwien.official.tiss`
       3. `tuwien.official.vowi`
       4. `tuwien.official.tumaps`
     - Set `category: "TU Essentials"` for all four official plugins.
2. In `src/store/useAppStore.ts`:
   - Replace `INITIAL_CATEGORIES` with a single default category:
     ```ts
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
     ];
     ```
3. In `src/components/marketplace/PluginMarketplace.tsx`:
   - Update `CATEGORIES` array:
     `const CATEGORIES = ["All", "TU Essentials"] as const;`
   - Ensure the category filter pills cleanly filter the 4 official plugins.

### Verification:
- Run `npm run build`.
- Open the application:
  - Check the sidebar: Confirm there is only one category titled **"TU Essentials"** holding the 4 official portals.
  - Open the Community Store: Confirm that no mock plugins (`Smart TUWEL`, `Mensa Today`, etc.) are shown anywhere in the catalog.
  - Verify that only TUWEL, TISS, VoWi, and TU Maps are present.

### Git Hygiene:
Commit message:
`feat(store): purge mock example plugins and consolidate official portals under tu essentials`
```

---

### Milestone 32 Prompt: Fix VoWi & Official Plugins Installation / Native Child-Webview Loading Bug `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a desktop core engineer working on TU Cockpit's plugin runtime and webview orchestration.

### Objective:
Fix the critical bug where installing an official plugin (tested with VoWi) and launching it shows only a fallback message `"✓ Sandboxed execution verified"` instead of rendering the live institutional portal or webview.

### Tasks:
1. In `src/services/marketplace/GitHubPluginService.ts`:
   - Ensure every official plugin entry in `DEFAULT_STORE_REGISTRY` explicitly includes the top-level `homepage` attribute:
     - `tuwien.official.tuwel`: `homepage: "https://tuwel.tuwien.ac.at"`
     - `tuwien.official.tiss`: `homepage: "https://tiss.tuwien.ac.at"`
     - `tuwien.official.vowi`: `homepage: "https://vowi.fsinf.at"`
     - `tuwien.official.tumaps`: `homepage: "https://maps.tuwien.ac.at"`
2. In `src/components/marketplace/PluginMarketplace.tsx`:
   - In `handleInstallPlugin(entry: StoreRegistryPlugin)`:
     - If `entry.id.startsWith("tuwien.official.")`:
       - Import `OFFICIAL_PLUGINS` from `@/plugins/official/OfficialPlugins`.
       - Retrieve `const officialDef = OFFICIAL_PLUGINS[entry.id];`.
       - If `officialDef` exists, install using its authoritative manifest and htmlContent:
         `installPlugin(officialDef.manifest, officialDef.htmlContent, "registry");`
       - This prevents the routine from attempting an external GitHub fetch and falling back to dummy HTML!
     - In the fallback manifest synthesis (for non-official plugins), ensure `homepage: entry.homepage` is preserved in the manifest object.
3. In `src/App.tsx`:
   - Strengthen the active plugin view renderer for official portals:
     ```tsx
     const KNOWN_OFFICIAL_URLS: Record<string, string> = {
       "tuwien.official.tuwel": "https://tuwel.tuwien.ac.at",
       "tuwien.official.tiss": "https://tiss.tuwien.ac.at",
       "tuwien.official.vowi": "https://vowi.fsinf.at",
       "tuwien.official.tumaps": "https://maps.tuwien.ac.at",
     };

     const isOfficialPortal = activePlugin.manifest.id.startsWith("tuwien.official.");
     const portalUrl = activePlugin.manifest.homepage || KNOWN_OFFICIAL_URLS[activePlugin.manifest.id];

     if (isOfficialPortal && portalUrl) {
       return (
         <main className="flex-1 w-full h-full relative overflow-hidden p-0 m-0">
           <NativePortalContainer
             key={activePlugin.manifest.id}
             portalId={activePlugin.manifest.id}
             url={portalUrl}
             title={activePlugin.manifest.name}
           />
         </main>
       );
     }
     ```
4. In `src/plugins/official/OfficialPlugins.ts`:
   - Double-check that `tuwien.official.vowi` and `tuwien.official.tumaps` have valid `homepage`, `title`, and `htmlContent`.

### Verification:
- Run `npm run build`.
- In the app, uninstall VoWi if already installed, then go to Community Store and click "Install" on "VoWi Student Wiki".
- Click on "VoWi Student Wiki" in the sidebar:
  - **Verify:** The live VoWi portal (`https://vowi.fsinf.at`) loads seamlessly in the native child-webview.
  - **Verify:** It does NOT show `"✓ Sandboxed execution verified"`.
- Test clicking TUWEL, TISS, and TU Maps as well: all four must open their real websites cleanly.

### Git Hygiene:
Commit message:
`fix(plugins): repair official portal manifest propagation and resolve vowi webview mounting bug`
```

---

### Milestone 33 Prompt: Standalone Community Repository Specification & Scaffold: `tu-slide-vault` `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are an open-source maintainer and plugin architect for the TU Cockpit Community (`tu-cockpit-community`).

### Objective:
Decouple the Slide Vault from TU Cockpit's core codebase and create the complete architecture and repository blueprint for `https://github.com/tu-cockpit-community/tu-slide-vault`.

### Tasks:
1. Document the full project repository scaffold for `tu-slide-vault` in `docs/plugins/tu-slide-vault.md`:
   - Repository name: `tu-slide-vault` under org `https://github.com/tu-cockpit-community`.
   - `manifest.json`:
     - ID: `tuwien.community.slide-vault`
     - Name: `TU Slide Vault`
     - Version: `1.0.0`
     - Category: `Academic`
     - Entrypoint: `index.html`
     - Capabilities: `["https://tuwel.tuwien.ac.at/*", "https://vowi.fsinf.at/*"]`, storage quota: 100MB.
2. Provide the standalone frontend implementation structure:
   - React 19 + TypeScript + Vite.
   - Client-side PDF text indexing using `pdfjs-dist` (or WebAssembly SQLite FTS5) in a Web Worker to avoid blocking the UI thread.
   - Offline slide storage using browser `IndexedDB` with chunked blob storage.
   - Built-in PDF reader with page jumping, zoom controls, and dark-mode tile inversion CSS filter.
3. Provide `.github/workflows/release-plugin.yml`:
   - Automated workflow triggered on tags (`v*`).
   - Runs `npm run build`, copies `manifest.json` into `dist/`, compresses into `plugin.zip`, generates `checksum.sha256`, and creates a GitHub Release.
4. Clean up the core `TU-Cockpit` repository:
   - Ensure `OfflineVaultView.tsx` and `useSlideVaultStore.ts` are deprecated or moved to community documentation references, ensuring zero runtime dead weight in the core shell.

### Verification:
- Verify that `docs/plugins/tu-slide-vault.md` contains a complete, turnkey recipe to initialize the standalone GitHub repo with `git init`, `package.json`, `manifest.json`, and the CI/CD pipeline.
- Ensure TU Cockpit's GitHub Community discovery engine (`GitHubPluginService.discoverCommunityPlugins()`) will automatically discover and present `tu-slide-vault` once published to the organization.

### Git Hygiene:
Commit message:
`docs(plugins): specify standalone community repository blueprint for tu-slide-vault`
```


