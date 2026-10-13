import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Star,
  Code2,
  FileCode,
  Layers,
  Palette,
  Lock,
  ExternalLink,
  Copy,
  Check,
  BookOpen,
  GitPullRequest,
  Sparkles,
  Terminal,
  Shield,
  FileJson,
  Package,
} from "lucide-react";

interface TechItem {
  name: string;
  category: "Languages & Core" | "Frameworks & UI" | "Security & Constraints";
  status: "Full Support" | "Recommended" | "Forbidden";
  badgeVariant: "success" | "recommended" | "forbidden";
  description: string;
  icon: React.ReactNode;
}

const TECH_MATRIX: TechItem[] = [
  {
    name: "JavaScript (ES2024+)",
    category: "Languages & Core",
    status: "Full Support",
    badgeVariant: "success",
    description: "Standard web scripting runtime running inside sandboxed iframe context with postMessage bridge.",
    icon: <Code2 className="w-5 h-5 text-emerald-400" />,
  },
  {
    name: "TypeScript (5.x+)",
    category: "Languages & Core",
    status: "Recommended",
    badgeVariant: "recommended",
    description: "Strong typing with official TU Cockpit Plugin SDK types ensures zero runtime errors.",
    icon: <FileCode className="w-5 h-5 text-sky-400" />,
  },
  {
    name: "HTML5 & CSS3 Standard",
    category: "Languages & Core",
    status: "Full Support",
    badgeVariant: "success",
    description: "Modern DOM features, container queries, CSS variables, and modern web APIs supported natively.",
    icon: <Layers className="w-5 h-5 text-emerald-400" />,
  },
  {
    name: "Tailwind CSS (v3 / v4)",
    category: "Frameworks & UI",
    status: "Full Support",
    badgeVariant: "success",
    description: "Utility-first styles bundled at build time. Map utility colors to --tu-* variables.",
    icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
  },
  {
    name: "React 19 / Vue 3 / Svelte 5",
    category: "Frameworks & UI",
    status: "Full Support",
    badgeVariant: "success",
    description: "Any modern SPA framework bundled into single or multi-file client assets via Vite or Bun.",
    icon: <Package className="w-5 h-5 text-emerald-400" />,
  },
  {
    name: "Lucide & SVG Icon Packs",
    category: "Frameworks & UI",
    status: "Recommended",
    badgeVariant: "recommended",
    description: "Lightweight vector icons matching the official TU Cockpit visual grammar and stroke widths.",
    icon: <Star className="w-5 h-5 text-amber-400" />,
  },
  {
    name: "Native Binaries & eval() Remote Code",
    category: "Security & Constraints",
    status: "Forbidden",
    badgeVariant: "forbidden",
    description: "No unsigned DLL/dylib binaries, unapproved node modules, or dynamic remote script evaluation.",
    icon: <XCircle className="w-5 h-5 text-rose-500" />,
  },
  {
    name: "Wildcard Network Access (*://*)",
    category: "Security & Constraints",
    status: "Forbidden",
    badgeVariant: "forbidden",
    description: "Zero-trust sandbox rejects blanket network requests. All endpoints must be explicitly declared.",
    icon: <Shield className="w-5 h-5 text-rose-500" />,
  },
];

const MANIFEST_EXAMPLE = `{
  "$schema": "https://tu-cockpit-community.github.io/schemas/v1/plugin-manifest.json",
  "id": "tuwien.community.freihaus-timer",
  "name": "Freihaus Menü & Timer",
  "version": "1.2.0",
  "description": "Daily canteen menu preview and lecture break countdown for Freihaus campus.",
  "author": {
    "name": "Jane Student",
    "github": "janestudent",
    "email": "jane.student@student.tuwien.ac.at"
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
  },
  "theme": {
    "supportsAdaptiveTokens": true,
    "accentColor": "#006699"
  }
}`;

const TOKEN_EXAMPLE = `/* Inherit TU Cockpit Adaptive Theme Tokens inside your Plugin */
:root {
  color-scheme: light dark;
}

body {
  background-color: var(--tu-bg-canvas);
  color: var(--tu-text-primary);
  font-family: var(--tu-font-family, system-ui, sans-serif);
}

.plugin-card {
  background: var(--tu-bg-card);
  border: 1px solid var(--tu-border);
  border-radius: var(--tu-radius);
  box-shadow: var(--tu-shadow-sm);
  padding: 1rem;
}

.primary-button {
  background: var(--tu-accent);
  color: var(--tu-accent-contrast);
  border-radius: var(--tu-radius-sm);
}`;

export const DeveloperGuideTab: React.FC = () => {
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [copiedTokens, setCopiedTokens] = useState(false);

  const copyToClipboard = (text: string, type: "manifest" | "tokens") => {
    navigator.clipboard.writeText(text);
    if (type === "manifest") {
      setCopiedManifest(true);
      setTimeout(() => setCopiedManifest(false), 2000);
    } else {
      setCopiedTokens(true);
      setTimeout(() => setCopiedTokens(false), 2000);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-16 text-[var(--tu-text-primary)]">
      {/* Introduction Hero */}
      <div className="relative overflow-hidden rounded-[var(--tu-radius)] p-6 bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--tu-accent)]/10 text-[var(--tu-text-accent)] border border-[var(--tu-accent)]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Plugin Architecture</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--tu-text-primary)]">
            TU Cockpit Plugin Developer Platform
          </h2>
          <p className="text-sm leading-relaxed text-[var(--tu-text-secondary)]">
            Build secure, high-performance extensions for your fellow TU Wien students. Every community
            plugin executes inside a zero-trust hardware-isolated sandbox and inherits real-time TU Wien theme
            tokens and credentials without exposing private SSO sessions.
          </p>
        </div>
      </div>

      {/* Top Section: Visual Technology Matrix */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--tu-border)] pb-3">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 text-[var(--tu-text-primary)]">
              <Layers className="w-5 h-5 text-[var(--tu-text-accent)]" />
              Visual Technology Support Matrix
            </h3>
            <p className="text-xs text-[var(--tu-text-secondary)] mt-0.5">
              Strict compatibility and security constraints enforced by the TU Cockpit sandbox runtime.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TECH_MATRIX.map((item) => {
            const isForbidden = item.badgeVariant === "forbidden";
            const isRecommended = item.badgeVariant === "recommended";

            return (
              <div
                key={item.name}
                className={`flex flex-col justify-between p-4 rounded-[var(--tu-radius)] border transition-all duration-150 ${
                  isForbidden
                    ? "bg-rose-500/5 border-rose-500/30 hover:border-rose-500/50"
                    : isRecommended
                    ? "bg-sky-500/5 border-sky-500/30 hover:border-sky-500/50"
                    : "bg-[var(--tu-bg-card)] border-[var(--tu-border)] hover:border-[var(--tu-accent)]/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="p-2 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)]">
                      {item.icon}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isForbidden
                          ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          : isRecommended
                          ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                          : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {isForbidden ? (
                        <XCircle className="w-3 h-3" />
                      ) : isRecommended ? (
                        <Star className="w-3 h-3" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      {item.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-[var(--tu-text-primary)] mb-1">
                    {item.name}
                  </h4>
                  <p className="text-xs text-[var(--tu-text-secondary)] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-[var(--tu-border)]/60 text-[10px] font-mono text-[var(--tu-text-muted)] flex items-center justify-between">
                  <span>Scope: {item.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Section: Developer Guide & Manifest Specification */}
      <section className="space-y-8">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-[var(--tu-text-primary)]">
            <BookOpen className="w-5 h-5 text-[var(--tu-text-accent)]" />
            Project Formatting & Packaging Guide
          </h3>
          <p className="text-xs text-[var(--tu-text-secondary)] mt-0.5">
            Follow standard repository layout and manifest specifications to qualify for verified community listing.
          </p>
        </div>

        {/* 1. manifest.json Schema Specification */}
        <div className="p-5 rounded-[var(--tu-radius)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileJson className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-bold text-[var(--tu-text-primary)]">
                1. Plugin Manifest Specification (<code className="text-xs font-mono">manifest.json</code>)
              </h4>
            </div>
            <button
              onClick={() => copyToClipboard(MANIFEST_EXAMPLE, "manifest")}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] transition-colors cursor-pointer self-start sm:self-auto"
            >
              {copiedManifest ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Template</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-[var(--tu-text-secondary)] leading-relaxed">
            Every community plugin repository must contain a valid <code className="font-mono">manifest.json</code> at its root.
            The desktop client parses and validates this manifest prior to running plugin assets.
          </p>

          <pre className="p-4 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-[11px] font-mono text-[var(--tu-text-secondary)] overflow-x-auto leading-relaxed">
            <code>{MANIFEST_EXAMPLE}</code>
          </pre>
        </div>

        {/* 2. Supported Build Tools & Project Structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-[var(--tu-radius)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] space-y-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[var(--tu-text-accent)]" />
              <h4 className="text-sm font-bold text-[var(--tu-text-primary)]">
                2. Recommended Bundlers
              </h4>
            </div>
            <ul className="text-xs text-[var(--tu-text-secondary)] space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-[var(--tu-text-primary)] shrink-0">• Vite / Rollup:</span>
                Configure <code className="font-mono">base: "./"</code> in your <code className="font-mono">vite.config.ts</code> so asset URLs resolve relatively inside the sandbox.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-[var(--tu-text-primary)] shrink-0">• Pure HTML/JS:</span>
                Zero-build plugins with Vanilla JS & CSS are 100% supported! Simply place <code className="font-mono">index.html</code> at repository root.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-[var(--tu-text-primary)] shrink-0">• Asset Size:</span>
                Keep total bundle sizes under 15 MB for instantaneous downloads and fast launch times.
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-[var(--tu-radius)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-400" />
              <h4 className="text-sm font-bold text-[var(--tu-text-primary)]">
                3. Zero-Trust Security Policies
              </h4>
            </div>
            <ul className="text-xs text-[var(--tu-text-secondary)] space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-[var(--tu-text-primary)] shrink-0">• Zero Telemetry:</span>
                Plugins must never collect, track, or phone home student identifiers, matrikel numbers, or analytics.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-[var(--tu-text-primary)] shrink-0">• Domain Globs:</span>
                Declare all outbound HTTP endpoints explicitly in <code className="font-mono">permissions.network</code>.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-[var(--tu-text-primary)] shrink-0">• No Remote Scripts:</span>
                All JavaScript must be bundled locally into the plugin repository. Loading scripts from external CDNs is blocked by CSP.
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Universal Design Tokens */}
        <div className="p-5 rounded-[var(--tu-radius)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-[var(--tu-text-accent)]" />
              <h4 className="text-sm font-bold text-[var(--tu-text-primary)]">
                4. Inheriting Adaptive Design Tokens (<code className="text-xs font-mono">--tu-*</code>)
              </h4>
            </div>
            <button
              onClick={() => copyToClipboard(TOKEN_EXAMPLE, "tokens")}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] transition-colors cursor-pointer self-start sm:self-auto"
            >
              {copiedTokens ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy CSS</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-[var(--tu-text-secondary)] leading-relaxed">
            The TU Cockpit host automatically injects CSS variables into your plugin iframe. Use these tokens so your plugin
            seamlessly adapts when students toggle between Light, Dark, or High Contrast themes.
          </p>

          <pre className="p-4 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-[11px] font-mono text-[var(--tu-text-secondary)] overflow-x-auto leading-relaxed">
            <code>{TOKEN_EXAMPLE}</code>
          </pre>
        </div>

        {/* 4. Publishing to tu-cockpit-community */}
        <div className="p-5 rounded-[var(--tu-radius)] bg-gradient-to-br from-[var(--tu-bg-surface)] to-[var(--tu-bg-card)] border border-[var(--tu-border)] space-y-4">
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold text-[var(--tu-text-primary)]">
              5. Publishing to the Official Community Organization
            </h4>
          </div>

          <p className="text-xs text-[var(--tu-text-secondary)] leading-relaxed">
            To protect students from arbitrary remote code exploits, TU Cockpit strictly limits installations to repositories hosted under the verified{" "}
            <strong className="text-[var(--tu-text-primary)] font-mono">tu-cockpit-community</strong> GitHub organization.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] space-y-1.5">
              <div className="text-xs font-bold text-[var(--tu-accent)] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[var(--tu-accent)]/15 flex items-center justify-center text-[10px]">1</span>
                <span>Build & Test Locally</span>
              </div>
              <p className="text-[11px] text-[var(--tu-text-secondary)] leading-relaxed">
                Develop your plugin in your personal GitHub repo. Verify valid <code className="font-mono">manifest.json</code> and <code className="font-mono">index.html</code>.
              </p>
            </div>

            <div className="p-3.5 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] space-y-1.5">
              <div className="text-xs font-bold text-[var(--tu-accent)] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[var(--tu-accent)]/15 flex items-center justify-center text-[10px]">2</span>
                <span>Submit Verification Issue</span>
              </div>
              <p className="text-[11px] text-[var(--tu-text-secondary)] leading-relaxed">
                Open a transfer or verification request in the community registry repo. Student maintainers review permissions and security.
              </p>
            </div>

            <div className="p-3.5 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] space-y-1.5">
              <div className="text-xs font-bold text-[var(--tu-accent)] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[var(--tu-accent)]/15 flex items-center justify-center text-[10px]">3</span>
                <span>Instant Auto-Discovery</span>
              </div>
              <p className="text-[11px] text-[var(--tu-text-secondary)] leading-relaxed">
                Once transferred to <code className="font-mono">tu-cockpit-community</code>, all TU Cockpit clients automatically discover and list your plugin!
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <a
              href="https://github.com/tu-cockpit-community"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            >
              <span>Visit Community Organization</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
