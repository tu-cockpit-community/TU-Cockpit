import React, { useState, useEffect, useCallback } from "react";
import {
  Folder,
  FolderOpen,
  HardDrive,
  FileText,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Calendar,
  Sparkles,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useAppStore } from "@/store/useAppStore";

interface SlideFileRecord {
  course: string;
  filename: string;
  path: string;
  size_bytes: number;
  modified_timestamp: number;
}

export const PluginsSettingsTab: React.FC = () => {
  const {
    slideVaultPath,
    setSlideVaultPath,
    tuwelInterceptionEnabled,
    setTuwelInterceptionEnabled,
    tissAutoSyncEnabled,
    setTissAutoSyncEnabled,
  } = useAppStore();

  const [currentPath, setCurrentPath] = useState<string>(slideVaultPath);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [totalBytes, setTotalBytes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [recentFiles, setRecentFiles] = useState<SlideFileRecord[]>([]);

  const loadVaultStats = useCallback(async () => {
    try {
      setLoading(true);
      const path = await invoke<string>("get_slide_vault_path");
      setCurrentPath(path);
      setSlideVaultPath(path);

      const files = await invoke<SlideFileRecord[]>("list_slide_vault_files");
      setTotalFiles(files.length);
      const bytes = files.reduce((acc, f) => acc + (f.size_bytes || 0), 0);
      setTotalBytes(bytes);
      setRecentFiles(files.slice(0, 4));
    } catch (err) {
      console.warn("Failed to query slide vault from backend:", err);
      // Fallback display if running in non-tauri or mock environment
      if (!currentPath) {
        const fallback = "~/Documents/TU-Cockpit/Slide-Vault";
        setCurrentPath(fallback);
        setSlideVaultPath(fallback);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPath, setSlideVaultPath]);

  useEffect(() => {
    loadVaultStats();
  }, [loadVaultStats]);

  const handleChangeDirectory = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select TU Slide Vault Folder",
        defaultPath: currentPath || undefined,
      });

      if (selected && typeof selected === "string") {
        await invoke("set_slide_vault_path", { newPath: selected });
        setCurrentPath(selected);
        setSlideVaultPath(selected);
        await loadVaultStats();
      }
    } catch (err) {
      console.error("Failed to select slide vault folder:", err);
    }
  };

  const handleRevealFolder = async () => {
    try {
      await invoke("reveal_slide_vault_folder");
    } catch (err) {
      console.error("Failed to open folder in OS file manager:", err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 KB";
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6 text-[var(--tu-text-primary)]">
      {/* Header Info */}
      <div className="border-b border-[var(--tu-border)] pb-4">
        <h4 className="font-bold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--tu-accent)]" />
          Community Plugins & University Workflow Ingestion
        </h4>
        <p className="text-xs text-[var(--tu-text-secondary)] mt-1">
          Configure native filesystem storage for lecture slides and automated background ingestion from TUWEL and TISS.
        </p>
      </div>

      {/* Section 1: Physical Slide Vault Filesystem Engine */}
      <div className="bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--tu-accent)]/15 border border-[var(--tu-accent)]/30 text-[var(--tu-accent)] flex items-center justify-center">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-tight">TU Slide Vault Physical Storage</div>
              <div className="text-[11px] text-[var(--tu-text-muted)]">
                Local filesystem directory where downloaded course slides and lecture notes are stored.
              </div>
            </div>
          </div>

          <button
            onClick={loadVaultStats}
            disabled={loading}
            className="p-1.5 rounded text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors cursor-pointer"
            title="Aktualisieren"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Path Display & Action Buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[var(--tu-bg-surface)] border border-[var(--tu-border)]">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <FolderOpen className="w-4 h-4 text-[var(--tu-accent)] shrink-0" />
              <span className="font-mono text-xs text-[var(--tu-text-primary)] truncate select-all">
                {currentPath || "Resolving slide vault path..."}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleChangeDirectory}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-[var(--tu-bg-elevated)] border border-[var(--tu-border)] hover:bg-[var(--tu-accent)] hover:text-white transition-all cursor-pointer shadow-xs"
              >
                Ordner wählen...
              </button>

              <button
                onClick={handleRevealFolder}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-[var(--tu-accent)] text-white hover:bg-[var(--tu-accent-hover)] transition-all cursor-pointer shadow-xs"
                title="Im Finder / Explorer anzeigen"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Im Explorer öffnen
              </button>
            </div>
          </div>
        </div>

        {/* Storage Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] uppercase font-bold text-[var(--tu-text-muted)] tracking-wider">
                  Gespeicherte Vorlesungs-Folien
                </div>
                <div className="text-base font-bold text-[var(--tu-text-primary)] mt-0.5">
                  {totalFiles} Dateien
                </div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              Offline bereit
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-sky-400" />
              <div>
                <div className="text-[10px] uppercase font-bold text-[var(--tu-text-muted)] tracking-wider">
                  Speicherplatzbelegung
                </div>
                <div className="text-base font-bold text-[var(--tu-text-primary)] mt-0.5">
                  {formatFileSize(totalBytes)}
                </div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold">
              Dateisystem
            </span>
          </div>
        </div>

        {/* Recently Ingested Documents List */}
        {recentFiles.length > 0 && (
          <div className="pt-2">
            <div className="text-[11px] font-bold text-[var(--tu-text-muted)] uppercase tracking-wider mb-2">
              Kürzlich hinzugefügte Folien:
            </div>
            <div className="space-y-1.5">
              {recentFiles.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded bg-[var(--tu-bg-surface)] border border-[var(--tu-border-subtle)]"
                >
                  <div className="flex items-center gap-2 truncate flex-1 mr-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-medium text-[var(--tu-text-primary)] truncate">{f.filename}</span>
                    <span className="text-[10px] text-[var(--tu-text-muted)] shrink-0 font-mono">({f.course})</span>
                  </div>
                  <span className="text-[10px] text-[var(--tu-text-muted)] shrink-0 font-mono">
                    {formatFileSize(f.size_bytes)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 2: University Portal Automation & Ingestion Toggles */}
      <div className="bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] p-5 space-y-4">
        <div>
          <div className="text-xs font-bold tracking-tight">Portal Integration & Ingestion Automation</div>
          <div className="text-[11px] text-[var(--tu-text-secondary)] mt-0.5">
            Background bridges connecting TUWEL course slides and TISS calendar feeds directly into your workspace.
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {/* Toggle 1: TUWEL Resource Interception */}
          <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-[var(--tu-bg-surface)] border border-[var(--tu-border)]">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--tu-text-primary)]">
                  TUWEL Resource Interception ("Add to Slide Vault")
                </div>
                <div className="text-[11px] text-[var(--tu-text-secondary)] mt-0.5 leading-relaxed">
                  Injects an inline <code className="px-1 py-0.5 rounded bg-[var(--tu-bg-elevated)] font-mono text-[10px]">[📥 Add to Slide Vault]</code> action button adjacent to lecture slides and PDF download links inside TUWEL. Clicking downloads files straight into your local course folder.
                </div>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={tuwelInterceptionEnabled}
                onChange={(e) => setTuwelInterceptionEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[var(--tu-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--tu-accent)]" />
            </label>
          </div>

          {/* Toggle 2: TISS Timetable Auto-Sync */}
          <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-[var(--tu-bg-surface)] border border-[var(--tu-border)]">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--tu-text-primary)]">
                  TISS Timetable & Calendar Auto-Sync
                </div>
                <div className="text-[11px] text-[var(--tu-text-secondary)] mt-0.5 leading-relaxed">
                  Automatically extracts your personal semester schedule when visiting TISS and syncs upcoming lecture slots and exam dates into TU Calendar.
                </div>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={tissAutoSyncEnabled}
                onChange={(e) => setTissAutoSyncEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[var(--tu-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--tu-accent)]" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
