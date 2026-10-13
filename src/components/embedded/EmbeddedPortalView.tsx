import React, { useState } from "react";
import { open } from "@tauri-apps/plugin-shell";
import {
  GraduationCap,
  Calendar,
  BookOpen,
  MapPin,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export interface UniversityPortal {
  id: string;
  name: string;
  shortName: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const UNIVERSITY_PORTALS: UniversityPortal[] = [
  {
    id: "tuwel",
    name: "TUWEL (Moodle LMS)",
    shortName: "TUWEL",
    url: "https://tuwel.tuwien.ac.at",
    icon: GraduationCap,
    description: "Course materials, lecture submissions, and forum discussions",
  },
  {
    id: "tiss",
    name: "TISS University Portal",
    shortName: "TISS",
    url: "https://tiss.tuwien.ac.at",
    icon: Calendar,
    description: "Exam registration, official grades, and student schedule",
  },
  {
    id: "vowi",
    name: "VoWi Student Course Wiki",
    shortName: "VoWi Wiki",
    url: "https://vowi.fsinf.at",
    icon: BookOpen,
    description: "Community lecture reviews, exam tips, and study resources",
  },
  {
    id: "tumaps",
    name: "TU Maps Campus Navigation",
    shortName: "TU Maps",
    url: "https://maps.tuwien.ac.at",
    icon: MapPin,
    description: "Interactive lecture hall navigator and campus building maps",
  },
];

export const EmbeddedPortalView: React.FC = () => {
  const [activePortalId, setActivePortalId] = useState<string>("tuwel");
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const activePortal = UNIVERSITY_PORTALS.find((p) => p.id === activePortalId) || UNIVERSITY_PORTALS[0];

  const handleOpenExternal = async () => {
    try {
      await open(activePortal.url);
    } catch {
      window.open(activePortal.url, "_blank");
    }
  };

  const handleReload = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto space-y-3 pb-20">
      {/* Portal Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] p-1.5 shadow-sm">
        <div className="flex items-center gap-1.5">
          {UNIVERSITY_PORTALS.map((portal) => {
            const Icon = portal.icon;
            const isSelected = portal.id === activePortalId;
            return (
              <button
                key={portal.id}
                onClick={() => setActivePortalId(portal.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] transition-all ${
                  isSelected
                    ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] shadow"
                    : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{portal.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Browser Controls & Security Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius-sm)] px-1.5 py-1">
            <button
              onClick={() => {}}
              title="Back"
              className="p-1 rounded text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
            <button
              onClick={() => {}}
              title="Forward"
              className="p-1 rounded text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={handleReload}
              title="Reload"
              className="p-1 rounded text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors"
            >
              <RotateCw className="w-3 h-3" />
            </button>
          </div>

          {/* Current URL Bar */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] text-[11px] font-mono text-[var(--tu-text-secondary)] max-w-xs truncate">
            <ShieldCheck className="w-3 h-3 text-[var(--tu-success)] shrink-0" />
            <span className="truncate">{activePortal.url}</span>
          </div>

          {/* Theme Indicator */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)]/10 border border-[var(--tu-accent)]/30 text-[var(--tu-text-accent)] text-[10px] font-medium">
            <Sparkles className="w-3 h-3" />
            <span>Theme Injected</span>
          </div>

          {/* External Browser Button */}
          <button
            onClick={handleOpenExternal}
            title="Open in system browser"
            className="flex items-center gap-1 px-2 py-1 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] transition-colors text-xs"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden md:inline">Browser</span>
          </button>
        </div>
      </div>

      {/* Embedded Webview Container */}
      <div className="flex-1 w-full bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] overflow-hidden shadow-[var(--tu-shadow)] relative min-h-[560px]">
        <iframe
          key={`${activePortal.id}-${refreshKey}`}
          src={activePortal.url}
          className="w-full h-full border-none bg-transparent"
          title={activePortal.name}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    </div>
  );
};
