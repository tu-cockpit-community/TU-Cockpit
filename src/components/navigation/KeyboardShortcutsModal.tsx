import React, { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import {
  X,
  Keyboard,
  Compass,
  BookOpen,
  GraduationCap,
  MapPin,
  Store,
  Layers,
  Code2,
  Settings,
  Search,
  Sidebar,
} from "lucide-react";

interface ShortcutItem {
  keys: string[];
  description: string;
  icon: React.ReactNode;
}

interface ShortcutSection {
  title: string;
  items: ShortcutItem[];
}

export const KeyboardShortcutsModal: React.FC = () => {
  const { isShortcutsModalOpen, setShortcutsModalOpen } = useAppStore();
  const { openOverlay, closeOverlay } = useOverlayStore();

  const isMac = typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().includes("mac");
  const modKey = isMac ? "⌘" : "Ctrl";
  const shiftKey = isMac ? "⇧" : "Shift";

  useEffect(() => {
    if (isShortcutsModalOpen) {
      openOverlay("shortcuts");
    } else {
      closeOverlay("shortcuts");
    }
  }, [isShortcutsModalOpen, openOverlay, closeOverlay]);

  if (!isShortcutsModalOpen) return null;

  const sections: ShortcutSection[] = [
    {
      title: "Navigation & Portals",
      items: [
        {
          keys: [modKey, "1"],
          description: "Open TUWEL Official Portal",
          icon: <GraduationCap className="w-3.5 h-3.5 text-sky-400" />,
        },
        {
          keys: [modKey, "2"],
          description: "Open TISS Organization & Timetable",
          icon: <BookOpen className="w-3.5 h-3.5 text-blue-400" />,
        },
        {
          keys: [modKey, "3"],
          description: "Open VoWi MediaWiki Reader",
          icon: <Compass className="w-3.5 h-3.5 text-emerald-400" />,
        },
        {
          keys: [modKey, "4"],
          description: "Open TU Maps Campus Navigator",
          icon: <MapPin className="w-3.5 h-3.5 text-amber-400" />,
        },
        {
          keys: [modKey, "5"],
          description: "Open Community Marketplace HUB",
          icon: <Store className="w-3.5 h-3.5 text-purple-400" />,
        },
      ],
    },
    {
      title: "Study Vault & DevStudio",
      items: [
        {
          keys: [modKey, shiftKey, "V"],
          description: "Open Physical Slide Vault & PDF Reader",
          icon: <Layers className="w-3.5 h-3.5 text-rose-400" />,
        },
        {
          keys: [modKey, shiftKey, "D"],
          description: "Jump to DevStudio Staging Environment",
          icon: <Code2 className="w-3.5 h-3.5 text-cyan-400" />,
        },
      ],
    },
    {
      title: "Workstation Controls",
      items: [
        {
          keys: [modKey, "K"],
          description: "Global Spotlight Search (Rooms, Courses, Plugins)",
          icon: <Search className="w-3.5 h-3.5 text-amber-400" />,
        },
        {
          keys: [modKey, "B"],
          description: "Toggle Workspace Sidebar Collapse",
          icon: <Sidebar className="w-3.5 h-3.5 text-[var(--tu-accent)]" />,
        },
        {
          keys: [modKey, ","],
          description: "Open Settings & Theme Engine",
          icon: <Settings className="w-3.5 h-3.5 text-slate-400" />,
        },
        {
          keys: [modKey, "/"],
          description: "Toggle Keyboard Shortcuts Cheat Sheet",
          icon: <Keyboard className="w-3.5 h-3.5 text-[var(--tu-accent)]" />,
        },
        {
          keys: ["Esc"],
          description: "Close Active Modal / Dropdown",
          icon: <X className="w-3.5 h-3.5 text-red-400" />,
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--tu-border)] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--tu-accent)]/15 text-[var(--tu-accent)] flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--tu-text-primary)]">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-[var(--tu-text-secondary)]">
                Fast navigation and workspace power-user controls
              </p>
            </div>
          </div>

          <button
            onClick={() => setShortcutsModalOpen(false)}
            className="p-1.5 rounded-md text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-card)] transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcut Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-[var(--tu-text-muted)] uppercase tracking-wider mb-2.5 px-1">
                {section.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] hover:border-[var(--tu-accent)]/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="shrink-0">{item.icon}</span>
                      <span className="text-xs text-[var(--tu-text-primary)] truncate font-medium">
                        {item.description}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="min-w-[20px] h-5 px-1.5 text-[10px] font-mono font-semibold flex items-center justify-center bg-[var(--tu-bg-surface)] text-[var(--tu-text-primary)] border border-[var(--tu-border)] rounded shadow-xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="mt-6 pt-4 border-t border-[var(--tu-border)] flex items-center justify-between text-[11px] text-[var(--tu-text-muted)]">
          <span>Press <kbd className="px-1 py-0.5 bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded text-[10px]">?</kbd> anywhere to open this dialog</span>
          <span>TU Cockpit Workstation</span>
        </div>
      </div>
    </div>
  );
};
