import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { usePaletteStore } from "@/store/usePaletteStore";
import { useSplitStore } from "@/store/useSplitStore";
import {
  GraduationCap,
  Clock,
  Settings,
  ChevronRight,
  Github,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Columns2,
} from "lucide-react";

interface ExecutiveHeaderProps {
  onOpenSettings: () => void;
}

export const ExecutiveHeader: React.FC<ExecutiveHeaderProps> = ({
  onOpenSettings,
}) => {
  const {
    activeView,
    activePluginId,
    installedPlugins,
    setActiveView,
    navOrientation,
    isSidebarCollapsed,
    toggleSidebar,
  } = useAppStore();
  const { currentUser, setLoginModalOpen } = useAuthStore();
  const { openPalette } = usePaletteStore();
  const { isSplitActive, toggleSplit } = useSplitStore();
  const [currentTime, setCurrentTime] = useState<string>("");

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
    <header className="h-12 border-b border-[var(--tu-border)] bg-[var(--tu-bg-surface)] px-4 flex items-center justify-between shrink-0 select-none z-30 shadow-sm text-[var(--tu-text-primary)]">
      {/* Left: Branding & Dynamic Breadcrumb */}
      <div className="flex items-center gap-2.5">
        {(navOrientation === "left" || navOrientation === "right") && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-[var(--tu-radius-sm)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors cursor-pointer"
            title={isSidebarCollapsed ? "Expand Sidebar (Cmd+B)" : "Collapse Sidebar (Cmd+B)"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}

        <button
          onClick={() => setActiveView("marketplace")}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer group"
          title="Return to Marketplace"
        >
          <div className="w-7 h-7 rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] flex items-center justify-center font-bold text-xs shadow-md transition-transform group-hover:scale-105">
            TU
          </div>
          <span className="font-bold text-sm tracking-tight text-[var(--tu-text-primary)]">
            TU Cockpit
          </span>
        </button>

        {activeView === "plugin" && activePlugin && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--tu-text-secondary)]">
            <ChevronRight className="w-3.5 h-3.5 text-[var(--tu-text-muted)]" />
            <span className="font-semibold text-[var(--tu-text-primary)] truncate max-w-[200px] sm:max-w-[280px]">
              {activePlugin.manifest.name}
            </span>
          </div>
        )}
      </div>

      {/* Center: Search Trigger (Cmd+K) & Academic Semester */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={openPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] hover:border-[var(--tu-accent)]/50 text-xs text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] transition-all cursor-pointer shadow-sm group w-44 sm:w-60 md:w-72 justify-between"
          title="Search rooms, plugins, actions... (Cmd+K)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-[var(--tu-text-muted)] group-hover:text-[var(--tu-accent)] transition-colors shrink-0" />
            <span className="truncate">Search rooms, plugins, actions...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-[var(--tu-text-muted)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded shadow-xs">
            ⌘K
          </kbd>
        </button>

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-[var(--tu-text-secondary)] px-3 py-1 rounded-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)]">
          <GraduationCap className="w-3.5 h-3.5 text-[var(--tu-accent)]" />
          <span className="font-medium">WS 2026/27</span>
        </div>
      </div>

      {/* Right: Split Screen, Student Profile Pill, Live Clock & Settings Gear */}
      <div className="flex items-center gap-2.5 text-xs">
        {/* Split Screen Workstation Toggle */}
        <button
          onClick={toggleSplit}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--tu-radius-sm)] border text-[11px] font-medium transition-all cursor-pointer ${
            isSplitActive
              ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] border-[var(--tu-accent)] shadow-sm"
              : "bg-[var(--tu-bg-card)] text-[var(--tu-text-secondary)] border-[var(--tu-border)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
          }`}
          title="Toggle Multi-Webview Split Workstation"
        >
          <Columns2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{isSplitActive ? "Exit Split" : "Split View"}</span>
        </button>

        {/* Student Profile Pill */}
        <button
          onClick={() => setLoginModalOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] hover:border-[var(--tu-border-focus)] transition-all cursor-pointer group"
          title="Student Profile & Authentication"
        >
          <div className="w-5 h-5 rounded-full bg-[var(--tu-accent)]/20 text-[var(--tu-accent)] flex items-center justify-center">
            <User className="w-3 h-3" />
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="font-semibold text-[var(--tu-text-primary)] group-hover:text-[var(--tu-text-accent)] transition-colors">
              {currentUser?.displayName || "Student"}
            </span>
            {currentUser?.matriculationNumber && (
              <span className="text-[var(--tu-text-muted)] font-mono">
                ({currentUser.matriculationNumber})
              </span>
            )}
            {currentUser?.githubUsername && (
              <span className="text-[var(--tu-text-muted)] flex items-center gap-0.5">
                <Github className="w-3 h-3 text-[var(--tu-text-secondary)]" />
                <span>@{currentUser.githubUsername}</span>
              </span>
            )}
          </div>
        </button>

        {/* Live Clock */}
        <div className="hidden sm:flex items-center gap-1 font-mono text-[var(--tu-text-primary)] px-2 py-1 rounded bg-[var(--tu-bg-card)] border border-[var(--tu-border)] text-[11px]">
          <Clock className="w-3 h-3 text-[var(--tu-text-muted)]" />
          <span>{currentTime}</span>
        </div>

        {/* Settings Gear Cog Button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] hover:border-[var(--tu-border-focus)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] transition-all cursor-pointer group shadow-sm"
          title="Workspace Settings (Theming, Sync, Layout)"
        >
          <Settings className="w-4 h-4 transition-transform group-hover:rotate-45 duration-300" />
        </button>
      </div>
    </header>
  );
};
