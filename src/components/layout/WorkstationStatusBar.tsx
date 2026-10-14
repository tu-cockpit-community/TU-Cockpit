import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "@/store/useAppStore";
import {
  Calendar,
  Check,
  Download,
  Compass,
  Layers,
} from "lucide-react";

interface StudentDeadline {
  id: string;
  course_id: string;
  course_name: string;
  title: string;
  due_date: string;
  url: string;
  source: string;
  completed: boolean;
}

export const WorkstationStatusBar: React.FC = () => {
  const { activeView, activePluginId, installedPlugins, setActiveView } = useAppStore();
  const [deadlinesCount, setDeadlinesCount] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccessPath, setExportSuccessPath] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchDeadlines = async () => {
      try {
        const list = await invoke<StudentDeadline[]>("get_student_deadlines");
        if (mounted) {
          const pending = list.filter((d) => !d.completed).length;
          setDeadlinesCount(pending);
        }
      } catch (err) {
        console.warn("Status bar deadline fetch error:", err);
      }
    };

    fetchDeadlines();
    const interval = setInterval(fetchDeadlines, 30000); // 30s refresh
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleExportIcs = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const path = await invoke<string>("export_local_ics_feed");
      setExportSuccessPath(path);
      setTimeout(() => setExportSuccessPath(null), 4000);
    } catch (err) {
      console.error("Failed to export ICS:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const activePlugin = activePluginId ? installedPlugins[activePluginId] : null;

  return (
    <footer className="h-6 border-t border-[var(--tu-border)] bg-[var(--tu-bg-surface)] px-3 flex items-center justify-between text-[11px] text-[var(--tu-text-secondary)] select-none shrink-0 z-30">
      {/* Left: Reachability & Current Workstation Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5" title="Connected to TU Wien Services (TISS, TUWEL, Shibboleth)">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-[var(--tu-text-primary)] hidden sm:inline">
            TU Services Online
          </span>
        </div>

        <span className="text-[var(--tu-border)]">|</span>

        <div className="flex items-center gap-1 text-[var(--tu-text-muted)] truncate max-w-[220px]">
          {activeView === "plugin" && activePlugin ? (
            <>
              <Layers className="w-3 h-3 text-[var(--tu-accent)]" />
              <span className="truncate text-[var(--tu-text-primary)] font-medium">
                {activePlugin.manifest.name}
              </span>
            </>
          ) : (
            <>
              <Compass className="w-3 h-3 text-[var(--tu-text-muted)]" />
              <span>Marketplace Hub</span>
            </>
          )}
        </div>
      </div>

      {/* Center: Live Academic Deadlines Chip */}
      <div className="flex items-center">
        <button
          onClick={() => setActiveView("plugin", "tuwien.community.calendar")}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-[var(--tu-bg-card)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] transition-colors cursor-pointer"
          title="Open TU Calendar & Tasks"
        >
          <Calendar className="w-3 h-3 text-amber-400" />
          <span>
            {deadlinesCount > 0 ? (
              <span className="font-semibold text-amber-400">
                {deadlinesCount} {deadlinesCount === 1 ? "Deadline" : "Deadlines"} Pending
              </span>
            ) : (
              <span className="text-emerald-400 font-medium">All Deadlines Completed</span>
            )}
          </span>
        </button>
      </div>

      {/* Right: 1-Click ICS Export & Academic Term */}
      <div className="flex items-center gap-3">
        {exportSuccessPath ? (
          <span className="flex items-center gap-1 text-emerald-400 font-medium animate-in fade-in">
            <Check className="w-3 h-3" />
            <span>ICS Exported!</span>
          </span>
        ) : (
          <button
            onClick={handleExportIcs}
            disabled={isExporting}
            className="flex items-center gap-1 hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-card)] px-1.5 py-0.5 rounded transition-colors cursor-pointer disabled:opacity-50"
            title="Export deadlines to .ics for Apple / Google Calendar"
          >
            <Download className="w-3 h-3 text-[var(--tu-accent)]" />
            <span className="hidden sm:inline">Export Calendar (.ics)</span>
          </button>
        )}

        <span className="text-[var(--tu-border)] hidden sm:inline">|</span>

        <span className="text-[var(--tu-text-muted)] font-mono text-[10px] hidden sm:inline">
          WS 2026/27
        </span>
      </div>
    </footer>
  );
};
