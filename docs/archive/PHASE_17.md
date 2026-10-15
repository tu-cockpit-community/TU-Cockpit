# Phase 17: Project Structure Consolidation & Dev-Plugins Integration: Subfolder Architecture Migration, DevStudio Workspace Alignment & Storage Routing

> **Cold Storage Archive**  
> **Status:** COMPLETED ✅  
> **Milestones:** Milestones 65–66  
> **Repository:** [`tu-cockpit-community/TU-Cockpit`](https://github.com/tu-cockpit-community/TU-Cockpit)  
> **Date Archived:** 2026-10-15  

---

# ==============================================================================
# 🟢 PART XVII: PHASE 17 — PROJECT STRUCTURE CONSOLIDATION & DEV-PLUGINS INTEGRATION (COMPLETED ✅)
# ==============================================================================

> **Phase 17 Summary & Objective:**  
> 1. **Project Structure Migration to `dev-plugins/`:** Solidified the physical folder move of local plugin source repositories from `community-plugins/` to `dev-plugins/` in the workspace root (`tu-calendar`, `tu-slide-vault`, `tu-mensa`, `tu-room-radar`).
> 2. **Align DevStudio & Build Automation:** Updated DevStudio path indicators, ignore configurations, safe deletion protections, and documentation across the entire workspace.
> 3. **Configurable Storage Routing:** Implemented in-app configuration and direct navigation for Slide Vault, Downloaded Marketplace Plugins, and DevStudio Local Workspaces with OS-aware native file manager reveal buttons.

---

## Phase 17 Milestones Summary

### Milestone 65: Migrate Workspace Subfolder Architecture to `dev-plugins/` & Align DevStudio `[STATUS: COMPLETED ✅ - Commit 66d2c09]`
- Physical relocation of `community-plugins/` to `dev-plugins/` in workspace root.
- Updated `.gitignore` line 28 to ignore `/dev-plugins/` to avoid git index pollution from sub-repos.
- Updated `DevStudioTab.tsx`, `ConfirmDeleteModal.tsx`, `CommunityPluginBundles.ts`, and `plugin_downloader.rs` safety invariants.
- Preserved all subfolder git histories and upstream remotes (`https://github.com/tu-cockpit-community/*`).

### Milestone 66: Configurable Plugin Storage & Direct In-App Navigation `[STATUS: COMPLETED ✅ - Commit 47eb4a3]`
- Added Rust IPC commands: `get_dev_plugins_path`, `set_dev_plugins_path`, and `reveal_dev_plugins_folder`.
- Added global `devPluginsPath`, `setDevPluginsPath`, `isSettingsModalOpen`, `settingsInitialTab`, `openSettings(tab)`, and `closeSettings()` to `useAppStore`.
- Added `[📁 Storage Folders]` shortcut in `PluginMarketplace.tsx` header toolbar to jump straight to Settings.
- Added `[📁 Configure Storage]` shortcut and `[Reveal in Finder]` button in `DevStudioTab.tsx`.
- Extended `PluginsSettingsTab.tsx` with all 3 storage sections (Slide Vault, Downloaded Plugins, DevStudio Workspaces) and OS-aware buttons ("Im Finder anzeigen" / "Im Explorer öffnen").
