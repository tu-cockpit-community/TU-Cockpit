import React, { useState, useEffect } from "react";
import { useVaultStore } from "@/store/useVaultStore";
import {
  FolderArchive,
  Search,
  FileText,
  Download,
  Layers,
  Sparkles,
  ExternalLink,
  X,
  HardDrive,
} from "lucide-react";

export const OfflineVaultView: React.FC = () => {
  const {
    cachedFiles,
    searchResults,
    searchQuery,
    isSearching,
    isVaultModalOpen,
    setVaultModalOpen,
    fetchCachedFiles,
    searchSlides,
    cachePdf,
    openPdf,
  } = useVaultStore();

  const [activeTab, setActiveTab] = useState<"files" | "search">("files");
  const [downloadCourseId, setDownloadCourseId] = useState("188.956");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadFilename, setDownloadFilename] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (isVaultModalOpen) {
      fetchCachedFiles();
    }
  }, [isVaultModalOpen, fetchCachedFiles]);

  if (!isVaultModalOpen) return null;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    searchSlides(q);
    if (q.trim()) {
      setActiveTab("search");
    }
  };

  const handleCacheSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadFilename.trim()) return;
    await cachePdf(
      downloadCourseId,
      downloadUrl.trim() || "https://tuwel.tuwien.ac.at",
      downloadFilename.trim()
    );
    setDownloadFilename("");
    setDownloadUrl("");
    setShowAddModal(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Group files by course
  const courseGroups = cachedFiles.reduce((acc, file) => {
    if (!acc[file.course_id]) {
      acc[file.course_id] = { name: file.course_name, files: [] };
    }
    acc[file.course_id].files.push(file);
    return acc;
  }, {} as Record<string, { name: string; files: typeof cachedFiles }>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--tu-border)] bg-[var(--tu-bg-card)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[var(--tu-accent)]/15 text-[var(--tu-accent)] border border-[var(--tu-accent)]/30">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--tu-text-primary)]">
                Offline Lecture Material Vault
              </h3>
              <p className="text-xs text-[var(--tu-text-secondary)]">
                SQLite FTS5 full-text indexing for offline slide search on trains & lecture halls
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(!showAddModal)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cache Slides</span>
            </button>

            <button
              onClick={() => setVaultModalOpen(false)}
              className="p-1 rounded text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar & Tabs */}
        <div className="p-4 border-b border-[var(--tu-border)] bg-[var(--tu-bg-surface)] space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--tu-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search across all offline slides (e.g. Quicksort, Dijkstra, Analysis, Integral)..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] text-xs text-[var(--tu-text-primary)] placeholder-[var(--tu-text-muted)] focus:outline-none focus:border-[var(--tu-accent)] font-medium"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-[var(--tu-accent)]/30 border-t-[var(--tu-accent)] rounded-full animate-spin" />
            )}
          </div>

          {/* Quick Tabs */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab("files")}
              className={`px-3 py-1 rounded-[var(--tu-radius-sm)] font-medium transition-colors cursor-pointer ${
                activeTab === "files"
                  ? "bg-[var(--tu-accent)]/15 text-[var(--tu-accent)] border border-[var(--tu-accent)]/30"
                  : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)]"
              }`}
            >
              Cached Materials ({cachedFiles.length})
            </button>
            <button
              onClick={() => setActiveTab("search")}
              className={`px-3 py-1 rounded-[var(--tu-radius-sm)] font-medium transition-colors cursor-pointer ${
                activeTab === "search"
                  ? "bg-[var(--tu-accent)]/15 text-[var(--tu-accent)] border border-[var(--tu-accent)]/30"
                  : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)]"
              }`}
            >
              Search Results ({searchResults.length})
            </button>
          </div>

          {/* Cache Modal / Form */}
          {showAddModal && (
            <form
              onSubmit={handleCacheSubmit}
              className="p-3.5 rounded-lg bg-[var(--tu-bg-card)] border border-[var(--tu-border)] space-y-2.5 animate-in fade-in"
            >
              <div className="text-xs font-bold text-[var(--tu-text-primary)]">
                Cache Course Material for Offline Access
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={downloadCourseId}
                  onChange={(e) => setDownloadCourseId(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-[var(--tu-text-primary)] cursor-pointer"
                >
                  <option value="188.956">188.956 Algodat</option>
                  <option value="104.261">104.261 Analysis 1</option>
                  <option value="185.A48">185.A48 Technische Informatik</option>
                </select>
                <input
                  type="text"
                  placeholder="Filename (e.g. Vorlesung_03.pdf)"
                  value={downloadFilename}
                  onChange={(e) => setDownloadFilename(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-[var(--tu-text-primary)]"
                  required
                />
                <input
                  type="text"
                  placeholder="URL or Local File Path"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-[var(--tu-text-primary)]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1 text-xs text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] text-xs font-semibold rounded cursor-pointer"
                >
                  Download & Index
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* FTS Search Results Tab */}
          {activeTab === "search" && (
            <div className="space-y-2">
              {searchResults.length === 0 && (
                <div className="text-center py-10 space-y-2">
                  <Sparkles className="w-8 h-8 text-[var(--tu-text-muted)] mx-auto opacity-50" />
                  <p className="text-xs text-[var(--tu-text-secondary)]">
                    {searchQuery.trim()
                      ? `No slide text matches found for "${searchQuery}"`
                      : "Type keywords above to search all indexed slide text."}
                  </p>
                </div>
              )}

              {searchResults.map((res, idx) => (
                <div
                  key={`${res.file_path}_${res.page_number}_${idx}`}
                  onClick={() => openPdf(res.file_path, res.file_name, res.page_number)}
                  className="p-3 rounded-lg bg-[var(--tu-bg-card)] border border-[var(--tu-border)] hover:border-[var(--tu-border-focus)] transition-all cursor-pointer group shadow-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[var(--tu-accent)]" />
                      <span className="font-bold text-[var(--tu-text-primary)] group-hover:text-[var(--tu-text-accent)] transition-colors">
                        {res.file_name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--tu-accent)]/10 text-[var(--tu-accent)] border border-[var(--tu-accent)]/20 font-semibold">
                        Page {res.page_number}
                      </span>
                    </div>

                    <span className="text-[11px] text-[var(--tu-text-muted)] flex items-center gap-1 group-hover:text-[var(--tu-text-primary)]">
                      <span>Open in Reader</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>

                  <div
                    className="text-xs text-[var(--tu-text-secondary)] bg-[var(--tu-bg-surface)] p-2 rounded border border-[var(--tu-border)] leading-relaxed font-mono"
                    dangerouslySetInnerHTML={{ __html: res.snippet }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Files Explorer Tab */}
          {activeTab === "files" && (
            <div className="space-y-4">
              {Object.keys(courseGroups).length === 0 && (
                <div className="text-center py-10 space-y-2">
                  <HardDrive className="w-10 h-10 text-[var(--tu-text-muted)] mx-auto opacity-60" />
                  <h4 className="text-sm font-semibold text-[var(--tu-text-primary)]">
                    No Offline Materials Cached Yet
                  </h4>
                  <p className="text-xs text-[var(--tu-text-secondary)]">
                    Click "Cache Slides" above to download PDF lecture slides for offline studying.
                  </p>
                </div>
              )}

              {Object.entries(courseGroups).map(([courseId, group]) => (
                <div key={courseId} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--tu-text-primary)]">
                    <Layers className="w-3.5 h-3.5 text-[var(--tu-accent)]" />
                    <span>{group.name}</span>
                    <span className="text-[10px] text-[var(--tu-text-muted)] font-mono">
                      ({courseId})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.files.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => openPdf(file.file_path, file.filename, 1)}
                        className="p-3 rounded-lg bg-[var(--tu-bg-card)] border border-[var(--tu-border)] hover:border-[var(--tu-border-focus)] transition-all cursor-pointer group shadow-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FileText className="w-4 h-4 text-[var(--tu-accent)] shrink-0" />
                          <div className="truncate">
                            <div className="text-xs font-semibold text-[var(--tu-text-primary)] group-hover:text-[var(--tu-text-accent)] transition-colors truncate">
                              {file.filename}
                            </div>
                            <div className="text-[10px] text-[var(--tu-text-muted)] flex items-center gap-2">
                              <span>{formatFileSize(file.file_size)}</span>
                              <span>•</span>
                              <span>{new Date(file.cached_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <ExternalLink className="w-3.5 h-3.5 text-[var(--tu-text-muted)] group-hover:text-[var(--tu-text-primary)] shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
