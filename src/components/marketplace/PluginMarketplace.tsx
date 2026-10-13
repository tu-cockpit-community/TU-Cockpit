import React, { useState } from "react";
import { useAppStore, PluginManifest } from "@/store/useAppStore";
import {
  Download,
  Trash2,
  ExternalLink,
  HardDrive,
  Globe,
  Bell,
  Search,
  Star,
  Users,
} from "lucide-react";

interface MarketplaceEntry {
  manifest: PluginManifest;
  category: "Academic" | "Campus Life" | "Productivity";
  rating: number;
  downloads: string;
  sampleHtml: string;
}

export const PluginMarketplace: React.FC = () => {
  const { installedPlugins, installPlugin, uninstallPlugin, setActiveView } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const catalog: MarketplaceEntry[] = [
    {
      category: "Academic",
      rating: 4.9,
      downloads: "4.8k",
      manifest: {
        id: "tuwien.tuwel.deadlines",
        name: "TUWEL Deadline Tracker",
        version: "1.0.0",
        description: "Real-time countdown and submission tracker for all TUWEL university assignments.",
        entrypoint: "index.html",
        icon: "calendar-clock",
        type: "widget",
        capabilities: {
          network: ["https://tuwel.tuwien.ac.at/*"],
          storage: { quotaBytes: 1048576 },
          notifications: true,
        },
      },
      sampleHtml: `<!-- Rendered by live bundle -->`,
    },
    {
      category: "Academic",
      rating: 4.8,
      downloads: "3.2k",
      manifest: {
        id: "tuwien.tiss.calendar",
        name: "TISS Exam & Course Timetable",
        version: "1.2.0",
        description: "Aggregates exam registration deadlines, grade updates, and your semester course schedule from TISS.",
        entrypoint: "index.html",
        icon: "calendar",
        type: "view",
        capabilities: {
          network: ["https://tiss.tuwien.ac.at/api/*"],
          storage: { quotaBytes: 2097152 },
          notifications: true,
        },
      },
      sampleHtml: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: var(--tu-font-sans); background: var(--tu-bg-base); color: var(--tu-text-primary); padding: 20px; }
            .header { color: var(--tu-accent); font-weight: bold; font-size: 16px; margin-bottom: 12px; }
            .exam-card { background: var(--tu-bg-surface); border: 1px solid var(--tu-border); border-radius: var(--tu-radius); padding: 14px; margin-bottom: 10px; }
            .badge { background: var(--tu-warning); color: #000; font-size: 11px; padding: 2px 6px; border-radius: var(--tu-radius-sm); font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">TISS Exam Schedule (WS 2026/27)</div>
          <div class="exam-card">
            <div style="font-size: 11px; color: var(--tu-text-secondary);">184.215 VU Algorithmen und Datenstrukturen</div>
            <div style="font-weight: 600; font-size: 14px;">Schriftliche Hauptprüfung 1</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
              <span style="font-size: 12px; color: var(--tu-text-muted);">Freihaus HS 1 • 09:00 - 11:30</span>
              <span class="badge">Angemeldet</span>
            </div>
          </div>
          <div class="exam-card">
            <div style="font-size: 11px; color: var(--tu-text-secondary);">101.450 VO Analysis 1 für Informatik</div>
            <div style="font-weight: 600; font-size: 14px;">Zwischentest 1</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
              <span style="font-size: 12px; color: var(--tu-text-muted);">AudiMax • 14:00 - 15:30</span>
              <span class="badge">Anmeldefrist: 18. Okt</span>
            </div>
          </div>
        </body>
        </html>
      `,
    },
    {
      category: "Academic",
      rating: 4.9,
      downloads: "5.1k",
      manifest: {
        id: "tuwien.community.vowi",
        name: "VoWi Student Course Wiki",
        version: "2.0.0",
        description: "Instant access to TU Wien course ratings, professor reviews, past exam questions, and study advice.",
        entrypoint: "index.html",
        icon: "book-open",
        type: "view",
        capabilities: {
          network: ["https://vowi.fsinf.at/*"],
          storage: { quotaBytes: 5242880 },
          notifications: false,
        },
      },
      sampleHtml: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: var(--tu-font-sans); background: var(--tu-bg-base); color: var(--tu-text-primary); padding: 20px; }
            .header { color: var(--tu-accent); font-weight: bold; font-size: 16px; margin-bottom: 12px; }
            .vowi-tip { background: var(--tu-bg-surface); border: 1px solid var(--tu-border); border-radius: var(--tu-radius); padding: 14px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">VoWi Course Insights</div>
          <div class="vowi-tip">
            <div style="font-weight: 600; color: var(--tu-text-accent);">VU Algorithmen und Datenstrukturen</div>
            <p style="font-size: 12px; color: var(--tu-text-secondary); margin-top: 4px;">
              "Sehr fairer Kurs, aber die Übungsblätter erfordern frühzeitiges Arbeiten. Besonderes Augenmerk auf Graph Traversals und Dynamic Programming legen!"
            </p>
          </div>
        </body>
        </html>
      `,
    },
    {
      category: "Campus Life",
      rating: 4.7,
      downloads: "6.4k",
      manifest: {
        id: "tuwien.campus.mensa",
        name: "TU Mensa Daily Menus",
        version: "1.1.0",
        description: "Daily student lunch specials & pricing at Freihaus Mensa, Cafeteria, and Campus Gußhaus.",
        entrypoint: "index.html",
        icon: "utensils",
        type: "widget",
        capabilities: {
          network: ["https://www.mensen.at/*"],
          storage: { quotaBytes: 524288 },
          notifications: false,
        },
      },
      sampleHtml: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: var(--tu-font-sans); background: var(--tu-bg-base); color: var(--tu-text-primary); padding: 20px; }
            .header { color: var(--tu-accent); font-weight: bold; font-size: 16px; margin-bottom: 12px; }
            .menu-item { background: var(--tu-bg-surface); border: 1px solid var(--tu-border); border-radius: var(--tu-radius); padding: 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
            .price { font-weight: bold; color: var(--tu-success); font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="header">Mensa Freihaus • Heutige Menüs</div>
          <div class="menu-item">
            <div>
              <div style="font-weight: 600; font-size: 13px;">Menü Klassik: Wiener Schnitzel</div>
              <div style="font-size: 11px; color: var(--tu-text-secondary);">mit Petersilerdäpfeln und Preiselbeeren</div>
            </div>
            <span class="price">€ 6,90</span>
          </div>
          <div class="menu-item">
            <div>
              <div style="font-weight: 600; font-size: 13px;">Menü Veggie: Kürbis-Gnocchi</div>
              <div style="font-size: 11px; color: var(--tu-text-secondary);">in Salbeibutter mit geriebenem Grana</div>
            </div>
            <span class="price">€ 5,80</span>
          </div>
        </body>
        </html>
      `,
    },
    {
      category: "Productivity",
      rating: 4.6,
      downloads: "2.9k",
      manifest: {
        id: "tuwien.campus.rooms",
        name: "TU Room Navigator & Map",
        version: "1.0.4",
        description: "Quickly locate lecture halls, seminar rooms, and study cubicles across all TU Wien campus buildings.",
        entrypoint: "index.html",
        icon: "map-pin",
        type: "tool",
        capabilities: {
          network: ["https://maps.tuwien.ac.at/*"],
          storage: { quotaBytes: 1048576 },
          notifications: false,
        },
      },
      sampleHtml: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: var(--tu-font-sans); background: var(--tu-bg-base); color: var(--tu-text-primary); padding: 20px; }
            .header { color: var(--tu-accent); font-weight: bold; font-size: 16px; margin-bottom: 12px; }
            .room-card { background: var(--tu-bg-surface); border: 1px solid var(--tu-border); border-radius: var(--tu-radius); padding: 12px; margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="header">Campus Room Finder</div>
          <div class="room-card">
            <div style="font-weight: 600;">FH Hörsaal 1 (FH 1)</div>
            <div style="font-size: 11px; color: var(--tu-text-secondary);">Wiedner Hauptstraße 8-10, Freihaus gelber Bereich, 1. OG</div>
          </div>
          <div class="room-card">
            <div style="font-weight: 600;">AudiMax</div>
            <div style="font-size: 11px; color: var(--tu-text-secondary);">Getreidemarkt 9, Hauptgebäude Stiege 1, EG</div>
          </div>
        </body>
        </html>
      `,
    },
  ];

  const filteredCatalog = catalog.filter((entry) => {
    const matchesCategory =
      selectedCategory === "All" || entry.category === selectedCategory;
    const matchesSearch =
      entry.manifest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.manifest.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 text-[var(--tu-text-primary)]">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--tu-text-primary)]">
          Plugin Ecosystem & Store
        </h2>
        <p className="text-sm text-[var(--tu-text-secondary)] mt-1">
          Install sandboxed tools, widgets, and utilities authored by TU Wien students and the open-source community.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-1.5 p-1 bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius)]">
          {["All", "Academic", "Campus Life", "Productivity"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] transition-all ${
                selectedCategory === cat
                  ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)]"
                  : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--tu-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plugins & tools..."
            className="w-full bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] pl-9 pr-3 py-1.5 text-xs text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)]"
          />
        </div>
      </div>

      {/* Plugin Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCatalog.map((entry) => {
          const isInstalled = !!installedPlugins[entry.manifest.id];

          return (
            <div
              key={entry.manifest.id}
              className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-5 shadow-[var(--tu-shadow)] flex flex-col justify-between hover:border-[var(--tu-border-focus)] transition-all"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-semibold text-base text-[var(--tu-text-primary)]">
                      {entry.manifest.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--tu-text-secondary)]">
                      <span className="flex items-center gap-1 text-[var(--tu-warning)]">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {entry.rating}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[var(--tu-text-muted)]">
                        <Users className="w-3.5 h-3.5" />
                        {entry.downloads} installs
                      </span>
                      <span>•</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--tu-bg-card)] border border-[var(--tu-border)]">
                        v{entry.manifest.version}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--tu-bg-card)] text-[var(--tu-text-secondary)] border border-[var(--tu-border)]">
                    {entry.category}
                  </span>
                </div>

                <p className="text-xs text-[var(--tu-text-secondary)] leading-relaxed mb-4">
                  {entry.manifest.description}
                </p>

                {/* Capability Badges */}
                <div className="space-y-1.5 pt-3 border-t border-[var(--tu-border-subtle)] text-[11px] mb-4">
                  <div className="flex items-center gap-1.5 text-[var(--tu-text-secondary)]">
                    <Globe className="w-3.5 h-3.5 text-[var(--tu-text-accent)] shrink-0" />
                    <span className="truncate font-mono text-[10px]">
                      {entry.manifest.capabilities?.network?.join(", ") || "No external network access"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[var(--tu-text-muted)] text-[10px]">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      Isolated SQLite Quota: {((entry.manifest.capabilities?.storage?.quotaBytes || 0) / 1024 / 1024).toFixed(1)} MB
                    </span>
                    {entry.manifest.capabilities?.notifications && (
                      <span className="flex items-center gap-1 text-[var(--tu-text-accent)]">
                        <Bell className="w-3 h-3" />
                        System Notifications
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                {isInstalled ? (
                  <>
                    <button
                      onClick={() => setActiveView("plugin", entry.manifest.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 transition-opacity flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Launch Plugin
                    </button>
                    <button
                      onClick={() => uninstallPlugin(entry.manifest.id)}
                      className="text-xs text-[var(--tu-danger)] hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Uninstall
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => installPlugin(entry.manifest, entry.sampleHtml)}
                    className="w-full py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] hover:border-[var(--tu-accent)] transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-[var(--tu-accent)]" />
                    Install Plugin
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
