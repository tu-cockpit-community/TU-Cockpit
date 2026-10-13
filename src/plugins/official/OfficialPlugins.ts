import { PluginManifest } from "@/store/useAppStore";

export interface OfficialPluginDefinition {
  manifest: PluginManifest;
  htmlContent: string;
}

const createPortalHtml = (
  title: string,
  targetUrl: string,
  badgeText: string,
  description: string
): string => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    :root {
      color-scheme: dark light;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: var(--tu-font-sans, system-ui, sans-serif);
      background: var(--tu-bg-base, #121212);
      color: var(--tu-text-primary, #ffffff);
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .portal-nav {
      height: 44px;
      background: var(--tu-bg-surface, #1e1e1e);
      border-bottom: 1px solid var(--tu-border, #333);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      gap: 12px;
      user-select: none;
      flex-shrink: 0;
    }
    .nav-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge {
      background: var(--tu-accent, #006699);
      color: var(--tu-accent-contrast, #ffffff);
      padding: 3px 8px;
      border-radius: var(--tu-radius-sm, 6px);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .title {
      font-size: 13px;
      font-weight: 600;
      color: var(--tu-text-primary, #ffffff);
    }
    .url-bar {
      flex: 1;
      max-width: 480px;
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--tu-bg-card, #262626);
      border: 1px solid var(--tu-border, #333);
      border-radius: var(--tu-radius-sm, 6px);
      padding: 4px 10px;
      font-size: 11px;
      font-family: var(--tu-font-mono, monospace);
      color: var(--tu-text-secondary, #aaa);
    }
    .url-bar .lock {
      color: var(--tu-success, #22c55e);
      font-size: 12px;
    }
    .url-bar span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn {
      background: var(--tu-bg-card, #262626);
      border: 1px solid var(--tu-border, #333);
      color: var(--tu-text-primary, #ffffff);
      padding: 4px 10px;
      border-radius: var(--tu-radius-sm, 6px);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      text-decoration: none;
      transition: background 0.15s;
    }
    .btn:hover {
      background: var(--tu-bg-hover, #333);
    }
    .frame-container {
      flex: 1;
      width: 100%;
      height: calc(100vh - 44px);
      position: relative;
      background: #ffffff;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .notice-bar {
      position: absolute;
      bottom: 12px;
      right: 12px;
      background: var(--tu-bg-surface, #1e1e1e);
      border: 1px solid var(--tu-border, #333);
      border-radius: var(--tu-radius-sm, 6px);
      padding: 6px 12px;
      font-size: 11px;
      color: var(--tu-text-secondary, #aaa);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 10;
    }
  </style>
</head>
<body>
  <div class="portal-nav">
    <div class="nav-left">
      <span class="badge">${badgeText}</span>
      <span class="title">${title}</span>
    </div>

    <div class="url-bar">
      <span class="lock">🔒</span>
      <span>${targetUrl}</span>
    </div>

    <div class="actions">
      <button class="btn" onclick="document.getElementById('portal-frame').src = '${targetUrl}'" title="Reload page">
        ↻ Reload
      </button>
      <a class="btn" href="${targetUrl}" target="_blank" rel="noreferrer" title="Open in system browser">
        ↗ External
      </a>
    </div>
  </div>

  <div class="frame-container">
    <iframe
      id="portal-frame"
      src="${targetUrl}"
      sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals"
    ></iframe>
    <div class="notice-bar">
      <span>🎨 Adaptive Theme Active</span>
      <span>•</span>
      <span>${description}</span>
    </div>
  </div>
</body>
</html>`;

export const OFFICIAL_PLUGINS: Record<string, OfficialPluginDefinition> = {
  "tuwien.official.tuwel": {
    manifest: {
      id: "tuwien.official.tuwel",
      name: "TUWEL Moodle LMS",
      version: "1.0.0",
      description: "Official TU Wien Moodle learning management system for assignments, courses, and materials.",
      entrypoint: "index.html",
      homepage: "https://tuwel.tuwien.ac.at",
      type: "view",
      capabilities: {
        network: ["https://tuwel.tuwien.ac.at/*", "https://login.tuwien.ac.at/*"],
        storage: { quotaBytes: 5242880 },
        notifications: true,
      },
    },
    htmlContent: createPortalHtml(
      "TUWEL Moodle",
      "https://tuwel.tuwien.ac.at",
      "TUWEL",
      "Moodle 4.x LMS"
    ),
  },
  "tuwien.official.tiss": {
    manifest: {
      id: "tuwien.official.tiss",
      name: "TISS Campus Portal",
      version: "1.0.0",
      description: "Official TU Wien Information Systems for course registration, grades, certificates, and exam seats.",
      entrypoint: "index.html",
      homepage: "https://tiss.tuwien.ac.at",
      type: "view",
      capabilities: {
        network: ["https://tiss.tuwien.ac.at/*", "https://login.tuwien.ac.at/*"],
        storage: { quotaBytes: 5242880 },
        notifications: true,
      },
    },
    htmlContent: createPortalHtml(
      "TISS Campus",
      "https://tiss.tuwien.ac.at",
      "TISS",
      "Course & Exam Records"
    ),
  },
  "tuwien.official.vowi": {
    manifest: {
      id: "tuwien.official.vowi",
      name: "VoWi Student Wiki",
      version: "1.0.0",
      description: "Student-maintained course wiki with lecture notes, exam reviews, professor feedback, and study tips.",
      entrypoint: "index.html",
      homepage: "https://vowi.fsinf.at",
      type: "view",
      capabilities: {
        network: ["https://vowi.fsinf.at/*"],
        storage: { quotaBytes: 5242880 },
        notifications: false,
      },
    },
    htmlContent: createPortalHtml(
      "VoWi Wiki",
      "https://vowi.fsinf.at",
      "VoWi",
      "Student Union Wiki"
    ),
  },
  "tuwien.official.tumaps": {
    manifest: {
      id: "tuwien.official.tumaps",
      name: "TU Maps Navigator",
      version: "1.0.0",
      description: "Interactive campus navigation and floor plans for Karlsplatz, Freihaus, and Gußhaus.",
      entrypoint: "index.html",
      homepage: "https://maps.tuwien.ac.at",
      type: "view",
      capabilities: {
        network: ["https://maps.tuwien.ac.at/*"],
        storage: { quotaBytes: 2097152 },
        notifications: false,
      },
    },
    htmlContent: createPortalHtml(
      "TU Maps",
      "https://maps.tuwien.ac.at",
      "TU Maps",
      "Interactive Campus Floorplan"
    ),
  },
};
