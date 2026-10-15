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
> - Milestones 65–66 (Phase 17): See [docs/archive/PHASE_17.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/docs/archive/PHASE_17.md)  
>
> **Current Sprint Status:**
> - 🟢 **PHASES 1–17 (COMPLETED & ARCHIVED):** Foundational Runtime, Portals, Org Auto-Discovery, Native Child-Webviews, Full-Bleed Canvas, In-App Updater, Workstation Streamlining, "TU Essentials", Invisibility Bus, Authentic Institutional Rendering, Direct SSO Autofill, Headless VoWi Reader, Autonomous Plugins (`tu-calendar`, `tu-slide-vault`, `tu-mensa`, `tu-room-radar`), Launching Reliability, Single-File Inlining, Unified Academic Spotlight, Workstation Status Bar & ICS Calendar Export, Live Functional Plugin Depth, Real GitHub Marketplace Telemetry, Physical Filesystem Slide Vault, DevStudio Staging Environment, Real GitHub Plugin Download & Safe Deletion Engine, `dev-plugins/` Consolidation & Storage Configuration (Milestones 0–66).
> - 🟡 **PHASE 18 (ACTIVE SPRINT):** Multi-Platform Target Build Suite: Dedicated Windows (.exe / NSIS), macOS (.dmg / .app), and Linux (.deb / .AppImage) Build Pipelines & CI/CD Tooling (Milestones 67–69).

---

# ==============================================================================
# 🟡 PART XVIII: PHASE 18 — MULTI-PLATFORM TARGET BUILD SUITE (WINDOWS, MACOS, LINUX)
# ==============================================================================

> **Phase 18 Summary & Objective:**  
> 1. **Windows `.exe` & NSIS Packaging:** Configure Tauri v2 to output standalone Windows `.exe` installers via NSIS alongside standard `.msi` installers, specifying per-user install modes and proper icon embedding.
> 2. **Linux Packaging Hardening:** Eliminate Linux packaging clunkiness by declaring precise dependency manifests for WebKitGTK 4.1/4.0 and bundling media frameworks for AppImages.
> 3. **Dedicated Platform Build Commands:** Provide clean, discrete npm commands in `package.json` (`build:win`, `build:win:exe`, `build:mac`, `build:linux`) for targeted, error-free compiling.
> 4. **1-Click Multi-Platform Artifact Builder:** Create a GitHub Actions workflow (`build-artifacts.yml`) that can be manually dispatched to build native Windows `.exe`, Linux `.deb`/`.AppImage`, and macOS `.dmg` binaries in parallel on clean cloud runners.

---

## 65. Phase 18 AI Worker Agent Prompts & Step-by-Step Implementation Milestones

---

### Milestone 67 Prompt: Multi-Platform Bundle Configuration in `tauri.conf.json` & Dedicated npm Build Scripts `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a senior DevOps and Tauri v2 desktop tooling engineer.

### Objective:
Update `tauri.conf.json` with comprehensive multi-platform bundle configurations (Windows NSIS `.exe`, Linux `.deb` dependencies, macOS targets) and add dedicated platform build scripts to `package.json`.

### Context & Files:
- [src-tauri/tauri.conf.json](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/tauri.conf.json)
- [package.json](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/package.json)
- Specifications: [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md) Section 9.1

### Detailed Implementation Tasks:

1. **Configure `tauri.conf.json` Bundle Matrix:**
   - Under `bundle`, add explicit platform configuration blocks:
     - `windows`:
       - `nsis`: `{"installerIcon": "icons/icon.ico", "headerImage": "icons/128x128.png", "sidebarImage": "icons/128x128@2x.png", "installMode": "currentUser"}`
       - `wix`: `{"language": "en-US"}`
     - `linux`:
       - `deb`: `{"depends": ["libwebkit2gtk-4.1-0 | libwebkit2gtk-4.0-37", "libappindicator3-1", "librsvg2-2", "libssl3 | libssl1.1"]}`
       - `appimage`: `{"bundleMediaFramework": true}`
     - `macOS`:
       - `minimumSystemVersion": "10.15"`

2. **Add Dedicated Platform Build Scripts to `package.json`:**
   - `build:mac`: `"tsc && vite build && tauri build --bundles dmg,app"`
   - `build:mac:universal`: `"tsc && vite build && tauri build --target universal-apple-darwin"`
   - `build:win`: `"tsc && vite build && tauri build --bundles nsis,msi"`
   - `build:win:exe`: `"tsc && vite build && tauri build --bundles nsis"`
   - `build:linux`: `"tsc && vite build && tauri build --bundles deb,appimage"`
   - `build:linux:deb`: `"tsc && vite build && tauri build --bundles deb"`
   - `build:linux:appimage`: `"tsc && vite build && tauri build --bundles appimage"`
   - `build:all`: `"tsc && vite build && tauri build"`

### Verification Runbook:
1. Validate `tauri.conf.json` syntax via `npm run build`
2. `cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `feat(build): add multi-platform bundle targets and dedicated npm build commands`
```

---

### Milestone 68 Prompt: Windows Executable & Cross-Platform Filesystem Compatibility Audit `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a systems compatibility engineer auditing Rust desktop code for cross-platform robustness across Windows 10/11, macOS, and Linux.

### Objective:
Audit all path manipulations, directory resolvers, and external process spawns across the Rust backend to ensure flawless execution on Windows (`.exe` binary) and Linux desktop distributions.

### Context & Files:
- [src-tauri/src/slide_vault.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/slide_vault.rs)
- [src-tauri/src/plugin_downloader.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/plugin_downloader.rs)
- [src-tauri/src/offline_vault.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/offline_vault.rs)
- [src-tauri/src/native_webview.rs](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/src-tauri/src/native_webview.rs)

### Detailed Implementation Tasks:

1. **Audit Windows Explorer & Linux Process Launchers:**
   - Verify `reveal_slide_vault_folder`, `reveal_downloaded_plugins_folder`, and `reveal_dev_plugins_folder` correctly launch `explorer.exe` with quote escaping on Windows and `xdg-open` on Linux.
   - Verify `open_slide_file` invokes `cmd /c start ""` on Windows and handles backslashes properly.

2. **Windows Path Separators & Case-Insensitivity:**
   - Ensure paths use `PathBuf` components or normalized forward slashes instead of raw string splitting with `/`.
   - Ensure `dirs::document_dir()` fallbacks properly resolve `%USERPROFILE%\Documents` on Windows.

3. **Verify Windows Icon & Assets:**
   - Confirm `src-tauri/icons/icon.ico` is present and valid for embedding into the Windows `.exe` PE header.

### Verification Runbook:
1. `npm run build`
2. `cargo check --manifest-path src-tauri/Cargo.toml`
3. Git hygiene commit: `fix(windows): audit cross-platform process spawns and path separators`
```

---

### Milestone 69 Prompt: GitHub Actions 1-Click Multi-Platform Artifact Builder Workflow `[STATUS: READY FOR EXECUTION 🟡]`

```markdown
You are a CI/CD specialist maintaining the build and release pipelines for the TU Cockpit repository.

### Objective:
Create a dedicated GitHub Actions workflow (`.github/workflows/build-artifacts.yml`) that can be manually dispatched to build native Windows `.exe` / `.msi`, Linux `.deb` / `.AppImage`, and macOS `.dmg` / `.app` on clean cloud runners, attaching the compiled binaries as downloadable workflow artifacts.

### Context & Files:
- [.github/workflows/release.yml](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/.github/workflows/release.yml)
- Create: `.github/workflows/build-artifacts.yml`

### Detailed Implementation Tasks:

1. **Create `build-artifacts.yml` Workflow:**
   - Trigger on: `workflow_dispatch` (manual button with optional build profile input: `debug` vs `release`).
   - Matrix runners:
     - `windows-latest`: Builds Windows standalone `.exe` (NSIS) and `.msi`.
     - `ubuntu-22.04`: Installs WebKitGTK 4.1 + GTK3 dependencies, builds `.deb` and `.AppImage`.
     - `macos-latest`: Installs universal targets (`aarch64` and `x86_64`), builds `.dmg` and `.app`.
   - Actions:
     - Use `actions/upload-artifact@v4` to bundle all resulting platform installers into easily downloadable zip files (`tu-cockpit-windows-x64.zip`, `tu-cockpit-linux-x64.zip`, `tu-cockpit-macos-universal.zip`).

2. **Local Developer Instructions:**
   - Provide clear instructions in README and documentation on how a developer on macOS or Linux can trigger this workflow with 1 click in GitHub to get Windows `.exe` and Linux packages.

### Verification Runbook:
1. Validate GitHub Actions YAML syntax.
2. `npm run build`
3. Git hygiene commit: `ci(build): add 1-click multi-platform artifact builder workflow`
```
