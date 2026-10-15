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

### Milestone 65 Prompt: Migrate Workspace Subfolder Architecture to `dev-plugins/` & Align DevStudio `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a senior full-stack desktop software engineer specializing in workspace architecture, Git subfolder patterns, and React component integration.

### Objective:
Solidify the migration of local community plugin workspaces to `dev-plugins/`, verify all internal references and ignore configurations, and ensure DevStudio smoothly accesses local development repositories.

### Context & Files:
- Directory: `dev-plugins/` (containing `tu-calendar`, `tu-slide-vault`, `tu-mensa`, `tu-room-radar`)
- [.gitignore](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/.gitignore)
- [src/components/marketplace/DevStudioTab.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/marketplace/DevStudioTab.tsx)
- [src/components/marketplace/ConfirmDeleteModal.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/marketplace/ConfirmDeleteModal.tsx)
- [src/services/marketplace/CommunityPluginBundles.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/services/marketplace/CommunityPluginBundles.ts)
- Specifications: [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md) Sections 5.4 & 5.8

### Detailed Implementation Tasks:

1. **Verify Folder Integrity:**
   - Confirm that all 4 local plugin repositories exist under `dev-plugins/`:
     - `dev-plugins/tu-calendar`
     - `dev-plugins/tu-slide-vault`
     - `dev-plugins/tu-mensa`
     - `dev-plugins/tu-room-radar`
   - Confirm that git remotes (`https://github.com/tu-cockpit-community/*`) inside each subfolder are preserved.

2. **Verify Ignore Rules & DevStudio Alignment:**
   - Confirm `.gitignore` has `/dev-plugins/` ignored so subfolder git repositories do not pollute host git index.
   - Verify `DevStudioTab.tsx` points folder badges to `dev-plugins/*` and tests local single-file bundles.
   - Verify `ConfirmDeleteModal.tsx` references `dev-plugins/` in the protected workspace notice.

3. **Check Build Pipeline for Local Workspaces:**
   - Test `npm run build` inside each `dev-plugins/<plugin>` to verify single-file compilation still succeeds smoothly.

### Verification Runbook:
1. `npm run build`
2. `cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `refactor(plugins): consolidate local workspaces under dev-plugins directory`
```

---

### Milestone 66 Prompt: End-to-End Verification of Local Dev Workspaces & Marketplace Sandbox `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a QA automation and integration specialist working on the TU Cockpit desktop workstation.

### Objective:
Perform end-to-end verification of local plugin staging in DevStudio, ensure the protected dev invariant prevents deletion of `dev-plugins/` files, and verify that marketplace downloads correctly route to the dedicated downloads directory.

### Context & Files:
- [src/components/marketplace/PluginMarketplace.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/marketplace/PluginMarketplace.tsx)
- [src/components/marketplace/DevStudioTab.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/marketplace/DevStudioTab.tsx)
- [src/components/marketplace/ConfirmDeleteModal.tsx](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/components/marketplace/ConfirmDeleteModal.tsx)
- [src/store/useAppStore.ts](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src/store/useAppStore.ts)

### Detailed Implementation Tasks:

1. **Test DevStudio Staging:**
   - In DevStudio, verify all 4 local workspaces can be staged into the Cockpit navigation dock with `sourceType: "local"`.
   - Verify that clicking "Unlink" on a staged local plugin displays the protective notice and unlinks without deleting disk files.

2. **Test Marketplace Download vs Local Separation:**
   - Verify that marketplace plugins are installed with `sourceType: "github"` to the dedicated downloads folder.
   - Verify that clicking uninstall on marketplace plugins triggers `ConfirmDeleteModal` and invokes physical deletion.

3. **Full Desktop Test Suite:**
   - Run typecheck and unit tests to ensure zero regressions across the codebase.

### Verification Runbook:
1. `npm run build`
2. `cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `test(marketplace): verify end-to-end devstudio staging and safe deletion invariant`
```
