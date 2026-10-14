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
>
> **Current Sprint Status:**
> - 🟢 **PHASES 1–11 (COMPLETED & ARCHIVED):** Foundational Runtime, Portals, Org Auto-Discovery, Native Child-Webviews, Full-Bleed Canvas, In-App Updater, Workstation Streamlining, "TU Essentials", Invisibility Bus, Authentic Institutional Rendering, Direct SSO Autofill, Headless VoWi Reader, Autonomous `tu-calendar` Community Plugin, Autonomous `tu-slide-vault` Community Plugin, and Launching Reliability & Bundling Invariants (Milestones 0–46).
> - 🟡 **PHASE 12 (ACTIVE SPRINT):** Community Plugin Single-File Inlining, Local Dev Loader & Store Registry Hardening (Milestones 47–49).

---

# ==============================================================================
# 🟡 PART XII: PHASE 12 — COMMUNITY PLUGIN SINGLE-FILE INLINING, LOCAL DEV LOADER & STORE REGISTRY HARDENING
# ==============================================================================

> **Phase 12 Summary & Objective:**  
> Eliminate the blank-screen failure mode in community plugins (`tu-calendar`, `tu-slide-vault`) by resolving the architectural clash between `srcDoc` sandboxed iframes and standard Vite multi-chunk builds.
>
> **Root Cause Forensic Recap:**
> 1. **`srcDoc` Asset Resolution Black Hole:** An iframe running via `<iframe srcDoc={htmlContent} />` has an origin of `about:srcdoc`. It cannot resolve relative assets (`./assets/index-*.js`) or uncompiled source modules (`/src/main.tsx`) against `localhost:1420`.
> 2. **Missing `vite-plugin-singlefile` in Plugin Repos:** Standard Vite outputs chunked assets (`dist/index.html` + `dist/assets/*`). All scripts, stylesheets, and SVG assets must be inlined into a single self-contained HTML file.
> 3. **`CommunityOrgService` Fallback Masking:** `CommunityOrgService.ts` queried GitHub for community plugins but set `htmlContent: undefined`, which stripped the working pre-bundled HTML fallbacks in `DEFAULT_STORE_REGISTRY` and triggered a broken download flow.
> 4. **Git Source Tree vs. Compiled Distribution:** The Rust downloader (`plugin_downloader.rs`) downloaded raw GitHub repository `zipball`s (which only contain source code without `dist/`). Plugins must publish compiled `plugin.zip` release assets containing `dist/index.html` + `manifest.json`.

---

## 59. Phase 12 AI Worker Agent Prompts & Step-by-Step Implementation Milestones

---

### Milestone 47 Prompt: Configure `vite-plugin-singlefile` in `tu-calendar` and `tu-slide-vault` `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a frontend build engineer and plugin developer working on the TU Cockpit community ecosystem.

### Objective:
Configure `vite-plugin-singlefile` in both `community-plugins/tu-calendar` and `community-plugins/tu-slide-vault` so that running `npm run build` produces a 100% self-contained `dist/index.html` with all JavaScript, CSS, and assets inlined.

### Context & Subfolder Repositories:
- [community-plugins/tu-calendar/package.json](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-calendar/package.json)
- [community-plugins/tu-calendar/vite.config.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-calendar/vite.config.ts)
- [community-plugins/tu-slide-vault/package.json](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-slide-vault/package.json)
- [community-plugins/tu-slide-vault/vite.config.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-slide-vault/vite.config.ts)

### Tasks:

#### 1. Setup Single-File Bundler in `community-plugins/tu-calendar`
- In `community-plugins/tu-calendar/package.json`, add `"vite-plugin-singlefile": "^2.1.0"` to `devDependencies`.
- In `community-plugins/tu-calendar/vite.config.ts`:
  ```ts
  import { defineConfig } from "vite";
  import react from "@vitejs/plugin-react";
  import { viteSingleFile } from "vite-plugin-singlefile";

  export default defineConfig({
    plugins: [react(), viteSingleFile()],
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  });
  ```
- Install dependencies and build:
  ```bash
  cd community-plugins/tu-calendar && npm install && npm run build
  ```
- Verify `dist/index.html` exists and contains inlined `<script>` and `<style>` blocks with NO external `<script src="...">` or `<link rel="stylesheet">`.
- Commit changes in `tu-calendar` repo:
  ```bash
  git -C community-plugins/tu-calendar add package.json package-lock.json vite.config.ts
  git -C community-plugins/tu-calendar commit -m "build(vite): add vite-plugin-singlefile for sandboxed iframe compatibility"
  ```

#### 2. Setup Single-File Bundler in `community-plugins/tu-slide-vault`
- In `community-plugins/tu-slide-vault/package.json`, add `"vite-plugin-singlefile": "^2.1.0"` to `devDependencies`.
- In `community-plugins/tu-slide-vault/vite.config.ts`:
  ```ts
  import { defineConfig } from "vite";
  import react from "@vitejs/plugin-react";
  import { viteSingleFile } from "vite-plugin-singlefile";

  export default defineConfig({
    plugins: [react(), viteSingleFile()],
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  });
  ```
- Install dependencies and build:
  ```bash
  cd community-plugins/tu-slide-vault && npm install && npm run build
  ```
- Verify `dist/index.html` exists and contains inlined `<script>` and `<style>` blocks.
- Commit changes in `tu-slide-vault` repo:
  ```bash
  git -C community-plugins/tu-slide-vault add package.json package-lock.json vite.config.ts
  git -C community-plugins/tu-slide-vault commit -m "build(vite): add vite-plugin-singlefile for sandboxed iframe compatibility"
  ```

### Verification:
1. `test -f community-plugins/tu-calendar/dist/index.html` returns true.
2. `test -f community-plugins/tu-slide-vault/dist/index.html` returns true.
3. Neither `dist/index.html` references `./assets/*.js` or `./assets/*.css`.

### Git Hygiene:
Commits made within `community-plugins/tu-calendar` and `community-plugins/tu-slide-vault` with message:
`build(vite): add vite-plugin-singlefile for sandboxed iframe compatibility`
```

---

### Milestone 48 Prompt: Fix `CommunityOrgService` Fallback Masking & Local Dev Loader `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a React and TypeScript frontend systems engineer working on TU Cockpit.

### Objective:
Ensure `CommunityOrgService.ts` preserves pre-bundled `htmlContent` when discovering plugins from GitHub, and implement local dev loading so that clicking "Install" on `tu-calendar` or `tu-slide-vault` renders the rich, compiled single-file bundle without blank screens.

### Context & Files:
- [src/services/marketplace/CommunityOrgService.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/marketplace/CommunityOrgService.ts)
- [src/services/marketplace/GitHubPluginService.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/marketplace/GitHubPluginService.ts)
- [src/components/marketplace/PluginMarketplace.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/marketplace/PluginMarketplace.tsx)

### Tasks:

#### 1. Inherit Pre-Bundled `htmlContent` in `CommunityOrgService.ts`
- In `src/services/marketplace/CommunityOrgService.ts`:
  - When constructing `StoreRegistryPlugin` from discovered GitHub repositories, cross-reference `DEFAULT_STORE_REGISTRY.plugins` by `manifest.id`.
  - Preserve `htmlContent: defaultEntry?.htmlContent`:
    ```ts
    const defaultEntry = DEFAULT_STORE_REGISTRY.plugins.find(
      (p) => p.id === manifest.id
    );
    const plugin: StoreRegistryPlugin = {
      // ... existing fields ...
      htmlContent: defaultEntry?.htmlContent,
    };
    ```
  - This ensures that when the GitHub API returns repositories, it never overwrites the verified embedded single-file application with `undefined`.

#### 2. Local Development Single-File Loader in `PluginMarketplace.tsx`
- In `src/components/marketplace/PluginMarketplace.tsx`:
  - When `handleInstall(entry)` is called:
    - If `entry.htmlContent` is present (either from the registry or local bundle), install using `installPlugin(manifest, entry.htmlContent, "registry")`.
    - If `entry.htmlContent` is missing, check if `DEFAULT_STORE_REGISTRY.plugins` has a bundled HTML for this ID before making network requests.
    - Guarantee that `installPlugin` is never invoked with uncompiled JSX or placeholder cards.

#### 3. End-to-End Verification of Community Tools
- Open TU Cockpit Community Store (`activeView === "marketplace"`).
- Install `tuwien.community.calendar`:
  - Verify that the app launches in `PluginFrame`.
  - Verify that the Weekly Timetable, TUWEL Deadlines Calendar, and Checklist render with full interactive controls and zero console errors.
- Install `tuwien.community.slide-vault`:
  - Verify that the Course Selector, Search Bar, Slide Deck Grid, and Dark-Mode PDF Viewer modal render with full interactive controls.

### Verification:
1. `npm run build` passes with zero errors.
2. In dev runtime, both community plugins launch with 100% full interactive UI and zero blank screen errors.

### Git Hygiene:
Commit message in `Tuwel-Tools`:
`fix(marketplace): preserve bundled htmlContent in CommunityOrgService and harden plugin installer`
```

---

### Milestone 49 Prompt: GitHub Actions Release Pipeline & `plugin_downloader.rs` Release Asset Invariant `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a desktop systems engineer and CI/CD architect working on TU Cockpit.

### Objective:
Create automated GitHub Actions release workflows in `tu-calendar` and `tu-slide-vault` to publish single-file `plugin.zip` bundles on git tags, and update `plugin_downloader.rs` to fetch compiled `plugin.zip` release assets rather than raw source `zipball`s.

### Context & Files:
- [community-plugins/tu-calendar/.github/workflows/release-plugin.yml](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-calendar/.github/workflows/release-plugin.yml)
- [community-plugins/tu-slide-vault/.github/workflows/release-plugin.yml](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/community-plugins/tu-slide-vault/.github/workflows/release-plugin.yml)
- [src-tauri/src/plugin_downloader.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/plugin_downloader.rs)

### Tasks:

#### 1. Setup GitHub Actions Release Workflow for Community Plugins
- In `community-plugins/tu-calendar/.github/workflows/release-plugin.yml` and `community-plugins/tu-slide-vault/.github/workflows/release-plugin.yml`:
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
- Commit workflows inside their respective repositories and push to remotes.

#### 2. Update `plugin_downloader.rs` to Download Compiled Release Assets
- In `src-tauri/src/plugin_downloader.rs`:
  - When `install_plugin_from_github` is called:
    - First check if a GitHub Release exists with asset `plugin.zip` via `https://api.github.com/repos/{owner}/{repo}/releases/tags/{tag}` or `releases/latest`.
    - If `plugin.zip` asset is available, download the release asset directly instead of the raw repository source `zipball`.
    - If no release asset is found, fall back gracefully to extracting the zipball entrypoint.

### Verification:
1. `cargo check --manifest-path src-tauri/Cargo.toml` passes.
2. `npm run build` in host repo passes.

### Git Hygiene:
Commit in `Tuwel-Tools`:
`feat(downloader): support compiled plugin.zip release asset extraction in plugin_downloader`
```
