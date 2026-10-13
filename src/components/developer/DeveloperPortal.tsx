import React, { useState } from "react";
import { useAppStore, PluginManifest } from "@/store/useAppStore";
import {
  Code,
  CheckCircle2,
  FileCode,
  ExternalLink,
  Github,
  Play,
  Shield,
} from "lucide-react";

export const DeveloperPortal: React.FC = () => {
  const { installPlugin, setActiveView } = useAppStore();

  const [devManifestJson, setDevManifestJson] = useState<string>(`{
  "id": "tuwien.student.dev-test",
  "name": "Local Sideload Test Plugin",
  "version": "0.1.0",
  "description": "Unpacked local plugin loaded for developer testing and iteration.",
  "entrypoint": "index.html",
  "capabilities": {
    "network": ["https://tuwel.tuwien.ac.at/*"],
    "storage": { "quotaBytes": 1048576 },
    "notifications": true
  }
}`);

  const [devHtmlContent, setDevHtmlContent] = useState<string>(`<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: var(--tu-font-sans);
      background: var(--tu-bg-base);
      color: var(--tu-text-primary);
      padding: 16px;
    }
    .badge {
      background: var(--tu-accent);
      color: var(--tu-accent-contrast);
      padding: 4px 8px;
      border-radius: var(--tu-radius-sm);
      font-size: 11px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h2>Local Sideloading Active 🚀</h2>
  <p style="font-size: 12px; color: var(--tu-text-secondary); margin: 8px 0;">
    This plugin is running live inside the sandboxed MessagePort RPC container.
  </p>
  <span class="badge">Development Build</span>
</body>
</html>`);

  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleSideload = () => {
    try {
      const manifest: PluginManifest = JSON.parse(devManifestJson);
      if (!manifest.id || !manifest.name) {
        throw new Error("Manifest must include 'id' and 'name'");
      }

      installPlugin(manifest, devHtmlContent, "local_dev");
      setStatusMsg(`Successfully sideloaded "${manifest.name}"!`);
      setTimeout(() => {
        setActiveView("plugin", manifest.id);
      }, 600);
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 text-[var(--tu-text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--tu-text-primary)]">
            Developer Workspace & Sideloading
          </h2>
          <p className="text-sm text-[var(--tu-text-secondary)] mt-1">
            Test unpacked local plugins, audit RPC communication, and apply to publish on the TU Cockpit Community Store.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)]/15 text-[var(--tu-accent)] border border-[var(--tu-accent)]/30 text-xs font-semibold flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Developer Mode Active
          </span>
        </div>
      </div>

      {/* Sideloading Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manifest Editor */}
        <section className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-5 shadow-[var(--tu-shadow)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileCode className="w-4 h-4 text-[var(--tu-text-accent)]" />
              <h3 className="font-semibold text-sm">Local manifest.json</h3>
            </div>
            <textarea
              value={devManifestJson}
              onChange={(e) => setDevManifestJson(e.target.value)}
              rows={12}
              className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] p-3 text-xs font-mono text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)] resize-none"
            />
          </div>

          <div className="text-[11px] text-[var(--tu-text-muted)] mt-2">
            Defines reverse-DNS ID, entrypoint, and declared network & storage capabilities.
          </div>
        </section>

        {/* Plugin HTML Bundle */}
        <section className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-5 shadow-[var(--tu-shadow)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-4 h-4 text-[var(--tu-text-accent)]" />
              <h3 className="font-semibold text-sm">Local index.html Bundle</h3>
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
              Automatically receives <code className="text-[var(--tu-text-accent)]">--tu-*</code> tokens
            </span>
            <button
              onClick={handleSideload}
              className="px-4 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Sideload & Launch
            </button>
          </div>
        </section>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-[var(--tu-radius)] bg-[var(--tu-accent)]/10 border border-[var(--tu-accent)]/30 text-[var(--tu-text-accent)] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Community Store Publishing Banner */}
      <section className="p-5 rounded-[var(--tu-radius-lg)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] shadow-[var(--tu-shadow)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-sm">Ready to Share with TU Wien Students?</h3>
          <p className="text-xs text-[var(--tu-text-secondary)] mt-0.5">
            Submit your GitHub repository to be vetted and published on the official Community Store Registry.
          </p>
        </div>

        <a
          href="https://github.com/tuwien-community/tu-cockpit-store"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Github className="w-4 h-4" />
          <span>Submit Pull Request</span>
          <ExternalLink className="w-3 h-3 text-[var(--tu-text-muted)]" />
        </a>
      </section>
    </div>
  );
};
