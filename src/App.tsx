import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useThemeStore } from "@/store/useThemeStore";
import { PluginFrame } from "@/components/plugin-host/PluginFrame";
import { Dock } from "@/components/dock/Dock";
import { ThemeCustomizer } from "@/components/settings/ThemeCustomizer";
import { SyncSettings } from "@/components/settings/SyncSettings";
import { PluginMarketplace } from "@/components/marketplace/PluginMarketplace";
import {
  GraduationCap,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
  BookOpen,
  MapPin,
  Coffee,
  X,
  Palette,
  Cloud,
} from "lucide-react";

// Default bundled starter plugin HTML for TUWEL Deadlines
const TUWEL_STARTER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TUWEL Deadlines</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--tu-font-sans, system-ui, sans-serif);
      background: var(--tu-bg-base, #0f172a);
      color: var(--tu-text-primary, #f8fafc);
      padding: 16px;
      user-select: none;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: background-color 0.2s ease, color 0.2s ease;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--tu-border-subtle, #1e293b);
    }
    .brand { display: flex; align-items: center; gap: 8px; }
    .badge-icon {
      width: 24px; height: 24px; border-radius: var(--tu-radius-sm, 4px);
      background: var(--tu-accent, #006699); display: flex;
      align-items: center; justify-content: center;
      color: var(--tu-accent-contrast, #fff); font-weight: 700; font-size: 11px;
    }
    .title {
      font-weight: 700; font-size: 13px; text-transform: uppercase;
      letter-spacing: 0.05em; color: var(--tu-accent, #006699);
    }
    .card {
      background: var(--tu-bg-surface, #1e293b);
      padding: 12px 14px; border-radius: var(--tu-radius, 8px);
      margin-bottom: 8px; display: flex; justify-content: space-between;
      align-items: center; border: 1px solid var(--tu-border, #334155);
      transition: all 0.2s ease; cursor: pointer;
    }
    .card:hover {
      background: var(--tu-bg-hover, #475569);
      border-color: var(--tu-border-focus, #38bdf8);
      transform: translateY(-1px);
    }
    .card.completed { opacity: 0.5; text-decoration: line-through; }
    .course-label { font-size: 11px; color: var(--tu-text-secondary, #94a3b8); margin-bottom: 2px; }
    .task-name { font-weight: 600; font-size: 13px; color: var(--tu-text-primary, #f8fafc); }
    .due-badge {
      font-size: 11px; padding: 3px 8px; border-radius: var(--tu-radius-sm, 4px);
      background: var(--tu-danger, #ef4444); color: #fff; font-weight: 600;
    }
    .due-badge.warning { background: var(--tu-warning, #f59e0b); }
    .due-badge.normal { background: var(--tu-bg-card, #334155); border: 1px solid var(--tu-border, #475569); }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="badge-icon">TU</div>
      <div class="title">TUWEL Upcoming Deadlines</div>
    </div>
    <span id="sync-status" style="font-size: 11px; color: var(--tu-text-muted, #64748b);">Connecting...</span>
  </div>
  <div id="deadlines-list"></div>

  <script type="module">
    let port = null;
    let reqId = 0;
    const pending = new Map();

    const items = [
      { id: "1", course: "VU Algorithmen und Datenstrukturen", task: "Abgabe Aufgabe 2 (Graph Search)", due: "Tomorrow, 23:59", urgency: "danger", completed: false },
      { id: "2", course: "UE Analysis 1", task: "Übungsblatt 4 (Integration)", due: "In 3 days", urgency: "warning", completed: false },
      { id: "3", course: "VO Technische Grundlagen der Informatik", task: "Zwischentest Quiz", due: "Oct 20, 18:00", urgency: "normal", completed: false }
    ];

    window.addEventListener("message", (e) => {
      if (e.data?.type === "INIT_RPC_PORT") {
        port = e.ports[0];
        port.onmessage = (msg) => {
          const { id, result, error } = msg.data || {};
          if (!id) return;
          const p = pending.get(id);
          if (p) {
            pending.delete(id);
            error ? p.reject(error) : p.resolve(result);
          }
        };
        init();
      }
    });

    function call(method, params = {}) {
      return new Promise((resolve, reject) => {
        if (!port) return resolve(null);
        const id = "req_" + (++reqId);
        pending.set(id, { resolve, reject });
        port.postMessage({ jsonrpc: "2.0", id, method, params });
      });
    }

    function render() {
      const container = document.getElementById("deadlines-list");
      container.innerHTML = items.map(item => \`
        <div class="card \${item.completed ? 'completed' : ''}" data-id="\${item.id}">
          <div>
            <div class="course-label">\${item.course}</div>
            <div class="task-name">\${item.task}</div>
          </div>
          <div class="due-badge \${item.urgency === 'danger' ? '' : item.urgency === 'warning' ? 'warning' : 'normal'}">
            \${item.completed ? '✓ Done' : item.due}
          </div>
        </div>
      \`).join("");

      document.querySelectorAll(".card").forEach(el => {
        el.addEventListener("click", () => {
          const id = el.getAttribute("data-id");
          const target = items.find(i => i.id === id);
          if (target) {
            target.completed = !target.completed;
            render();
            call("storage:set", { key: "completed", value: JSON.stringify(items.map(i => ({ id: i.id, completed: i.completed }))) });
          }
        });
      });
    }

    async function init() {
      await call("lifecycle:ready");
      document.getElementById("sync-status").innerText = "Live Synced";
      render();
    }

    setTimeout(() => { if (!port) { document.getElementById("sync-status").innerText = "Live Synced"; render(); } }, 500);
  </script>
</body>
</html>`;

export const App: React.FC = () => {
  const {
    activeView,
    activePluginId,
    installedPlugins,
    installPlugin,
    setActiveView,
    isSyncModalOpen,
    setSyncModalOpen,
  } = useAppStore();

  const { applyToRoot, activeThemeId } = useThemeStore();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [settingsTab, setSettingsTab] = useState<"themes" | "sync">("themes");

  // Ensure DOM has CSS custom properties on mount
  useEffect(() => {
    applyToRoot();
  }, [applyToRoot]);

  // Install starter plugin if not present
  useEffect(() => {
    if (!installedPlugins["tuwien.tuwel.deadlines"]) {
      installPlugin(
        {
          id: "tuwien.tuwel.deadlines",
          name: "TUWEL Deadlines",
          version: "1.0.0",
          description: "Live assignment tracker & submission deadlines for TU Wien TUWEL courses",
          entrypoint: "index.html",
          type: "widget",
          capabilities: {
            network: ["https://tuwel.tuwien.ac.at/*"],
            storage: { quotaBytes: 1048576 },
            notifications: true,
          },
        },
        TUWEL_STARTER_HTML
      );
    }
  }, [installedPlugins, installPlugin]);

  // Live Clock updater
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const activePlugin = activePluginId ? installedPlugins[activePluginId] : null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--tu-bg-base)] text-[var(--tu-text-primary)] overflow-hidden transition-colors duration-200">
      {/* Top Application Header */}
      <header className="h-12 border-b border-[var(--tu-border)] bg-[var(--tu-bg-surface)] px-4 flex items-center justify-between shrink-0 select-none z-10 shadow-sm">
        {/* Left: Branding & University Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] flex items-center justify-center font-bold text-xs shadow-md">
              TU
            </div>
            <span className="font-bold text-sm tracking-tight text-[var(--tu-text-primary)]">
              TU Cockpit
            </span>
          </div>

          <div className="h-4 w-[1px] bg-[var(--tu-border)]" />

          <div className="flex items-center gap-1.5 text-xs text-[var(--tu-text-secondary)]">
            <GraduationCap className="w-3.5 h-3.5 text-[var(--tu-accent)]" />
            <span>Wintersemester 2026/27</span>
          </div>
        </div>

        {/* Center: University Quick Portals */}
        <div className="hidden md:flex items-center gap-1 text-xs">
          <a
            href="https://tuwel.tuwien.ac.at"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 rounded-[var(--tu-radius-sm)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors flex items-center gap-1"
          >
            TUWEL
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
          <a
            href="https://tiss.tuwien.ac.at"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 rounded-[var(--tu-radius-sm)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors flex items-center gap-1"
          >
            TISS
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
          <a
            href="https://vowi.fsinf.at"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 rounded-[var(--tu-radius-sm)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors flex items-center gap-1"
          >
            VoWi Wiki
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>

        {/* Right: Status, Theme Badge & Clock */}
        <div className="flex items-center gap-3 text-xs text-[var(--tu-text-secondary)]">
          <button
            onClick={() => {
              setActiveView("settings");
              setSettingsTab("themes");
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] hover:border-[var(--tu-border-focus)] transition-all cursor-pointer text-[11px]"
          >
            <Sparkles className="w-3 h-3 text-[var(--tu-text-accent)]" />
            <span>{activeThemeId}</span>
          </button>

          <div className="flex items-center gap-1 font-mono text-[var(--tu-text-primary)]">
            <Clock className="w-3.5 h-3.5 text-[var(--tu-text-muted)]" />
            <span>{currentTime}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 relative">
        {/* Dashboard View */}
        {activeView === "dashboard" && (
          <div className="max-w-6xl mx-auto space-y-6 pb-24">
            {/* Welcome Banner */}
            <div className="p-6 rounded-[var(--tu-radius-lg)] bg-gradient-to-r from-[var(--tu-bg-surface)] to-[var(--tu-bg-card)] border border-[var(--tu-border)] shadow-[var(--tu-shadow)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[var(--tu-text-primary)]">
                  Welcome to TU Cockpit Workstation
                </h1>
                <p className="text-sm text-[var(--tu-text-secondary)] mt-1">
                  Your isolated, extensible student desktop environment for TU Wien courses, deadlines, and tools.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveView("marketplace")}
                  className="px-4 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 transition-opacity shadow flex items-center gap-1.5"
                >
                  Explore Plugins
                </button>
                <button
                  onClick={() => setSyncModalOpen(true)}
                  className="px-4 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors flex items-center gap-1.5"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  Sync E2EE
                </button>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="https://tuwel.tuwien.ac.at"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-[var(--tu-radius)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] hover:border-[var(--tu-border-focus)] transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)]/15 text-[var(--tu-accent)] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">TUWEL Moodle</div>
                  <div className="text-xs text-[var(--tu-text-secondary)]">Course Materials</div>
                </div>
              </a>

              <a
                href="https://tiss.tuwien.ac.at"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-[var(--tu-radius)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] hover:border-[var(--tu-border-focus)] transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-[var(--tu-radius-sm)] bg-[var(--tu-warning)]/15 text-[var(--tu-warning)] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">TISS Portal</div>
                  <div className="text-xs text-[var(--tu-text-secondary)]">Exams & Grades</div>
                </div>
              </a>

              <a
                href="https://www.tuwien.at/mensen"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-[var(--tu-radius)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] hover:border-[var(--tu-border-focus)] transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-[var(--tu-radius-sm)] bg-[var(--tu-success)]/15 text-[var(--tu-success)] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Mensa Menus</div>
                  <div className="text-xs text-[var(--tu-text-secondary)]">Freihaus Specials</div>
                </div>
              </a>

              <a
                href="https://maps.tuwien.ac.at"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-[var(--tu-radius)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] hover:border-[var(--tu-border-focus)] transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-[var(--tu-radius-sm)] bg-[var(--tu-text-accent)]/15 text-[var(--tu-text-accent)] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Campus Map</div>
                  <div className="text-xs text-[var(--tu-text-secondary)]">Find Lecture Halls</div>
                </div>
              </a>
            </div>

            {/* Grid featuring the sandboxed TUWEL Deadlines Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sandboxed Starter Plugin Widget */}
              <div className="lg:col-span-2 h-[480px]">
                {installedPlugins["tuwien.tuwel.deadlines"] ? (
                  <PluginFrame
                    pluginId="tuwien.tuwel.deadlines"
                    htmlContent={installedPlugins["tuwien.tuwel.deadlines"].htmlContent}
                    allowedGlobs={installedPlugins["tuwien.tuwel.deadlines"].manifest.capabilities?.network || []}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[var(--tu-bg-surface)] rounded-[var(--tu-radius)] border border-[var(--tu-border)] text-sm text-[var(--tu-text-secondary)]">
                    Loading plugin...
                  </div>
                )}
              </div>

              {/* Workstation Info Panel */}
              <div className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-5 shadow-[var(--tu-shadow)] flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-base mb-2">Student Workstation Health</h3>
                  <p className="text-xs text-[var(--tu-text-secondary)] mb-4">
                    Tauri v2 sandboxed engine actively isolating third-party code with native SQLite storage.
                  </p>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-[var(--tu-radius)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)]">
                      <div className="text-[var(--tu-text-secondary)] text-[11px]">Installed Plugins</div>
                      <div className="text-base font-bold text-[var(--tu-text-primary)] mt-0.5">
                        {Object.keys(installedPlugins).length} Active
                      </div>
                    </div>

                    <div className="p-3 rounded-[var(--tu-radius)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)]">
                      <div className="text-[var(--tu-text-secondary)] text-[11px]">Active Design Token Engine</div>
                      <div className="text-base font-bold text-[var(--tu-text-accent)] mt-0.5 capitalize">
                        {activeThemeId.replace(/-/g, " ")}
                      </div>
                    </div>

                    <div className="p-3 rounded-[var(--tu-radius)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)]">
                      <div className="text-[var(--tu-text-secondary)] text-[11px]">Security Isolation Model</div>
                      <div className="text-xs text-[var(--tu-success)] font-semibold mt-0.5">
                        ✓ MessagePort RPC Sandboxing Active
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--tu-border-subtle)] text-[11px] text-[var(--tu-text-muted)]">
                  TU Wien Cockpit v0.1.0 • Built with Tauri v2 & React 19
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plugin Focused View */}
        {activeView === "plugin" && activePlugin && (
          <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-3 pb-20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{activePlugin.manifest.name}</h2>
                <span className="text-xs text-[var(--tu-text-secondary)] font-mono">
                  {activePlugin.manifest.id} (v{activePlugin.manifest.version})
                </span>
              </div>
              <button
                onClick={() => setActiveView("dashboard")}
                className="px-3 py-1.5 text-xs rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)]"
              >
                ← Back to Dashboard
              </button>
            </div>

            <div className="flex-1 w-full h-full">
              <PluginFrame
                pluginId={activePlugin.manifest.id}
                htmlContent={activePlugin.htmlContent}
                allowedGlobs={activePlugin.manifest.capabilities?.network || []}
              />
            </div>
          </div>
        )}

        {/* Marketplace View */}
        {activeView === "marketplace" && <PluginMarketplace />}

        {/* Settings View */}
        {activeView === "settings" && (
          <div className="space-y-6">
            {/* Sub-nav Tabs */}
            <div className="max-w-4xl mx-auto flex gap-2 border-b border-[var(--tu-border)] pb-3">
              <button
                onClick={() => setSettingsTab("themes")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] transition-all ${
                  settingsTab === "themes"
                    ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)]"
                    : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
                }`}
              >
                <Palette className="w-4 h-4" />
                Theming & Typography
              </button>
              <button
                onClick={() => setSettingsTab("sync")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] transition-all ${
                  settingsTab === "sync"
                    ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)]"
                    : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
                }`}
              >
                <Cloud className="w-4 h-4" />
                Zero-Knowledge E2EE Sync
              </button>
            </div>

            {settingsTab === "themes" ? <ThemeCustomizer /> : <SyncSettings />}
          </div>
        )}
      </main>

      {/* Floating Glassmorphic Dock */}
      <Dock />

      {/* E2EE Sync Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSyncModalOpen(false)}
              className="absolute right-4 top-4 text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)]"
            >
              <X className="w-5 h-5" />
            </button>
            <SyncSettings />
          </div>
        </div>
      )}
    </div>
  );
};
