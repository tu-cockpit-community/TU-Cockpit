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
> - Milestones 56–58 (Phase 15): See [docs/archive/PHASE_15.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASE_15.md)  
> - Milestones 59–64 (Phase 16): See [docs/archive/PHASE_16.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASE_16.md)  
>
> **Current Sprint Status:**
> - 🟢 **PHASES 1–16 (COMPLETED & ARCHIVED):** Foundational Runtime, Portals, Org Auto-Discovery, Native Child-Webviews, Full-Bleed Canvas, In-App Updater, Workstation Streamlining, "TU Essentials", Invisibility Bus, Authentic Institutional Rendering, Direct SSO Autofill, Headless VoWi Reader, Autonomous Plugins (`tu-calendar`, `tu-slide-vault`, `tu-mensa`, `tu-room-radar`), Launching Reliability, Single-File Inlining, Unified Academic Spotlight, Workstation Status Bar & ICS Calendar Export, Live Functional Plugin Depth, Real GitHub Marketplace Telemetry, Physical Filesystem Slide Vault, DevStudio Staging Environment, Real GitHub Plugin Download & Safe Deletion Engine (Milestones 0–64).
> - 🟡 **PHASE 17 (ACTIVE SPRINT):** Project Structure Consolidation & Dev-Plugins Integration: Subfolder Architecture Migration, DevStudio Workspace Alignment & Build Pipeline Verification (Milestones 65–66).

---

# ==============================================================================
# 🟡 PART XVII: PHASE 17 — PROJECT STRUCTURE CONSOLIDATION & DEV-PLUGINS INTEGRATION
# ==============================================================================

> **Phase 17 Summary & Objective:**  
> 1. **Project Structure Migration to `dev-plugins/`:** Solidify the physical folder move of local plugin source repositories from `community-plugins/` to `dev-plugins/` in the workspace root.
> 2. **Align DevStudio & Build Automation:** Ensure DevStudio, path resolvers, ignore rules, and documentation reflect `dev-plugins/` across the entire workspace.
> 3. **Verify Protected Dev Invariant:** Ensure local repositories in `dev-plugins/` remain strictly protected from physical deletion and can be staged and tested seamlessly in the Cockpit runtime.

---

## 64. Phase 17 AI Worker Agent Prompts & Step-by-Step Implementation Milestones

---

### Milestone 65 Prompt: Migrate Workspace Subfolder Architecture to `dev-plugins/` & Align DevStudio `[STATUS: COMPLETED ✅ - Commit 66d2c09]`

```markdown
Migrated physical local repositories from community-plugins to dev-plugins, aligned ignore rules, DevStudio references, and safe deletion invariants.
```

---

### Milestone 66 Prompt: Configurable Plugin Storage & Direct In-App Navigation `[STATUS: COMPLETED ✅ - Commit 47eb4a3]`

```markdown
You are a senior desktop systems engineer working on the TU Cockpit application.

### Objective:
Implement in-app configuration and direct navigation for all external storage locations: Slide Vault, Downloaded Marketplace Plugins, and DevStudio Local Workspaces.

### Context & Files:
- [src-tauri/src/plugin_downloader.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/plugin_downloader.rs)
- [src-tauri/src/lib.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/lib.rs)
- [src/store/useAppStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useAppStore.ts)
- [src/components/settings/SettingsModal.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/settings/SettingsModal.tsx)
- [src/components/settings/PluginsSettingsTab.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/settings/PluginsSettingsTab.tsx)
- [src/components/marketplace/PluginMarketplace.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/marketplace/PluginMarketplace.tsx)
- [src/components/marketplace/DevStudioTab.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/marketplace/DevStudioTab.tsx)
- [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md) Section 5.10

### Detailed Implementation Tasks:
1. **Rust IPC Backend:**
   - Implemented `get_dev_plugins_path`, `set_dev_plugins_path`, and `reveal_dev_plugins_folder`.
   - Registered commands in `tauri::generate_handler!`.
2. **Global Store & Settings Routing:**
   - Added `devPluginsPath`, `setDevPluginsPath`, `isSettingsModalOpen`, `settingsInitialTab`, `openSettings(tab)`, `closeSettings()` to `useAppStore`.
   - Connected `openSettings("plugins")` across the Marketplace and DevStudio toolbars.
3. **Dedicated Storage Settings Tab:**
   - Visualized all 3 external directories: TU Slide Vault, Downloaded Community Plugins, and DevStudio Local Workspaces.
   - Added directory pickers (`open({ directory: true })`) and OS-aware "Im Finder anzeigen" / "Im Explorer öffnen" reveal actions.
4. **Verification:**
   - Verified clean frontend build (`npm run build`) and Rust backend check (`cargo check`).
```
