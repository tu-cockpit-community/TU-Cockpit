<div align="center">

# 🏛️ TU Cockpit
**The Extensible Desktop Workstation for TU Wien Students**

[![Tauri v2](https://img.shields.io/badge/Tauri-v2.0-24C8D8?style=flat-square&logo=tauri&logoColor=white)](https://v2.tauri.app/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Rust](https://img.shields.io/badge/Rust-1.78+-DEA584?style=flat-square&logo=rust&logoColor=black)](https://www.rust-lang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

*A secure, high-performance, modular desktop client uniting TUWEL (Moodle), TISS, Room Finder, and community plugins in one unified workspace.*

</div>

---

## 📌 Overview

**TU Cockpit** is an open-source native desktop workstation engineered specifically for students, researchers, and lecturers at **TU Wien (Vienna University of Technology)**.

Instead of juggling dozens of browser tabs, fighting cookie timeouts, getting blocked by `X-Frame-Options` on university portals, or running untrusted third-party scripts, TU Cockpit brings all university digital services together into a single, cohesive desktop environment with zero-trust security and native OS speed.

---

## ✨ Key Features

### 🌐 1. Native Child-Webviews for University Portals
- **No Blank Screens or Iframe Blocks:** Uses Tauri v2 native child webviews (`tauri::Webview`) attached directly to the main application window via `window.add_child`.
- **Persistent University Sessions:** Configures dedicated data storage directories (`tuwien-official-tuwel`, `tuwien-official-tiss`), preserving Shibboleth SSO cookies and session state across app restarts.
- **Dynamic Viewport Synchronization:** Frontend `ResizeObserver` sends container bounding rects to Rust in real time, resizing and positioning native portals seamlessly alongside the sidebar.

### 🛡️ 2. Exploit-Free Community Store
- **Strict Marketplace Policy:** Rejects arbitrary, unverified GitHub repository sideloading. Installs are strictly enforced at the backend Rust level to repositories within the official [`tu-cockpit-community`](https://github.com/tu-cockpit-community) organization.
- **GitHub Auto-Discovery:** Real-time synchronization with GitHub API caches repository releases, with a built-in offline verified catalog fallback.
- **Developer Guide & Tech Matrix:** Built-in graphical technology support matrix indicating approved runtimes (TypeScript, React 19, Tailwind CSS v4) and forbidden APIs (native binaries, eval scripts, wildcard networks).

### 🎨 3. Adaptive TU Wien Design Engine
- **Universal `--tu-*` Token System:** Complete CSS variable palette (`--tu-bg-canvas`, `--tu-bg-surface`, `--tu-accent`, `--tu-border`, etc.) shared between host and plugins.
- **TU Wien Corporate Identity:** Built-in TU Blue (`#006699`) primary accent, dark mode, light mode, and high-contrast accessibility modes.
- **Dynamic Typography:** Choose between Inter, Outfit, JetBrains Mono, and Fira Code system fonts on the fly.

### 🧭 4. Multi-Orientation Navigation & Category Management
- **Flexible Dock Positioning:** Seamlessly toggle your workspace navigation dock between **Left**, **Right**, **Bottom**, and **Top**.
- **Custom Category Organization:** Group university portals and installed community plugins into custom user folders (e.g. *Academic*, *Campus Life*, *Exams*, *Projects*) with collapsible accordions.
- **Dock Pinning:** Pin your favorite tools and portals to the executive header dock for single-click access.

### 🔐 5. Integrated SSO & MFA Vault
- **RFC 6238 TOTP Engine:** Native Rust time-based one-time password computation with live countdown indicators.
- **Hardware-Isolated Storage:** Student credentials and MFA seeds encrypted and securely persisted in local application storage.
- **One-Click Autofill:** Injects credentials into TU Wien Shibboleth authentication screens without exposing keys to web content.

### ⚡ 6. Full-Bleed Canvas & Collapsible Sidebar
- **Zero-Gutter Workstation:** Elimination of artificial `max-w-6xl` containers and redundant faux-browser header banners. University portals render edge-to-edge taking up 100% of the viewport.
- **Orientation-Aware Collapse (`Cmd+B`):** Lateral sidebars (Left/Right) instantly toggle into a space-saving 56px icon rail or expand to full width.

### 🔍 7. Global Spotlight / Command Palette (`Cmd+K`)
- **Campus Room Index:** Instant fuzzy matching for TU Wien lecture halls (e.g. *EI 7*, *Freihaus Hörsaal 1*, *Informatikhörsaal*) with direct TU Maps jumping.
- **Unified 4-Domain Search:** Query across campus rooms, installed community plugins, official university portals, active semester courses, and system actions in milliseconds.

### 🪟 8. Multi-Webview Split-Screen & Detachable Windows
- **Side-by-Side Multitasking:** Split the workstation canvas between two active webviews with presets (`1:1`, `7:3`, `3:7`) and interactive drag-to-resize dividers.
- **Detachable Floating Windows:** Pop portals out into dedicated OS windows for multi-monitor lecture setups.

### 📅 9. University Deadline Aggregator & Calendar Sync
- **Automated Synchronization:** Ingests TUWEL assignment deadlines and TISS exam dates into a local SQLite table (`student_deadlines`).
- **Native OS Daemon Alerts:** Background notification daemon alerts students 24 hours and 2 hours prior to assignment submissions.
- **Dynamic `.ics` Feed Export:** One-click calendar export compatible with Apple Calendar, Google Calendar, and Microsoft Outlook.

### 📚 10. Offline Lecture Material Vault (SQLite FTS5)
- **Train & Subway Resilience:** Download course slides and PDFs into a local vault for offline study without Wi-Fi.
- **Per-Page Full-Text Search:** High-performance SQLite FTS5 search across slide contents with highlighted search snippets.
- **OLED Dark-Mode Reader:** Integrated PDF viewer with zoom controls, page jumping, and inverted canvas rendering for late-night studying.

### 🚀 11. Cryptographically Signed In-App Auto-Updater
- **Tauri v2 Auto-Updater:** Seamless background update delivery powered by `@tauri-apps/plugin-updater` and GitHub Releases.
- **Minisign Ed25519 Signatures:** Delta packages verified cryptographically before installation with one-click restart.

---

## 🏗️ Architecture

```mermaid
graph TD
    subgraph Frontend ["Frontend (React 19 + TypeScript + Tailwind v4)"]
        UI[Executive Header & Configurable Nav]
        Palette[Spotlight Command Palette Cmd+K]
        Split[Multi-Webview SplitViewContainer]
        Deadlines[Deadline Agenda & iCal Export]
        VaultUI[Offline Vault & Dark PDF Viewer]
        UpdaterUI[Updater Toast & Settings]
        Store[Zustand Stores]
    end

    subgraph IPC ["Tauri v2 IPC Bridge"]
        Invoke[tauri.invoke Commands]
    end

    subgraph Backend ["Backend (Rust + Tauri v2)"]
        ChildWebviews[Native Webview & Split Orchestrator]
        PluginSecurity[Exploit Prevention & Sanitizer]
        Vault[RFC 6238 TOTP & Credential Vault]
        DeadlinesDaemon[Deadline Aggregator & OS Notification Daemon]
        OfflineFTS[Offline Slide Vault & SQLite FTS5]
        AutoUpdater[Tauri v2 Plugin Updater]
        Storage[SQLite WAL Database]
    end

    subgraph Portals ["Child Webviews (Hardware Accelerated)"]
        TUWEL[TUWEL Webview]
        TISS[TISS Webview]
        SecondaryPortal[Split / Detached Webview]
    end

    UI --> Store
    Palette --> Store
    Split --> Store
    Store --> Invoke
    Invoke --> ChildWebviews
    Invoke --> PluginSecurity
    Invoke --> Vault
    Invoke --> DeadlinesDaemon
    Invoke --> OfflineFTS
    Invoke --> AutoUpdater
    Invoke --> Storage
    ChildWebviews --> TUWEL
    ChildWebviews --> TISS
    ChildWebviews --> SecondaryPortal
```

---

## 🚀 Quickstart & Development

### Prerequisites
- **Node.js:** v20.x or later (`node -v`)
- **npm:** v10.x or later
- **Rust:** 1.78+ (`rustc --version`)
- **System Dependencies:**
  - **macOS:** Xcode Command Line Tools (`xcode-select --install`)
  - **Linux (Debian/Ubuntu):** `libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev`
  - **Windows:** WebView2 runtime and MSVC C++ Build Tools

### 1. Clone & Install
```bash
git clone https://github.com/tu-cockpit-community/TU-Cockpit.git
cd TU-Cockpit
npm install
```

### 2. Launch Local Development Server
```bash
npm run tauri dev
```
This runs Vite on `localhost:1420` with HMR and launches the native Tauri v2 desktop shell.

### 3. Run Quality Assurance & Tests
```bash
# TypeScript compilation & production web bundle validation
npm run build

# Rust backend unit tests
cd src-tauri
cargo test
```

### 4. Dedicated Multi-Platform Build Commands
TU Cockpit provides granular, cross-platform build commands targeting specific operating systems and packaging formats:

```bash
# macOS Targets
npm run build:mac            # Native .dmg and .app bundle for active host architecture
npm run build:mac:universal  # Universal Apple Silicon (M1-M4) & Intel 64-bit binary

# Windows Targets
npm run build:win:exe        # Standalone NSIS setup .exe (currentUser, no admin prompt needed)
npm run build:win            # Compiles both NSIS .exe and WiX .msi installers

# Linux Targets
npm run build:linux          # Compiles both .deb package and standalone .AppImage
npm run build:linux:deb      # Standalone Debian/Ubuntu package with WebKitGTK 4.1 deps
npm run build:linux:appimage # Standalone AppImage with media framework bundled

# Build All Default Bundles
npm run build:all
```
The compiled installer packages (`.exe`, `.msi`, `.dmg`, `.deb`, `.AppImage`) are output to `src-tauri/target/release/bundle/`.

### 5. 1-Click Cloud Artifact Builder (GitHub Actions)
Need a Windows `.exe` installer or Linux `.deb` while developing on a Mac? You don't need local cross-compilers or VMs.
1. Navigate to the **[Actions tab](https://github.com/tu-cockpit-community/TU-Cockpit/actions)** on GitHub.
2. Select **"1-Click Multi-Platform Artifact Builder"** from the left sidebar.
3. Click **Run workflow**, choose your branch and compilation profile (`release` or `debug`), and click the green button.
4. Parallel cloud runners will compile native binaries on clean Windows, Ubuntu, and macOS environments, attaching downloadable platform bundles (`tu-cockpit-windows-x64.zip`, `tu-cockpit-linux-x64.zip`, `tu-cockpit-macos-universal.zip`) directly to the workflow run summary.

---

## 🛠️ Community Plugin Developer Guide

Community plugins execute in an isolated sandbox iframe and communicate with the host via a secure postMessage bridge.

### 1. Manifest Specification (`manifest.json`)
Every plugin in `tu-cockpit-community` must provide a `manifest.json` at repository root:

```json
{
  "$schema": "https://tu-cockpit-community.github.io/schemas/v1/plugin-manifest.json",
  "id": "tuwien.community.freihaus-timer",
  "name": "Freihaus Menü & Timer",
  "version": "1.0.0",
  "description": "Daily canteen menu preview and lecture break countdown.",
  "author": {
    "name": "TU Student",
    "github": "tu-student",
    "email": "student@student.tuwien.ac.at"
  },
  "entrypoint": "index.html",
  "category": "Campus Life",
  "icon": "Coffee",
  "permissions": {
    "network": [
      "https://*.tuwien.ac.at/*",
      "https://menu.mensen.at/api/*"
    ],
    "storage": "local",
    "clipboard": false
  }
}
```

### 2. Using Host Design Tokens
In your plugin CSS, adopt the adaptive tokens:
```css
body {
  background-color: var(--tu-bg-canvas);
  color: var(--tu-text-primary);
  font-family: var(--tu-font-family, system-ui, sans-serif);
}

.card {
  background: var(--tu-bg-card);
  border: 1px solid var(--tu-border);
  border-radius: var(--tu-radius);
}

.button-primary {
  background: var(--tu-accent);
  color: var(--tu-accent-contrast);
  border-radius: var(--tu-radius-sm);
}
```

### 3. Submitting to the Community Store
1. Develop and test your plugin locally.
2. Ensure no remote scripts are loaded from unapproved external CDNs.
3. Open a verification issue at [github.com/tu-cockpit-community/registry](https://github.com/tu-cockpit-community).
4. Once transferred to `tu-cockpit-community`, your plugin is instantly discoverable by all TU Cockpit desktop users.

---

## 📄 License & Contributing

TU Cockpit is developed by TU Wien students for TU Wien students and is distributed under the **[MIT License](LICENSE)**.

Pull requests, feature suggestions, and bug reports are warmly welcomed. Please check existing issues before submitting new ones.

---

<div align="center">
  <sub>Crafted with ❤️ for students of the Vienna University of Technology (TU Wien). Not officially affiliated with TU Wien administration.</sub>
</div>
