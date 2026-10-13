import React, { useState, useEffect } from "react";
import { useDeadlineStore, DeadlineItem } from "@/store/useDeadlineStore";
import { open } from "@tauri-apps/plugin-shell";
import {
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  Circle,
  AlertTriangle,
  RefreshCw,
  Plus,
  X,
  FileSpreadsheet,
  Check,
} from "lucide-react";

export const DeadlineAgendaModal: React.FC = () => {
  const {
    deadlines,
    isLoading,
    isAgendaOpen,
    setAgendaOpen,
    fetchDeadlines,
    syncDeadlines,
    toggleCompleted,
    addDeadline,
    exportIcs,
  } = useDeadlineStore();

  const [feedUrl, setFeedUrl] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [newHours, setNewHours] = useState("24");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isAgendaOpen) {
      fetchDeadlines();
    }
  }, [isAgendaOpen, fetchDeadlines]);

  if (!isAgendaOpen) return null;

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedUrl.trim()) return;
    await syncDeadlines(feedUrl.trim());
    setFeedUrl("");
  };

  const handleCreateDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const due = new Date(Date.now() + parseInt(newHours, 10) * 3600 * 1000);
    const item: DeadlineItem = {
      id: `manual_${Date.now()}`,
      course_id: "CUSTOM",
      course_name: newCourse.trim() || "University Course",
      title: newTitle.trim(),
      due_date: due.toISOString(),
      url: "https://tuwel.tuwien.ac.at",
      source: "TUWEL",
      completed: false,
      notified_24h: false,
      notified_2h: false,
    };
    await addDeadline(item);
    setNewTitle("");
    setNewCourse("");
    setShowAddForm(false);
  };

  const handleExport = async () => {
    try {
      const path = await exportIcs();
      setExportNotice(`Exported to ${path}`);
      try {
        await open(path);
      } catch {
        // Ignored
      }
      setTimeout(() => setExportNotice(null), 4000);
    } catch (err) {
      console.error("Export ICS error:", err);
    }
  };

  const formatCountdown = (isoDate: string) => {
    const diff = new Date(isoDate).getTime() - Date.now();
    if (diff < 0) return { label: "Overdue", urgent: true };
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 2) return { label: `In ${Math.max(1, Math.floor(diff / 60000))}m`, urgent: true };
    if (hours < 24) return { label: `In ${hours} hours`, urgent: true };
    const days = Math.floor(hours / 24);
    if (days === 1) return { label: "Tomorrow", urgent: false };
    return { label: `In ${days} days`, urgent: false };
  };

  const activeDeadlines = deadlines.filter((d) => !d.completed);
  const completedDeadlines = deadlines.filter((d) => d.completed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[var(--tu-border)] bg-[var(--tu-bg-card)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[var(--tu-accent)]/15 text-[var(--tu-accent)] border border-[var(--tu-accent)]/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--tu-text-primary)]">
                Academic Deadlines & Schedule
              </h3>
              <p className="text-xs text-[var(--tu-text-secondary)]">
                Sync TUWEL course deadlines with background OS notification alerts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-primary)] text-xs font-medium cursor-pointer transition-colors shadow-xs"
              title="Export local .ics feed for Apple Calendar, Outlook or Google Calendar"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Calendar (.ics)</span>
            </button>

            <button
              onClick={() => setAgendaOpen(false)}
              className="p-1 rounded text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Export Toast / Status */}
        {exportNotice && (
          <div className="px-5 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 shrink-0" />
            <span className="truncate">{exportNotice}</span>
          </div>
        )}

        {/* Sync Feed Bar */}
        <div className="p-4 border-b border-[var(--tu-border)] bg-[var(--tu-bg-surface)] space-y-3">
          <form onSubmit={handleSync} className="flex gap-2">
            <input
              type="text"
              placeholder="Paste TUWEL iCal Export URL (webcal:// or https://tuwel.tuwien.ac.at/calendar/export_execute.php...)"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] text-xs text-[var(--tu-text-primary)] placeholder-[var(--tu-text-muted)] focus:outline-none focus:border-[var(--tu-accent)] font-mono"
            />
            <button
              type="submit"
              disabled={isLoading || !feedUrl.trim()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] text-xs font-semibold rounded-[var(--tu-radius-sm)] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Sync</span>
            </button>
          </form>

          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between text-xs text-[var(--tu-text-secondary)]">
            <span>
              {activeDeadlines.length} active assignment{activeDeadlines.length === 1 ? "" : "s"} tracked
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 text-[var(--tu-accent)] hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? "Cancel" : "Add Custom Deadline"}</span>
            </button>
          </div>

          {/* Add Custom Deadline Form */}
          {showAddForm && (
            <form
              onSubmit={handleCreateDeadline}
              className="p-3 rounded-lg bg-[var(--tu-bg-card)] border border-[var(--tu-border)] grid grid-cols-1 sm:grid-cols-3 gap-2"
            >
              <input
                type="text"
                placeholder="Course Name (e.g. Algodat)"
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                className="px-2.5 py-1 text-xs rounded bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-[var(--tu-text-primary)]"
              />
              <input
                type="text"
                placeholder="Assignment / Exam Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="px-2.5 py-1 text-xs rounded bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-[var(--tu-text-primary)]"
                required
              />
              <div className="flex gap-2">
                <select
                  value={newHours}
                  onChange={(e) => setNewHours(e.target.value)}
                  className="px-2 py-1 text-xs rounded bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-[var(--tu-text-primary)] cursor-pointer"
                >
                  <option value="2">Due in 2 hours</option>
                  <option value="12">Due in 12 hours</option>
                  <option value="24">Due tomorrow (24h)</option>
                  <option value="72">Due in 3 days</option>
                  <option value="168">Due in 1 week</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1 bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] text-xs font-semibold rounded cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Timeline View */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {activeDeadlines.length === 0 && (
            <div className="text-center py-10 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
              <h4 className="text-sm font-semibold text-[var(--tu-text-primary)]">
                No Pending Deadlines!
              </h4>
              <p className="text-xs text-[var(--tu-text-secondary)]">
                You are all caught up. Paste your TUWEL iCal export URL above to import semester submissions.
              </p>
            </div>
          )}

          {activeDeadlines.map((item) => {
            const countdown = formatCountdown(item.due_date);
            return (
              <div
                key={item.id}
                className="group flex items-center justify-between p-3 rounded-lg bg-[var(--tu-bg-card)] border border-[var(--tu-border)] hover:border-[var(--tu-border-focus)] transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleCompleted(item.id, true)}
                    className="text-[var(--tu-text-muted)] hover:text-emerald-400 cursor-pointer transition-colors"
                    title="Mark as completed"
                  >
                    <Circle className="w-4 h-4" />
                  </button>

                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[var(--tu-text-primary)] flex items-center gap-2">
                      <span>{item.title}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[var(--tu-accent)]/10 text-[var(--tu-accent)] border border-[var(--tu-accent)]/20">
                        {item.course_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[var(--tu-text-muted)]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.due_date).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-tight uppercase flex items-center gap-1 ${
                      countdown.urgent
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse"
                        : "bg-[var(--tu-bg-surface)] text-[var(--tu-text-secondary)] border border-[var(--tu-border)]"
                    }`}
                  >
                    {countdown.urgent && <AlertTriangle className="w-2.5 h-2.5" />}
                    <span>{countdown.label}</span>
                  </span>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors cursor-pointer"
                    title="Open Assignment on TUWEL"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}

          {/* Completed Deadlines */}
          {completedDeadlines.length > 0 && (
            <div className="pt-4 border-t border-[var(--tu-border)] mt-4">
              <h5 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--tu-text-muted)] mb-2">
                Completed ({completedDeadlines.length})
              </h5>
              <div className="space-y-1.5 opacity-60">
                {completedDeadlines.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCompleted(item.id, false)}
                        className="text-emerald-400 cursor-pointer"
                        title="Mark as uncompleted"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <span className="line-through text-[var(--tu-text-muted)]">
                        {item.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
