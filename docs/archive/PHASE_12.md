# Phase 12: Community Plugin Single-File Inlining, Local Dev Loader & Store Registry Hardening

> **Cold Storage Archive**  
> **Status:** COMPLETED ✅  
> **Milestones:** Milestones 47–49  
> **Repository:** [`tu-cockpit-community/TU-Cockpit`](https://github.com/tu-cockpit-community/TU-Cockpit)  
> **Date Archived:** 2026-10-14  

---

# ==============================================================================
# 🟢 PART XII: PHASE 12 — COMMUNITY PLUGIN SINGLE-FILE INLINING, LOCAL DEV LOADER & STORE REGISTRY HARDENING
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

### Milestone 47 Prompt: Configure `vite-plugin-singlefile` in `tu-calendar` and `tu-slide-vault` `[STATUS: COMPLETED ✅ - Commit d5b14b4 / 1d2719f]`

```markdown
You are a frontend build engineer and plugin developer working on the TU Cockpit community ecosystem.

### Objective:
Configure `vite-plugin-singlefile` in both `community-plugins/tu-calendar` and `community-plugins/tu-slide-vault` so that running `npm run build` produces a 100% self-contained `dist/index.html` with all JavaScript, CSS, and assets inlined.

### Context & Subfolder Repositories:
- community-plugins/tu-calendar/package.json
- community-plugins/tu-calendar/vite.config.ts
- community-plugins/tu-slide-vault/package.json
- community-plugins/tu-slide-vault/vite.config.ts

### Tasks Completed:
1. Configured `vite-plugin-singlefile: ^2.1.0` in `tu-calendar` and built self-contained inlined bundle `dist/index.html` (269.95 kB).
2. Configured `vite-plugin-singlefile: ^2.1.0` in `tu-slide-vault` and built self-contained inlined bundle `dist/index.html` (271.87 kB).
3. Verified zero external `<script src="...">` or `<link rel="stylesheet">` dependencies.
4. Committed in sub-repositories and pushed to GitHub remotes (`43ce62e` / `69f4d4e`).
```

---

### Milestone 48 Prompt: Fix `CommunityOrgService` Fallback Masking & Local Dev Loader `[STATUS: COMPLETED ✅ - Commit 10f4812]`

```markdown
You are a React and TypeScript frontend systems engineer working on TU Cockpit.

### Objective:
Ensure `CommunityOrgService.ts` preserves pre-bundled `htmlContent` when discovering plugins from GitHub, and implement local dev loading so that clicking "Install" on `tu-calendar` or `tu-slide-vault` renders the rich, compiled single-file bundle without blank screens.

### Context & Files:
- src/services/marketplace/CommunityOrgService.ts
- src/services/marketplace/GitHubPluginService.ts
- src/components/marketplace/PluginMarketplace.tsx

### Tasks Completed:
1. Updated `CommunityOrgService.ts` to cross-reference `DEFAULT_STORE_REGISTRY.plugins` by `manifest.id` and preserve `htmlContent: defaultEntry?.htmlContent` when discovering community repositories.
2. Updated `PluginMarketplace.tsx` to resolve `entry.htmlContent || defaultEntry?.htmlContent` prior to making network requests, guaranteeing zero blank screens or fallback placeholder regressions.
3. Verified clean frontend build (`npm run build`).
```

---

### Milestone 49 Prompt: GitHub Actions Release Pipeline & `plugin_downloader.rs` Release Asset Invariant `[STATUS: COMPLETED ✅ - Commit 4fa2f1c]`

```markdown
You are a desktop systems engineer and CI/CD architect working on TU Cockpit.

### Objective:
Create automated GitHub Actions release workflows in `tu-calendar` and `tu-slide-vault` to publish single-file `plugin.zip` bundles on git tags, and update `plugin_downloader.rs` to fetch compiled `plugin.zip` release assets rather than raw source `zipball`s.

### Context & Files:
- community-plugins/tu-calendar/.github/workflows/release-plugin.yml
- community-plugins/tu-slide-vault/.github/workflows/release-plugin.yml
- src-tauri/src/plugin_downloader.rs

### Tasks Completed:
1. Created `.github/workflows/release-plugin.yml` in both `tu-calendar` and `tu-slide-vault` with automated zip packaging (`dist/index.html` + `manifest.json` -> `plugin.zip`) and release publishing on `v*` tags.
2. Pushed workflows to GitHub organization repositories `tu-cockpit-community/tu-calendar` and `tu-cockpit-community/tu-slide-vault`.
3. Updated `src-tauri/src/plugin_downloader.rs` with `GitHubReleaseInfo` and `GitHubReleaseAsset` structs to check for `plugin.zip` release assets via GitHub Releases API before falling back to source zipballs.
4. Added unit test `test_github_release_asset_deserialization` (all 19 tests pass).
```
