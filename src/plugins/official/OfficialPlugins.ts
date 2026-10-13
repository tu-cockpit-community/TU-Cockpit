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

  <script>
    let rpcPort = null;
    let autofillPayload = null;

    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'INIT_RPC_PORT') {
        rpcPort = event.ports[0];
        rpcPort.onmessage = function(e) {
          if (e.data && e.data.id === 'autofill_req' && e.data.result) {
            autofillPayload = e.data.result;
            setupAutofill();
          }
        };
        rpcPort.postMessage({
          jsonrpc: '2.0',
          id: 'autofill_req',
          method: 'autofill:getPayload'
        });
      }
    });

    function setupAutofill() {
      if (!autofillPayload || !autofillPayload.auto_fill) return;
      const iframe = document.getElementById('portal-frame');
      if (!iframe) return;

      const runAutofill = () => {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow.document;
          if (!doc) return;

          const userSelectors = ['input[name="j_username"]', 'input[name="username"]', 'input#username', 'input#id_username', 'input[type="email"]'];
          const passSelectors = ['input[name="j_password"]', 'input[name="password"]', 'input#password', 'input#id_password', 'input[type="password"]'];
          const mfaSelectors = ['input[name="token"]', 'input[name="totp"]', 'input#token', 'input[autocomplete="one-time-code"]'];

          let filled = false;
          let details = [];

          if (autofillPayload.username) {
            for (const sel of userSelectors) {
              const el = doc.querySelector(sel);
              if (el && !el.value) {
                el.focus();
                el.value = autofillPayload.username;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                filled = true;
                details.push('Username');
                break;
              }
            }
          }

          if (autofillPayload.password) {
            for (const sel of passSelectors) {
              const el = doc.querySelector(sel);
              if (el && !el.value) {
                el.focus();
                el.value = autofillPayload.password;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                filled = true;
                details.push('Password');
                break;
              }
            }
          }

          if (autofillPayload.totp_code) {
            for (const sel of mfaSelectors) {
              const el = doc.querySelector(sel);
              if (el && !el.value) {
                el.focus();
                el.value = autofillPayload.totp_code;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                filled = true;
                details.push('MFA Token');
                break;
              }
            }
          }

          if (filled && !doc.getElementById('tu-cockpit-autofill-badge')) {
            const badge = doc.createElement('div');
            badge.id = 'tu-cockpit-autofill-badge';
            badge.style.position = 'fixed';
            badge.style.top = '12px';
            badge.style.right = '12px';
            badge.style.zIndex = '999999';
            badge.style.background = '#0f172a';
            badge.style.color = '#38bdf8';
            badge.style.border = '1px solid #0284c7';
            badge.style.borderRadius = '20px';
            badge.style.padding = '6px 14px';
            badge.style.fontSize = '12px';
            badge.style.fontWeight = '600';
            badge.style.fontFamily = 'system-ui, -apple-system, sans-serif';
            badge.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4)';
            badge.innerHTML = '🔐 Autofilled by TU Cockpit (' + details.join(', ') + ')';
            doc.body.appendChild(badge);
            setTimeout(() => { if (badge.parentNode) badge.remove(); }, 5000);
          }
        } catch (e) {
          // Cross-origin boundary handled gracefully
        }
      };

      iframe.addEventListener('load', runAutofill);
      setInterval(runAutofill, 1000);
    }
  </script>
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
