import React, { useState } from "react";
import { useAppStore, PluginManifest } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useDeveloperStore, PluginSubmission } from "@/store/useDeveloperStore";
import { DeveloperRegistration } from "./DeveloperRegistration";
import { PublishPluginModal } from "./PublishPluginModal";
import {
  Code,
  CheckCircle2,
  FileCode,
  ExternalLink,
  Github,
  Play,
  Shield,
  Upload,
  Layers,
  Clock,
  Check,
  GitPullRequest,
  Globe,
  HardDrive,
} from "lucide-react";

export const DeveloperPortal: React.FC = () => {
  const { installPlugin, setActiveView } = useAppStore();
  const { currentUser } = useAuthStore();
  const { submissions, setPublishModalOpen } = useDeveloperStore();

  const isDeveloper =
    currentUser?.role === "developer" || currentUser?.role === "reviewer";

  // Template Samples for Fast Unpacked Sideloading
  const SAMPLE_TEMPLATES: Record<
    string,
    { name: string; manifest: string; html: string }
  > = {
    minimal: {
      name: "Clean Slate Minimalist Tool",
      manifest: JSON.stringify(
        {
          id: "at.ac.tuwien.student.dev-minimal",
          name: "Clean Slate Sandbox Tool",
          version: "0.1.0",
          description: "Unpacked local plugin loaded for developer testing and iteration.",
          entrypoint: "index.html",
          capabilities: {
            network: ["https://tuwel.tuwien.ac.at/*"],
            storage: { quotaBytes: 1048576 },
            notifications: true,
          },
        },
        null,
        2
      ),
      html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: var(--tu-font-sans, system-ui);
      background: var(--tu-bg-base, #121212);
      color: var(--tu-text-primary, #ffffff);
      padding: 20px;
      margin: 0;
    }
    .card {
      background: var(--tu-bg-surface, #1e1e1e);
      border: 1px solid var(--tu-border, #333);
      border-radius: var(--tu-radius-lg, 12px);
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      background: var(--tu-accent, #006699);
      color: var(--tu-accent-contrast, #ffffff);
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
    }
    button {
      margin-top: 16px;
      background: var(--tu-accent, #006699);
      color: var(--tu-accent-contrast, #fff);
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Unpacked Local Dev</span>
    <h2 style="margin: 12px 0 4px 0;">TU Cockpit Local Sandboxed RPC</h2>
    <p style="font-size: 13px; color: var(--tu-text-secondary, #aaa); line-height: 1.5;">
      This plugin runs securely in an isolated MessagePort container with bounded network capabilities.
    </p>
    <button onclick="pingHost()">Send RPC Ping to Shell</button>
    <div id="output" style="margin-top: 12px; font-family: monospace; font-size: 11px; color: var(--tu-text-accent, #66b2ff);"></div>
  </div>
  <script>
    function pingHost() {
      document.getElementById('output').innerText = 'RPC ping dispatched to shell at ' + new Date().toLocaleTimeString();
    }
  </script>
</body>
</html>`,
    },
    tissMonitor: {
      name: "TISS Exam Dates Watcher",
      manifest: JSON.stringify(
        {
          id: "at.ac.tuwien.student.tiss-watcher",
          name: "TISS Exam Dates Watcher",
          version: "0.2.0",
          description: "Real-time registration countdown for upcoming TU Wien written exam seats.",
          entrypoint: "index.html",
          capabilities: {
            network: ["https://tiss.tuwien.ac.at/*"],
            storage: { quotaBytes: 2097152 },
            notifications: true,
          },
        },
        null,
        2
      ),
      html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: var(--tu-font-sans, system-ui);
      background: var(--tu-bg-base, #121212);
      color: var(--tu-text-primary, #ffffff);
      padding: 18px;
    }
    .header { display: flex; justify-content: space-between; align-items: center; }
    .exam-item {
      background: var(--tu-bg-card, #262626);
      border: 1px solid var(--tu-border, #333);
      padding: 12px;
      border-radius: 8px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h3 style="margin: 0;">TISS Exam Watcher</h3>
    <span style="font-size: 11px; color: var(--tu-text-accent, #66b2ff);">Enrolled: 3 Exams</span>
  </div>
  <div class="exam-item">
    <strong>Algorithmen und Datenstrukturen 1</strong>
    <div style="font-size: 12px; color: var(--tu-text-secondary, #aaa); margin-top: 4px;">
      Exam Date: 2026-11-14 • Freihaus Hörsaal 1
    </div>
  </div>
</body>
</html>`,
    },
  };

  const [devManifestJson, setDevManifestJson] = useState<string>(
    SAMPLE_TEMPLATES.minimal.manifest
  );
  const [devHtmlContent, setDevHtmlContent] = useState<string>(
    SAMPLE_TEMPLATES.minimal.html
  );
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleApplyTemplate = (key: string) => {
    const tmpl = SAMPLE_TEMPLATES[key];
    if (tmpl) {
      setDevManifestJson(tmpl.manifest);
      setDevHtmlContent(tmpl.html);
      setStatusMsg(`Loaded template: "${tmpl.name}"`);
    }
  };

  const handleSideload = () => {
    try {
      const manifest: PluginManifest = JSON.parse(devManifestJson);
      if (!manifest.id || !manifest.name) {
        throw new Error("Manifest must include 'id' and 'name'");
      }

      installPlugin(manifest, devHtmlContent, "local_dev");
      setStatusMsg(`Successfully sideloaded "${manifest.name}"! Launching sandbox...`);
      setTimeout(() => {
        setActiveView("plugin", manifest.id);
      }, 500);
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
  };

  // If user is not yet a developer, show registration flow
  if (!isDeveloper) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-24 text-[var(--tu-text-primary)] animate-in fade-in duration-200">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--tu-text-primary)]">
            TU Cockpit Developer Center
          </h2>
          <p className="text-xs text-[var(--tu-text-secondary)] max-w-md mx-auto">
            You are currently signed in as a <span className="font-semibold capitalize text-[var(--tu-text-primary)]">{currentUser?.role || "Guest"}</span>.
            Register as a student developer to unlock local plugin sideloading and community publishing rights.
          </p>
        </div>

        <DeveloperRegistration />
      </div>
    );
  }

  const getStatusBadge = (status: PluginSubmission["status"]) => {
    switch (status) {
      case "Approved":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" />
            Approved & In Store
          </span>
        );
      case "In Review":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            In Review (Audit)
          </span>
        );
      case "Submitted":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-semibold flex items-center gap-1">
            <GitPullRequest className="w-3 h-3" />
            Submitted (CI Queued)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-neutral-500/15 text-neutral-400 border border-neutral-500/30 text-[10px] font-semibold">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-28 text-[var(--tu-text-primary)] animate-in fade-in duration-200">
      {/* Developer Identity Hub Banner */}
      <div className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-6 shadow-[var(--tu-shadow)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)]/15 border border-[var(--tu-accent)]/30 text-[var(--tu-accent)] flex items-center justify-center shrink-0">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-[var(--tu-text-primary)]">
                {currentUser.displayName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)]/15 text-[var(--tu-accent)] border border-[var(--tu-accent)]/30 text-xs font-semibold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                Verified Student Developer
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--tu-text-secondary)] mt-1.5 font-mono">
              <span className="flex items-center gap-1 text-[var(--tu-text-primary)]">
                <Github className="w-3.5 h-3.5 text-[var(--tu-text-muted)]" />
                @{currentUser.githubUsername || "tuwien-student"}
              </span>
              <span>•</span>
              <span>Matr: {currentUser.matriculationNumber}</span>
              <span>•</span>
              <span>{submissions.length} Active Submissions</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setPublishModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 transition-opacity flex items-center gap-2 shadow cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            + Submit Plugin to Community Store
          </button>
        </div>
      </div>

      {/* Section 1: Active Projects & Submissions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--tu-text-primary)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--tu-text-accent)]" />
              Active Projects & Community Store Submissions
            </h3>
            <p className="text-xs text-[var(--tu-text-secondary)]">
              Track real-time status of your GitHub releases and community pull requests
            </p>
          </div>

          <span className="text-xs font-mono text-[var(--tu-text-muted)]">
            Total Submissions: {submissions.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-5 shadow-[var(--tu-shadow)] flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-[var(--tu-text-primary)]">
                      {sub.name}
                    </h4>
                    <span className="text-xs font-mono text-[var(--tu-text-secondary)] block">
                      {sub.id} (v{sub.version})
                    </span>
                  </div>
                  {getStatusBadge(sub.status)}
                </div>

                <p className="text-xs text-[var(--tu-text-secondary)] leading-relaxed">
                  {sub.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sub.categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 rounded text-[10px] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] text-[var(--tu-text-secondary)] uppercase tracking-wider font-semibold"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Capabilities & PR Link */}
              <div className="pt-3 border-t border-[var(--tu-border-subtle)] space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--tu-text-secondary)]">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Globe className="w-3 h-3 text-[var(--tu-text-muted)]" />
                    {Object.keys(sub.networkJustifications).length} Endpoints
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <HardDrive className="w-3 h-3 text-[var(--tu-text-muted)]" />
                    {(sub.storageQuotaBytes / 1024 / 1024).toFixed(1)} MB Storage
                  </span>
                  {sub.prUrl && (
                    <a
                      href={sub.prUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] text-[var(--tu-text-accent)] hover:underline font-mono"
                    >
                      <GitPullRequest className="w-3 h-3" />
                      PR #{sub.prNumber}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>

                {sub.reviewNotes && (
                  <div className="p-2 rounded bg-[var(--tu-bg-base)] border border-[var(--tu-border)] text-[11px] text-[var(--tu-text-secondary)] italic">
                    Note: {sub.reviewNotes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Local Sideloading Tool & Sandboxed RPC Workbench */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-[var(--tu-text-primary)] flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[var(--tu-text-accent)]" />
              Local Sideloading Tool & RPC Sandbox Workbench
            </h3>
            <p className="text-xs text-[var(--tu-text-secondary)]">
              Simulate an unpacked plugin folder on disk, inspect permissions, and test inside the sandboxed container
            </p>
          </div>

          {/* Quick Template Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--tu-text-muted)]">Templates:</span>
            <button
              onClick={() => handleApplyTemplate("minimal")}
              className="px-2.5 py-1 text-xs rounded bg-[var(--tu-bg-card)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] transition-colors cursor-pointer"
            >
              Minimalist
            </button>
            <button
              onClick={() => handleApplyTemplate("tissMonitor")}
              className="px-2.5 py-1 text-xs rounded bg-[var(--tu-bg-card)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] transition-colors cursor-pointer"
            >
              TISS Watcher
            </button>
          </div>
        </div>

        {/* Manifest & Bundle Editors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manifest Editor */}
          <div className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-5 shadow-[var(--tu-shadow)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[var(--tu-text-accent)]" />
                  <h4 className="font-semibold text-sm">Unpacked manifest.json</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--tu-bg-card)] text-[var(--tu-text-muted)] border border-[var(--tu-border)]">
                  JSON Schema v1
                </span>
              </div>
              <textarea
                value={devManifestJson}
                onChange={(e) => setDevManifestJson(e.target.value)}
                rows={12}
                className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] p-3 text-xs font-mono text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)] resize-none"
              />
            </div>
            <div className="text-[11px] text-[var(--tu-text-muted)] mt-2">
              Validates reverse-DNS ID, entrypoint, and declared network & storage capabilities.
            </div>
          </div>

          {/* HTML Bundle */}
          <div className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-5 shadow-[var(--tu-shadow)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-[var(--tu-text-accent)]" />
                  <h4 className="font-semibold text-sm">Unpacked index.html Bundle</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--tu-bg-card)] text-[var(--tu-text-muted)] border border-[var(--tu-border)]">
                  HTML5 + CSS Variables
                </span>
              </div>
              <textarea
                value={devHtmlContent}
                onChange={(e) => setDevHtmlContent(e.target.value)}
                rows={12}
                className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] p-3 text-xs font-mono text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)] resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--tu-border-subtle)] mt-2">
              <span className="text-[11px] text-[var(--tu-text-muted)]">
                Sandboxed under <code className="text-[var(--tu-text-accent)]">allow-scripts</code>
              </span>
              <button
                onClick={handleSideload}
                className="px-4 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Sideload & Launch Sandboxed
              </button>
            </div>
          </div>
        </div>

        {statusMsg && (
          <div className="p-3 rounded-[var(--tu-radius)] bg-[var(--tu-accent)]/10 border border-[var(--tu-accent)]/30 text-[var(--tu-text-accent)] text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}
      </section>

      {/* Publishing Modal */}
      <PublishPluginModal />
    </div>
  );
};
