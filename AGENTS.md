# TU Cockpit: AI Agent Swarm Operating Protocol

> **Runtime Environment:** Gemini 3.8 Flash (High Reasoning)  
> **Scope:** Multi-Agent Collaboration Protocol for Planning, Working, Explaining, and Advisory Agents  
> **Repository:** [`tu-cockpit-community/TU-Cockpit`](https://github.com/tu-cockpit-community/TU-Cockpit)

---

## 1. Documentation Map & Separation of Concerns

To prevent context window bloat, cognitive drift, and tool edit failures, all AI agents must strictly observe the following document boundaries:

```
├── AGENTS.md                   <-- READ FIRST: Swarm rules, verification commands, agent roles
├── PROJECT_MAP.md              <-- FAST LOOKUP: "Where is X?" - File & symbol index for AI agents
├── ARCHITECTURE.md             <-- LIVING SPECIFICATIONS: Ground truth for IPC, CSS tokens, Webviews, Security
├── PLAN.md                     <-- ACTIVE SPRINT ONLY: Phase 17 tasks and milestones (< 600 lines)
├── README.md                   <-- USER DOCUMENTATION: End-user feature showcase and setup guide
└── docs/
    └── archive/
        ├── PHASES_1_TO_6.md    <-- COLD STORAGE: Completed milestones 0–33 (do NOT read unless auditing history)
        ├── PHASE_7.md          <-- COLD STORAGE: Completed milestones 34–37 (Phase 7)
        ├── PHASE_8.md          <-- COLD STORAGE: Completed milestones 38–41 (Phase 8)
        ├── PHASE_9.md          <-- COLD STORAGE: Completed milestone 42 (Phase 9)
        ├── PHASE_10.md         <-- COLD STORAGE: Completed milestone 43 (Phase 10)
        ├── PHASE_11.md         <-- COLD STORAGE: Completed milestones 44–46 (Phase 11)
        ├── PHASE_12.md         <-- COLD STORAGE: Completed milestones 47–49 (Phase 12)
        ├── PHASE_13.md         <-- COLD STORAGE: Completed milestones 50–52 (Phase 13)
        ├── PHASE_14.md         <-- COLD STORAGE: Completed milestones 53–55 (Phase 14)
        ├── PHASE_15.md         <-- COLD STORAGE: Completed milestones 56–58 (Phase 15)
        ├── PHASE_16.md         <-- COLD STORAGE: Completed milestones 59–64 (Phase 16)
        └── PHASE_17.md         <-- COLD STORAGE: Completed milestones 65–66 (Phase 17)
```

---

## 2. Agent Personas & Protocols

### 🧠 2.1 The Planning Agent
* **Primary Responsibility:** Break down high-level project goals into architectural specifications and turnkey milestone prompts.
* **Input Files:** [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md), user requirements, and active [PLAN.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/PLAN.md).
* **Core Mandates:**
  - **Maintain File Leanliness:** Never allow `PLAN.md` to exceed 800 lines.
  - **Archive Completed Work:** When a phase is completed, move its milestones and prompts into `docs/archive/` and write the new active phase into `PLAN.md`.
  - **Update Ground Truth:** When system behavior changes, update `ARCHITECTURE.md` to reflect the new truth so working agents are never misinformed.

### 🛠️ 2.2 The Working Agent
* **Primary Responsibility:** Implement code, resolve bugs, verify builds, and commit changes.
* **Input Files:** The single active Milestone prompt from [PLAN.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/PLAN.md) + relevant technical sections from [ARCHITECTURE.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/ARCHITECTURE.md).
* **Core Mandates:**
  - **Do NOT Read the Archive:** Never waste context tokens reading `docs/archive/` or past completed phases.
  - **Mandatory Verification:** Before declaring any milestone complete, run:
    1. Frontend build: `npm run build`
    2. Backend Rust check: `cargo check --manifest-path src-tauri/Cargo.toml`
  - **Status Updates:** Update the milestone status in `PLAN.md` from `[STATUS: READY FOR EXECUTION 🟡]` to `[STATUS: COMPLETED ✅ - Commit <hash>]`.
  - **Follow Git Hygiene:** Commit using standard conventional commit formatting specified in the milestone prompt.

### 🗣️ 2.3 The Explaining Agent
* **Primary Responsibility:** Communicate with the human user, explain project progress, and demonstrate usage.
* **Input Files:** [README.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/README.md), active sprint status in [PLAN.md](file:///Users/mac-chan/Documents/antigravity/Tuwel-Tools/PLAN.md), and recent `git log`.
* **Core Mandates:**
  - Provide concise, human-friendly summaries without drowning the user in internal agent prompt templates.
  - Explain *what* was built, *why* it works, and *how* to test it.

### 🔍 2.4 The Advisory / Audit Agent
* **Primary Responsibility:** Review architectural consistency, prevent regression, audit security boundaries, and propose structural improvements.
* **Input Files:** Entire active workspace, `ARCHITECTURE.md`, `git status`, and `git diff`.
* **Core Mandates:**
  - Ensure strict marketplace-only policy is not bypassed.
  - Flag any dead code, conflicting specifications, or documentation bloat.

---

## 3. Standard Verification Runbook

Every worker agent MUST run and verify the following commands before completing any milestone:

```bash
# 1. Frontend TypeScript & React Build Verification:
npm run build

# 2. Rust Backend & Tauri Capability Verification:
cargo check --manifest-path src-tauri/Cargo.toml
# Note (macOS): If cargo check encounters linker errors with beta SDKs, prefix with:
# SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk cargo check --manifest-path src-tauri/Cargo.toml

# 3. Optional: Local Dev Server (Background Daemon):
npm run tauri dev
```

---

## 4. Git Hygiene & Commit Standards

All commits must use the Conventional Commits format with clean, descriptive scopes:
* `feat(portals): ...` — New portal integrations or webview capabilities
* `feat(marketplace): ...` — Community store, plugin discovery, or catalog features
* `fix(plugins): ...` — Bug fixes in plugin runtime or manifest parsing
* `refactor(header): ...` — UI streamlining or component restructuring
* `docs(plan): ...` — Roadmap or planning documentation updates
* `chore(deps): ...` — Dependency upgrades or config adjustments
