import React, { useState } from "react";
import { useAppStore, PluginManifest } from "@/store/useAppStore";
import {
  COMMUNITY_CALENDAR_HTML,
  COMMUNITY_SLIDE_VAULT_HTML,
  COMMUNITY_MENSA_HTML,
  COMMUNITY_ROOM_RADAR_HTML,
} from "@/services/marketplace/CommunityPluginBundles";
import {
  Code2,
  FolderGit2,
  ShieldCheck,
  Play,
  RefreshCw,
  Copy,
  Check,
  Terminal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode,
  FileJson,
  Package,
  Lock,
  Trash2,
} from "lucide-react";

interface LocalWorkspace {
  folder: string;
  manifest: PluginManifest;
  htmlContent: string;
  category: string;
}

const LOCAL_WORKSPACES: LocalWorkspace[] = [
  {
    folder: "community-plugins/tu-calendar",
    category: "Academic",
    manifest: {
      id: "tuwien.community.calendar",
      name: "TU Calendar & Tasks",
      version: "1.0.0",
      description:
        "Interactive academic timetable, TUWEL deadlines calendar, and Google Tasks-style assignment checklist for TU Wien students.",
      entrypoint: "index.html",
      homepage: "https://github.com/tu-cockpit-community/tu-calendar",
      capabilities: {
        network: ["https://tuwel.tuwien.ac.at/*", "https://tiss.tuwien.ac.at/*"],
        storage: { quotaBytes: 52428800 },
        notifications: true,
      },
    },
    htmlContent: COMMUNITY_CALENDAR_HTML,
  },
  {
    folder: "community-plugins/tu-slide-vault",
    category: "Academic",
    manifest: {
      id: "tuwien.community.slide-vault",
      name: "TU Slide Vault",
      version: "1.0.0",
      description:
        "Offline lecture slide cache, instant full-text search across course PDF materials, and dark-mode slide viewer.",
      entrypoint: "index.html",
      homepage: "https://github.com/tu-cockpit-community/tu-slide-vault",
      capabilities: {
        network: ["https://tuwel.tuwien.ac.at/*", "https://vowi.fsinf.at/*"],
        storage: { quotaBytes: 104857600 },
        notifications: true,
      },
    },
    htmlContent: COMMUNITY_SLIDE_VAULT_HTML,
  },
  {
    folder: "community-plugins/tu-mensa",
    category: "Campus Life",
    manifest: {
      id: "tuwien.community.mensa",
      name: "TU Mensa Radar",
      version: "1.0.0",
      description:
        "Daily cafeteria menus, student meal prices, allergen filters, and opening hours for TU Wien campus mensas.",
      entrypoint: "index.html",
      homepage: "https://github.com/tu-cockpit-community/tu-mensa",
      capabilities: {
        network: ["https://www.mensen.at/*", "https://menu.mensen.at/*"],
        storage: { quotaBytes: 10485760 },
        notifications: false,
      },
    },
    htmlContent: COMMUNITY_MENSA_HTML,
  },
  {
    folder: "community-plugins/tu-room-radar",
    category: "Campus Life",
    manifest: {
      id: "tuwien.community.room-radar",
      name: "TU Room & Study Radar",
      version: "1.0.0",
      description:
        "Find free lecture halls, quiet study spots, and navigate campus rooms across Freihaus, Karlsplatz, and Gußhaus.",
      entrypoint: "index.html",
      homepage: "https://github.com/tu-cockpit-community/tu-room-radar",
      capabilities: {
        network: ["https://maps.tuwien.ac.at/*", "https://tiss.tuwien.ac.at/*"],
        storage: { quotaBytes: 10485760 },
      },
    },
    htmlContent: COMMUNITY_ROOM_RADAR_HTML,
  },
];

const DEFAULT_MANIFEST_SNIPPET = `{
  "$schema": "https://raw.githubusercontent.com/tu-cockpit-community/TU-Cockpit/main/schemas/plugin-manifest.v1.json",
  "id": "tuwien.community.my-plugin",
  "name": "My Campus Plugin",
  "version": "1.0.0",
  "description": "A lightweight standalone tool for TU Wien students.",
  "category": "Tools",
  "entrypoint": "index.html",
  "author": {
    "name": "Your Name",
    "github": "your-username"
  },
  "capabilities": {
    "network": [
      "https://tiss.tuwien.ac.at/*"
    ],
    "storage": {
      "quotaBytes": 10485760
    },
    "notifications": true
  }
}`;

export const DevStudioTab: React.FC = () => {
  const { installedPlugins, installPlugin, uninstallPlugin, setActiveView } = useAppStore();

  const [activeSection, setActiveSection] = useState<"workspaces" | "validator" | "standards">(
    "workspaces"
  );
  const [copiedFolder, setCopiedFolder] = useState<string | null>(null);
  const [manifestText, setManifestText] = useState<string>(DEFAULT_MANIFEST_SNIPPET);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);

  const handleCopyFolder = (folder: string) => {
    navigator.clipboard.writeText(folder);
    setCopiedFolder(folder);
    setTimeout(() => setCopiedFolder(null), 2000);
  };

  const handleCopySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleStageAndTest = (workspace: LocalWorkspace) => {
    // Register as local development plugin
    installPlugin(workspace.manifest, workspace.htmlContent, "local", workspace.folder);
    setActiveView("plugin", workspace.manifest.id);
  };

  // Live Manifest Validation
  const validateManifest = (jsonStr: string) => {
    const issues: { type: "error" | "warn" | "pass"; message: string }[] = [];
    try {
      const parsed = JSON.parse(jsonStr);

      // Check ID
      if (!parsed.id) {
        issues.push({ type: "error", message: "Missing required property 'id'." });
      } else if (!/^[a-z0-9]+(\.[a-z0-9_-]+)+$/i.test(parsed.id)) {
        issues.push({
          type: "warn",
          message:
            "ID should follow reverse-DNS convention (e.g., 'tuwien.community.plugin-name' or 'at.ac.tuwien.plugin-name').",
        });
      } else {
        issues.push({ type: "pass", message: `Valid reverse-DNS plugin ID: "${parsed.id}"` });
      }

      // Check Name
      if (!parsed.name || typeof parsed.name !== "string" || parsed.name.trim().length < 3) {
        issues.push({ type: "error", message: "Name must be a string of at least 3 characters." });
      } else {
        issues.push({ type: "pass", message: `Plugin title: "${parsed.name}"` });
      }

      // Check Version
      if (!parsed.version || !/^\d+\.\d+\.\d+(-[a-z0-9.-]+)?$/i.test(parsed.version)) {
        issues.push({ type: "error", message: "Version must follow Semantic Versioning (e.g. 1.0.0)." });
      } else {
        issues.push({ type: "pass", message: `Valid semver version: v${parsed.version}` });
      }

      // Check Entrypoint
      if (parsed.entrypoint !== "index.html") {
        issues.push({
          type: "error",
          message: "Entrypoint must be set to 'index.html' for single-file bundled plugins.",
        });
      } else {
        issues.push({ type: "pass", message: "Entrypoint configured to 'index.html'" });
      }

      // Check Capabilities
      if (parsed.capabilities?.network) {
        if (!Array.isArray(parsed.capabilities.network)) {
          issues.push({ type: "error", message: "capabilities.network must be an array of URL globs." });
        } else {
          const hasInvalid = parsed.capabilities.network.some(
            (url: string) => !url.startsWith("https://")
          );
          if (hasInvalid) {
            issues.push({
              type: "warn",
              message: "Network capabilities should strictly use HTTPS endpoints (e.g. https://domain.at/*).",
            });
          } else {
            issues.push({
              type: "pass",
              message: `Network permissions: ${parsed.capabilities.network.length} endpoint(s) declared.`,
            });
          }
        }
      }

      return { valid: issues.filter((i) => i.type === "error").length === 0, issues };
    } catch (e: any) {
      return {
        valid: false,
        issues: [{ type: "error" as const, message: `JSON Syntax Error: ${e.message}` }],
      };
    }
  };

  const validationResult = validateManifest(manifestText);

  return (
    <div className="space-y-6">
      {/* DevStudio Banner */}
      <div className="p-5 rounded-[var(--tu-radius)] bg-gradient-to-r from-amber-500/10 via-[var(--tu-bg-surface)] to-[var(--tu-bg-card)] border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[var(--tu-radius-sm)] bg-amber-500/20 text-amber-400">
              <Code2 className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-[var(--tu-text-primary)]">
              DevStudio & Local Plugin Sandbox
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Protected Dev Mode 🔒
            </span>
          </div>
          <p className="text-xs text-[var(--tu-text-secondary)] max-w-2xl leading-relaxed">
            Stage, test, and preview community plugins directly from your local filesystem repositories.
            Local workspaces are strictly protected: unlinking from the cockpit view will never delete your source code.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-center">
            <div className="text-xs font-bold text-amber-400 font-mono">
              {LOCAL_WORKSPACES.length} Workspaces
            </div>
            <div className="text-[10px] text-[var(--tu-text-muted)]">community-plugins/*</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-[var(--tu-border)] gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveSection("workspaces")}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeSection === "workspaces"
              ? "border-[var(--tu-accent)] text-[var(--tu-text-primary)]"
              : "border-transparent text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)]"
          }`}
        >
          <FolderGit2 className="w-4 h-4 text-amber-400" />
          <span>Active Local Workspaces ({LOCAL_WORKSPACES.length})</span>
        </button>

        <button
          onClick={() => setActiveSection("validator")}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeSection === "validator"
              ? "border-[var(--tu-accent)] text-[var(--tu-text-primary)]"
              : "border-transparent text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)]"
          }`}
        >
          <FileJson className="w-4 h-4 text-sky-400" />
          <span>Manifest Validator & Scaffolding</span>
        </button>

        <button
          onClick={() => setActiveSection("standards")}
          className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            activeSection === "standards"
              ? "border-[var(--tu-accent)] text-[var(--tu-text-primary)]"
              : "border-transparent text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)]"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>SDK Standards & Pre-Release Checklist</span>
        </button>
      </div>

      {/* SECTION 1: Local Workspaces */}
      {activeSection === "workspaces" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[var(--tu-text-muted)]">
            <span>
              Detected repositories inside <code className="font-mono text-amber-300">community-plugins/</code>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Protected from filesystem deletion
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LOCAL_WORKSPACES.map((ws) => {
              const installed = installedPlugins[ws.manifest.id];
              const isStaged = Boolean(installed);
              const isLocalSource = installed?.sourceType === "local" || installed?.sourceType === "local_dev";

              return (
                <div
                  key={ws.manifest.id}
                  className="rounded-[var(--tu-radius)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] p-4 flex flex-col justify-between gap-3 hover:border-[var(--tu-border-subtle)] transition-all relative overflow-hidden group shadow-sm"
                >
                  <div className="space-y-2">
                    {/* Header Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[var(--tu-text-primary)]">
                            {ws.manifest.name}
                          </h4>
                          <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[var(--tu-bg-card)] border border-[var(--tu-border)] text-[var(--tu-text-muted)]">
                            v{ws.manifest.version}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-[var(--tu-text-muted)] truncate mt-0.5">
                          {ws.manifest.id}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <span>🛠️</span> Dev Workspace
                        </span>
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Protected
                        </span>
                        {isStaged && isLocalSource && (
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30">
                            Staged in Cockpit
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[var(--tu-text-secondary)] line-clamp-2">
                      {ws.manifest.description}
                    </p>

                    {/* Folder Path & Build Status */}
                    <div className="pt-2 border-t border-[var(--tu-border)] space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[var(--tu-text-muted)]">Path:</span>
                        <div className="flex items-center gap-1 font-mono text-[var(--tu-text-primary)]">
                          <span className="truncate max-w-[200px]" title={ws.folder}>
                            {ws.folder}
                          </span>
                          <button
                            onClick={() => handleCopyFolder(ws.folder)}
                            className="p-1 rounded hover:bg-[var(--tu-bg-card)] text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] transition-colors cursor-pointer"
                            title="Copy path"
                          >
                            {copiedFolder === ws.folder ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[var(--tu-text-muted)]">Build Status:</span>
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Single-File Bundle Compiled
                        </span>
                      </div>

                      {ws.manifest.capabilities?.network && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[var(--tu-text-muted)]">Network:</span>
                          <span className="font-mono text-[10px] text-[var(--tu-text-secondary)] truncate max-w-[200px]">
                            {ws.manifest.capabilities.network.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-[var(--tu-border)] flex items-center gap-2">
                    <button
                      onClick={() => handleStageAndTest(ws)}
                      className="flex-1 py-1.5 px-3 rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 font-semibold text-xs transition-opacity flex items-center justify-center gap-1.5 shadow cursor-pointer"
                    >
                      {isStaged ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          Reload in Cockpit
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Test in Cockpit
                        </>
                      )}
                    </button>

                    {isStaged && (
                      <>
                        <button
                          onClick={() => setActiveView("plugin", ws.manifest.id)}
                          className="py-1.5 px-3 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-primary)] font-semibold text-xs transition-colors cursor-pointer"
                          title="Open active view"
                        >
                          Launch
                        </button>

                        <button
                          onClick={() => uninstallPlugin(ws.manifest.id)}
                          className="p-1.5 rounded-[var(--tu-radius-sm)] border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                          title="Unlink from Cockpit view (Local files will be preserved on disk)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: Manifest Validator & Scaffolding */}
      {activeSection === "validator" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* JSON Input Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--tu-text-primary)] flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-sky-400" />
                  <span>plugin-manifest.json Editor</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setManifestText(DEFAULT_MANIFEST_SNIPPET)}
                    className="text-[11px] text-[var(--tu-accent)] hover:underline cursor-pointer"
                  >
                    Reset Template
                  </button>
                  <button
                    onClick={() => handleCopySnippet(manifestText)}
                    className="p-1 rounded bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-secondary)] cursor-pointer"
                    title="Copy manifest JSON"
                  >
                    {copiedSnippet ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              <textarea
                value={manifestText}
                onChange={(e) => setManifestText(e.target.value)}
                rows={16}
                className="w-full font-mono text-xs p-3 rounded-[var(--tu-radius)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-accent)] leading-relaxed resize-none selection:bg-amber-500/30"
                spellCheck={false}
              />
            </div>

            {/* Live Schema Linting Output */}
            <div className="space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[var(--tu-text-primary)] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Real-time Manifest Linter</span>
                  </h4>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      validationResult.valid
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {validationResult.valid ? "VALID MANIFEST" : "SCHEMA ERRORS DETECTED"}
                  </span>
                </div>

                <div className="rounded-[var(--tu-radius)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] p-3 space-y-2 max-h-[300px] overflow-y-auto">
                  {validationResult.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`text-xs flex items-start gap-2 p-2 rounded-[var(--tu-radius-sm)] ${
                        issue.type === "pass"
                          ? "bg-emerald-500/5 text-emerald-400"
                          : issue.type === "warn"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      {issue.type === "pass" && <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                      {issue.type === "warn" && (
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      )}
                      {issue.type === "error" && (
                        <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      )}
                      <span className="leading-snug">{issue.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scaffolding Quickstart */}
              <div className="p-3 rounded-[var(--tu-radius)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--tu-text-primary)]">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Scaffold New Single-File Plugin in 60s</span>
                </div>
                <div className="font-mono text-[11px] bg-black/40 p-2.5 rounded border border-[var(--tu-border)] text-emerald-400 select-all overflow-x-auto space-y-1">
                  <div>npm create vite@latest my-plugin -- --template react-ts</div>
                  <div>cd my-plugin && npm i -D vite-plugin-singlefile tailwindcss @tailwindcss/vite</div>
                  <div>npm run build  # outputs dist/index.html</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SDK Standards & Pre-Release Checklist */}
      {activeSection === "standards" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pre-Release Checklist */}
            <div className="rounded-[var(--tu-radius)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] p-4 space-y-3">
              <h4 className="text-xs font-bold text-[var(--tu-text-primary)] flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Pre-Release Staging Checklist</span>
              </h4>
              <div className="space-y-2 text-xs text-[var(--tu-text-secondary)]">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold font-mono">1.</span>
                  <div>
                    <strong className="text-[var(--tu-text-primary)]">Zero-Mock Invariant:</strong>
                    <p className="text-[11px] text-[var(--tu-text-muted)]">
                      Eradicate all fake placeholder cards. Use authentic live data feeds or clean empty states.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold font-mono">2.</span>
                  <div>
                    <strong className="text-[var(--tu-text-primary)]">Single-File Bundling:</strong>
                    <p className="text-[11px] text-[var(--tu-text-muted)]">
                      Compile via <code>vite-plugin-singlefile</code> so CSS and JavaScript are inlined into a single self-contained <code>index.html</code>.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold font-mono">3.</span>
                  <div>
                    <strong className="text-[var(--tu-text-primary)]">Sandboxed CSS Baseline:</strong>
                    <p className="text-[11px] text-[var(--tu-text-muted)]">
                      Include reset styles (<code>box-sizing: border-box</code>) and map utility colors to <code>--tu-*</code> CSS variables.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold font-mono">4.</span>
                  <div>
                    <strong className="text-[var(--tu-text-primary)]">Git Tagging & Release Archive:</strong>
                    <p className="text-[11px] text-[var(--tu-text-muted)]">
                      Tag release matching <code>manifest.json</code> (e.g. <code>git tag v1.0.0</code>) and attach <code>plugin.zip</code> to the GitHub Release.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sandboxing & Security Rules */}
            <div className="rounded-[var(--tu-radius)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] p-4 space-y-3">
              <h4 className="text-xs font-bold text-[var(--tu-text-primary)] flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Zero-Trust Sandbox Constraints</span>
              </h4>
              <div className="space-y-2 text-xs text-[var(--tu-text-secondary)]">
                <div className="p-2.5 rounded bg-[var(--tu-bg-card)] border border-[var(--tu-border)]">
                  <strong className="text-rose-400">Strictly Forbidden:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-[var(--tu-text-muted)]">
                    <li>Unrestricted wildcard network access (<code>*://*</code>)</li>
                    <li>Dynamic remote script loading via <code>eval()</code></li>
                    <li>Unsigned native binary execution</li>
                  </ul>
                </div>
                <div className="p-2.5 rounded bg-[var(--tu-bg-card)] border border-[var(--tu-border)]">
                  <strong className="text-emerald-400">Supported Technologies:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-[var(--tu-text-muted)]">
                    <li>React 19, Vue 3, Svelte 5, Solid, or Vanilla JS</li>
                    <li>Tailwind CSS v3 / v4 with singlefile bundling</li>
                    <li>Tauri IPC message bridge for storage & filesystem</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
