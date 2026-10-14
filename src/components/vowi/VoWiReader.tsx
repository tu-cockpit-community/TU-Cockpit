import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  BookOpen,
  ExternalLink,
  ChevronLeft,
  GraduationCap,
  Sparkles,
  Layers,
  ArrowRight,
  RotateCw,
  X,
  FileText,
  User,
  List,
} from "lucide-react";
import { open } from "@tauri-apps/plugin-shell";
import {
  VoWiApiService,
  VoWiSearchResult,
  VoWiPageContent,
  POPULAR_VOWI_COURSES,
} from "@/services/vowi/VoWiApiService";

interface VoWiReaderProps {
  onOpenLivePortal?: () => void;
  initialCourseTitle?: string;
}

export const VoWiReader: React.FC<VoWiReaderProps> = ({
  onOpenLivePortal,
  initialCourseTitle,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<VoWiSearchResult[]>(POPULAR_VOWI_COURSES);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(
    initialCourseTitle || "TU Wien:Algorithmen und Datenstrukturen VU (Peitl)"
  );
  const [pageContent, setPageContent] = useState<VoWiPageContent | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showToc, setShowToc] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  // Debounced course search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }

    if (!val.trim()) {
      setSearchResults(POPULAR_VOWI_COURSES);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        const results = await VoWiApiService.searchCourses(val);
        setSearchResults(results);
      } catch (err) {
        console.error("VoWi search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 280);
  };

  // Load page content
  const loadPage = useCallback(async (title: string, addToHistory = true) => {
    setIsLoadingPage(true);
    setPageError(null);
    try {
      const content = await VoWiApiService.fetchPageContent(title);
      setPageContent(content);
      setSelectedTitle(content.title);
      if (addToHistory && selectedTitle && selectedTitle !== content.title) {
        setHistory((prev) => [...prev, selectedTitle]);
      }
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    } catch (err: any) {
      console.error("Failed to load VoWi page:", err);
      setPageError(err.message || "Failed to load course information from VoWi MediaWiki.");
    } finally {
      setIsLoadingPage(false);
    }
  }, [selectedTitle]);

  useEffect(() => {
    if (selectedTitle) {
      loadPage(selectedTitle, false);
    }
  }, []);

  const handleGoBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    loadPage(prev, false);
  };

  const handleOpenExternal = async (targetUrl?: string) => {
    const url = targetUrl || pageContent?.url || "https://vowi.fsinf.at";
    try {
      await open(url);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Intercept click on rendered HTML links
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");
    if (!anchor) return;

    const wikiPage = anchor.getAttribute("data-wiki-page");
    const href = anchor.getAttribute("href");

    if (wikiPage) {
      e.preventDefault();
      loadPage(wikiPage, true);
    } else if (href && href.startsWith("#")) {
      // Internal section anchor: allow default hash scroll
      const elem = document.getElementById(href.slice(1));
      if (elem) {
        e.preventDefault();
        elem.scrollIntoView({ behavior: "smooth" });
      }
    } else if (href && href.startsWith("http")) {
      e.preventDefault();
      handleOpenExternal(href);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] overflow-hidden shadow-[var(--tu-shadow)]">
      {/* Top Application Bar */}
      <div className="h-11 border-b border-[var(--tu-border)] bg-[var(--tu-bg-card)] px-3 flex items-center justify-between shrink-0 select-none text-xs gap-3">
        {/* Left: Branding, Back, and Active Page Title */}
        <div className="flex items-center gap-2 min-w-0">
          {history.length > 0 && (
            <button
              onClick={handleGoBack}
              className="p-1 rounded text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors cursor-pointer"
              title="Go back to previous VoWi page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] shrink-0">
            <BookOpen className="w-3 h-3" />
            <span>VoWi Reader</span>
          </div>

          {pageContent && (
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="font-semibold text-[var(--tu-text-primary)] truncate max-w-[200px] sm:max-w-xs">
                {pageContent.displayTitle}
              </span>
              {pageContent.ects && (
                <span className="hidden sm:inline-flex px-1.5 py-0.2 rounded bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-[10px] font-mono text-[var(--tu-accent)] font-medium">
                  {pageContent.ects} ECTS
                </span>
              )}
              {pageContent.lvaType && (
                <span className="hidden sm:inline-flex px-1.5 py-0.2 rounded bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-[10px] font-mono text-[var(--tu-text-secondary)] font-medium">
                  {pageContent.lvaType}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {pageContent && pageContent.sections.length > 0 && (
            <button
              onClick={() => setShowToc((v) => !v)}
              className={`flex items-center gap-1 px-2 py-1 rounded-[var(--tu-radius-sm)] border text-[11px] transition-colors cursor-pointer ${
                showToc
                  ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] border-[var(--tu-accent)]"
                  : "bg-[var(--tu-bg-surface)] border-[var(--tu-border)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
              }`}
              title="Toggle Table of Contents"
            >
              <List className="w-3 h-3" />
              <span className="hidden md:inline">Sections</span>
            </button>
          )}

          {pageContent && (
            <button
              onClick={() => loadPage(pageContent.title, false)}
              className="p-1 rounded text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors cursor-pointer"
              title="Refresh course data"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoadingPage ? "animate-spin" : ""}`} />
            </button>
          )}

          {onOpenLivePortal && (
            <button
              onClick={onOpenLivePortal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)]/15 border border-[var(--tu-accent)]/30 text-[var(--tu-accent)] hover:bg-[var(--tu-accent)]/25 font-medium transition-colors cursor-pointer text-[11px]"
              title="Switch to full live interactive wiki webview"
            >
              <Layers className="w-3 h-3" />
              <span>Live Portal</span>
            </button>
          )}

          <button
            onClick={() => handleOpenExternal()}
            className="flex items-center gap-1 px-2 py-1 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] transition-colors cursor-pointer text-[11px]"
            title="Open VoWi page in external browser"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden lg:inline">Browser</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Master-Detail Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Search & Course Selection Sidebar */}
        <div className="w-72 sm:w-80 border-r border-[var(--tu-border)] bg-[var(--tu-bg-surface)] flex flex-col shrink-0 select-none">
          {/* Search Header */}
          <div className="p-3 border-b border-[var(--tu-border)]">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-[var(--tu-text-muted)] absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search VoWi courses (e.g. Algo, Analysis)..."
                className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius-sm)] pl-8 pr-7 py-1.5 text-xs text-[var(--tu-text-primary)] placeholder:text-[var(--tu-text-muted)] focus:outline-none focus:border-[var(--tu-accent)] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults(POPULAR_VOWI_COURSES);
                  }}
                  className="absolute right-2 text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-[var(--tu-text-muted)] px-0.5">
              <span>{searchQuery ? "Search Results" : "Featured TU Wien Courses"}</span>
              {isSearching && <span className="animate-pulse">Searching VoWi...</span>}
            </div>
          </div>

          {/* Search Results List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--tu-border)]/50 p-1">
            {searchResults.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--tu-text-muted)]">
                <p>No courses found for "{searchQuery}".</p>
                <p className="mt-1 text-[11px]">Try course abbreviations like "AlgoDat", "EPROG", or "VU".</p>
              </div>
            ) : (
              searchResults.map((item) => {
                const isSelected = selectedTitle === item.title;
                return (
                  <button
                    key={item.title}
                    onClick={() => loadPage(item.title, true)}
                    className={`w-full text-left p-2.5 rounded-[var(--tu-radius-sm)] transition-colors cursor-pointer group flex flex-col gap-1 ${
                      isSelected
                        ? "bg-[var(--tu-accent)]/15 border-l-2 border-[var(--tu-accent)]"
                        : "hover:bg-[var(--tu-bg-hover)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`font-medium text-xs truncate ${
                          isSelected
                            ? "text-[var(--tu-accent)] font-semibold"
                            : "text-[var(--tu-text-primary)] group-hover:text-[var(--tu-text-accent)]"
                        }`}
                      >
                        {item.displayTitle}
                      </span>
                      <ArrowRight className="w-3 h-3 text-[var(--tu-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    {item.snippet && (
                      <div
                        className="text-[11px] text-[var(--tu-text-secondary)] line-clamp-2 leading-relaxed opacity-85"
                        dangerouslySetInnerHTML={{ __html: item.snippet }}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Article Viewer Panel */}
        <div
          ref={contentRef}
          onClick={handleContentClick}
          className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[var(--tu-bg-base)] text-[var(--tu-text-primary)] relative"
        >
          {isLoadingPage ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-60">
              <RotateCw className="w-8 h-8 text-[var(--tu-accent)] animate-spin" />
              <p className="text-xs font-medium text-[var(--tu-text-secondary)]">
                Fetching article from vowi.fsinf.at MediaWiki...
              </p>
            </div>
          ) : pageError ? (
            <div className="max-w-xl mx-auto p-6 mt-12 bg-rose-500/10 border border-rose-500/30 rounded-[var(--tu-radius-md)] text-center space-y-3">
              <h3 className="font-semibold text-rose-500 text-sm">Failed to Load Course Article</h3>
              <p className="text-xs text-[var(--tu-text-secondary)]">{pageError}</p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => pageContent && loadPage(pageContent.title, false)}
                  className="px-3 py-1.5 bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] rounded text-xs font-medium"
                >
                  Retry
                </button>
                {onOpenLivePortal && (
                  <button
                    onClick={onOpenLivePortal}
                    className="px-3 py-1.5 bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-xs font-medium rounded"
                  >
                    Open in Live Webview
                  </button>
                )}
              </div>
            </div>
          ) : pageContent ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Course Title & Metadata Hero */}
              <div className="border-b border-[var(--tu-border)] pb-4 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium text-[11px] flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    TU Wien MediaWiki
                  </span>
                  {pageContent.ects && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] text-[11px] font-mono text-[var(--tu-text-secondary)]">
                      {pageContent.ects} ECTS
                    </span>
                  )}
                  {pageContent.lvaType && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] text-[11px] font-mono text-[var(--tu-text-secondary)]">
                      {pageContent.lvaType}
                    </span>
                  )}
                  {pageContent.professors && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] text-[11px] text-[var(--tu-text-secondary)] flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {pageContent.professors}
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--tu-text-primary)]">
                  {pageContent.displayTitle}
                </h1>

                <p className="text-xs text-[var(--tu-text-muted)] flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>MediaWiki Source: {pageContent.title}</span>
                </p>
              </div>

              {/* Table of Contents Floating Popover / Sidebar if toggled */}
              {showToc && pageContent.sections.length > 0 && (
                <div className="p-3.5 bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius-md)] text-xs space-y-1.5 shadow-sm">
                  <div className="font-semibold text-[var(--tu-text-secondary)] uppercase text-[10px] tracking-wider mb-2">
                    Contents
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
                    {pageContent.sections.map((s) => (
                      <a
                        key={s.index}
                        href={`#${s.anchor}`}
                        className="text-[var(--tu-accent)] hover:underline truncate py-0.5"
                      >
                        {s.line}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Rendered HTML Container with Tailored MediaWiki Styling */}
              <div
                className="vowi-article-content prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: pageContent.html }}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-2 opacity-60">
              <Sparkles className="w-10 h-10 text-[var(--tu-accent)]" />
              <p className="text-sm font-semibold text-[var(--tu-text-primary)]">
                Select a course on the left to read student tips and exam summaries
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
