import React from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  LayoutGrid,
  CalendarClock,
  Store,
  Palette,
  Cloud,
} from "lucide-react";

export const Dock: React.FC = () => {
  const {
    activeView,
    activePluginId,
    setActiveView,
    setSyncModalOpen,
  } = useAppStore();

  const navItems = [
    {
      id: "dashboard",
      type: "view" as const,
      label: "Workstation Hub",
      icon: LayoutGrid,
      isActive: activeView === "dashboard",
      onClick: () => setActiveView("dashboard"),
    },
    {
      id: "tuwien.tuwel.deadlines",
      type: "plugin" as const,
      label: "TUWEL Deadlines",
      icon: CalendarClock,
      isActive: activeView === "plugin" && activePluginId === "tuwien.tuwel.deadlines",
      onClick: () => setActiveView("plugin", "tuwien.tuwel.deadlines"),
    },
    {
      id: "marketplace",
      type: "view" as const,
      label: "Plugin Store",
      icon: Store,
      isActive: activeView === "marketplace",
      onClick: () => setActiveView("marketplace"),
    },
    {
      id: "settings",
      type: "view" as const,
      label: "Themes & Styling",
      icon: Palette,
      isActive: activeView === "settings",
      onClick: () => setActiveView("settings"),
    },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[var(--tu-bg-surface)]/80 backdrop-blur-md border border-[var(--tu-border)] rounded-2xl shadow-2xl transition-all duration-300 hover:scale-[1.02]">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              title={item.label}
              className={`relative group flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                item.isActive
                  ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] shadow-lg shadow-[var(--tu-accent)]/20"
                  : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
              }`}
            >
              <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              
              {/* Active Indicator Dot */}
              {item.isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--tu-accent-contrast)]" />
              )}

              {/* Tooltip */}
              <span className="pointer-events-none absolute -top-9 px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap bg-[var(--tu-bg-card)] text-[var(--tu-text-primary)] border border-[var(--tu-border)] opacity-0 -translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 shadow-md">
                {item.label}
              </span>
            </button>
          );
        })}

        <div className="w-[1px] h-6 bg-[var(--tu-border)] mx-1" />

        {/* E2EE Sync Quick Trigger */}
        <button
          onClick={() => setSyncModalOpen(true)}
          title="Zero-Knowledge Cloud Sync"
          className="relative group flex items-center justify-center w-10 h-10 rounded-xl text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-all"
        >
          <Cloud className="w-4 h-4 group-hover:text-[var(--tu-text-accent)]" />
          <span className="pointer-events-none absolute -top-9 px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap bg-[var(--tu-bg-card)] text-[var(--tu-text-primary)] border border-[var(--tu-border)] opacity-0 -translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 shadow-md">
            E2EE Cloud Sync
          </span>
        </button>
      </div>
    </div>
  );
};
