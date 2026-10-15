# Phase 16: Authentic University Workflow Ingestion: Physical Slide Vault, DevStudio, Real GitHub Download/Delete & In-Webview Sync

> **Cold Storage Archive**  
> **Status:** COMPLETED ✅  
> **Milestones:** Milestones 59–64  
> **Repository:** [`tu-cockpit-community/TU-Cockpit`](https://github.com/tu-cockpit-community/TU-Cockpit)  
> **Date Archived:** 2026-10-15  

---

# ==============================================================================
# 🟢 PART XVI: PHASE 16 — AUTHENTIC UNIVERSITY WORKFLOW INGESTION: PHYSICAL SLIDE VAULT, DEVSTUDIO, REAL GITHUB DOWNLOAD/DELETE & IN-WEBVIEW SYNC (COMPLETED ✅)
# ==============================================================================

> **Phase 16 Summary & Objective:**  
> 1. **Settings Modal "Plugins" Tab & Physical Slide Vault:** Implement physical filesystem storage for Slide Vault (`~/Documents/TU-Cockpit/Slide-Vault/`) with native folder picker and "Open in Finder/Explorer".
> 2. **DevStudio (Local Plugin Staging & Pre-release Testing):** Upgrade the marketplace developer view into a dedicated DevStudio where local development plugins are recognized, staged, and tested without deleting local disk repositories.
> 3. **Dedicated Downloaded Plugins Directory & Real GitHub Installation:** Create a dedicated filesystem directory for downloaded marketplace plugins. Make "Install Plugin" actually download the release archive (`plugin.zip`) from GitHub, extract to disk, and run from real files.
> 4. **Real Safe Deletion Engine with Confirmation Modal:** Add `<ConfirmDeleteModal />` before uninstallation, and implement Rust command `delete_installed_plugin` to purge files from disk while strictly safeguarding local DevStudio plugins.
> 5. **In-Webview TUWEL & TISS Ingestion:** Inject `[📥 Add to Slide Vault]` next to TUWEL lecture slides to save directly to disk, and automatically sync TISS timetable on navigation.
> 6. **Layout Formatting Fix & Zero-Mock Policy:** Eliminate raw/unformatted rendering in `tu-calendar` and `tu-room-radar`, and purge all dummy mock cards across plugins.

---

## 63. Phase 16 AI Worker Agent Prompts & Step-by-Step Implementation Milestones

---

### Milestone 59 Prompt: Settings Modal Plugins Tab & Physical Filesystem Slide Vault Storage Engine `[STATUS: COMPLETED ✅ - Commit b826bfa]`

```markdown
You are a senior full-stack desktop systems engineer specializing in Tauri v2, Rust filesystem APIs, and React 19 settings UI.

### Objective:
Implement a physical filesystem storage engine for the TU Slide Vault and add a dedicated "Plugins" tab to `SettingsModal.tsx` allowing students to configure their storage folder, open it in the OS file manager, and manage plugin-specific settings.

### Context & Files:
- [src/components/settings/SettingsModal.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/settings/SettingsModal.tsx)
- [src/store/useAppStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useAppStore.ts)
- [src-tauri/src/lib.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/lib.rs)
- Create: `src-tauri/src/slide_vault.rs`
- Create: `src/components/settings/PluginsSettingsTab.tsx`
- Specifications: [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md) Section 5.5

### Verification Runbook:
1. `npm run build`
2. `cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `feat(settings): add plugins tab and physical filesystem slide vault engine`
```

---

### Milestone 60 Prompt: DevStudio (Local Plugin Development & Pre-Release Staging) `[STATUS: COMPLETED ✅ - Commit 1861dd6]`

```markdown
You are a senior frontend engineer and tooling specialist working on developer experience for the TU Cockpit plugin ecosystem.

### Objective:
Upgrade the developer section of `PluginMarketplace.tsx` into **DevStudio** (replacing static guide text with an interactive local plugin development sandbox). Recognize and surface locally installed plugins as local dev plugins (`sourceType: "local"`), and enforce the protected workspace invariant so local dev repositories are never deleted from disk.

### Context & Files:
- [src/components/marketplace/PluginMarketplace.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/marketplace/PluginMarketplace.tsx)
- Create: `src/components/marketplace/DevStudioTab.tsx`
- [src/store/useDeveloperStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useDeveloperStore.ts)
- [src/store/useAppStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useAppStore.ts)
- Specifications: [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md) Section 5.8

### Verification Runbook:
1. `npm run build`
2. `cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `feat(marketplace): create devstudio tab and protect local dev workspaces`
```

---

### Milestone 61 Prompt: Dedicated Downloaded Plugins Directory & Real GitHub Installation `[STATUS: COMPLETED ✅ - Commit 884ed77]`

```markdown
You are a senior Tauri systems and backend networking engineer specializing in GitHub releases and archive management.

### Objective:
Implement a dedicated filesystem folder for downloaded marketplace plugins (default `~/Documents/TU-Cockpit/Plugins/` or `$APPDATA/tu_cockpit/downloaded_plugins/`) and ensure the "Install Plugin" button in `PluginMarketplace.tsx` actually downloads compiled release bundles (`plugin.zip`) from GitHub, extracts them into this folder, and runs them from real files on disk.

### Context & Files:
- [src-tauri/src/plugin_downloader.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/plugin_downloader.rs)
- [src-tauri/src/lib.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/lib.rs)
- [src/services/marketplace/GitHubPluginService.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/marketplace/GitHubPluginService.ts)
- [src/components/marketplace/PluginMarketplace.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/marketplace/PluginMarketplace.tsx)
- [src/components/settings/PluginsSettingsTab.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/settings/PluginsSettingsTab.tsx)
- Specifications: [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md) Section 5.9

### Verification Runbook:
1. `npm run build`
2. `cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `feat(plugins): implement real github download pipeline into dedicated storage folder`
```

---

### Milestone 62 Prompt: Real Plugin Deletion Engine with Confirmation Modal & Safety Safeguards `[STATUS: COMPLETED ✅ - Commit 31d4700]`

```markdown
You are a senior desktop software engineer specializing in safe filesystem manipulation and accessible confirmation dialogues.

### Objective:
Implement a real plugin deletion engine in Rust that purges downloaded marketplace plugins from disk, accompanied by a mandatory "Confirm Deletion" modal dialog in the UI. Strictly enforce safeguards preventing any filesystem deletion of local DevStudio plugins.

### Context & Files:
- [src-tauri/src/plugin_downloader.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/plugin_downloader.rs)
- [src-tauri/src/lib.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/lib.rs)
- Create: `src/components/marketplace/ConfirmDeleteModal.tsx`
- [src/components/marketplace/PluginMarketplace.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/marketplace/PluginMarketplace.tsx)
- [src/store/useAppStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useAppStore.ts)
- Specifications: [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md) Section 5.9

### Verification Runbook:
1. `npm run build`
2. `cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `feat(plugins): implement safe physical plugin deletion and confirmation modal`
```

---

### Milestone 63 Prompt: In-Webview TUWEL "Add to Slide Vault" & TISS Auto-Sync Engine `[STATUS: COMPLETED ✅ - Commit fb82aa0]`

```markdown
You are a senior Tauri systems engineer specializing in webview DOM bridge automation and university portal integration.

### Objective:
Implement automatic calendar synchronization when navigating to TISS and inject an authentic "Add to Slide Vault" button next to all lecture slide and PDF download links inside the TUWEL child webview.

### Context & Files:
- [src-tauri/src/native_webview.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/native_webview.rs)
- [src-tauri/src/embedded_portals.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/embedded_portals.rs)
- [src-tauri/src/slide_vault.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/slide_vault.rs)
- Specifications: [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md) Sections 4.8 & 4.9

### Verification Runbook:
1. `npm run build`
2. `cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `feat(portals): inject tuwel slide vault buttons and tiss calendar auto-sync`
```

---

### Milestone 64 Prompt: Fix Plugin Layout Formatting & Zero-Mock Policy Eradication `[STATUS: COMPLETED ✅ - Commit d7a8f65]`

```markdown
You are a senior frontend engineer and CSS architecture specialist working across React 19, Tailwind CSS v4, and iframe sandboxes.

### Objective:
Fix unformatted / raw layout rendering in `tu-calendar` and `tu-room-radar`, and eradicate ALL synthetic dummy data across all 4 community plugins, replacing fake cards with authentic empty states and live data feeds.

### Context & Files:
- [src/services/marketplace/CommunityPluginBundles.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/marketplace/CommunityPluginBundles.ts)
- Specifications: [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md) Sections 5.6 & 5.7

### Verification Runbook:
1. `npm run build`
2. `cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `fix(plugins): fix layout formatting and enforce zero-mock policy across community tools`
```
