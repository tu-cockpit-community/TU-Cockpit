import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  Store,
  GraduationCap,
  Layers,
  BookOpen,
  MapPin,
  Puzzle,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  FolderPlus,
  Trash2,
  Folder,
  SlidersHorizontal,
} from "lucide-react";

export const ConfigurableNav: React.FC = () => {
  const {
    navOrientation,
    activeView,
    activePluginId,
    installedPlugins,
    categories,
    setActiveView,
    toggleCategoryCollapse,
    setCategoryModalOpen,
    setGitHubInstallModalOpen,
    uninstallPlugin,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");

  const getPluginIcon = (id: string) => {
    if (id.includes("tuwel")) return <GraduationCap className="w-4 h-4 shrink-0" />;
    if (id.includes("tiss")) return <Layers className="w-4 h-4 shrink-0" />;
    if (id.includes("vowi")) return <BookOpen className="w-4 h-4 shrink-0" />;
    if (id.includes("tumaps") || id.includes("map")) return <MapPin className="w-4 h-4 shrink-0" />;
    return <Puzzle className="w-4 h-4 shrink-0" />;
  };

  // Vertical Sidebar Rendering (Left or Right)
  if (navOrientation === "left" || navOrientation === "right") {
    const borderSide = navOrientation === "left" ? "border-r" : "border-l";

    return (
      <aside
        className={`w-64 h-full bg-[var(--tu-bg-surface)] ${borderSide} border-[var(--tu-border)] flex flex-col shrink-0 select-none z-20 transition-all duration-200`}
      >
        {/* Top: Marketplace Anchor */}
        <div className="p-3 border-b border-[var(--tu-border)] space-y-2">
          <button
            onClick={() => setActiveView("marketplace")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-[var(--tu-radius-sm)] text-xs font-semibold transition-all cursor-pointer ${
              activeView === "marketplace"
                ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] shadow-md"
                : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
            }`}
          >
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              <span>Community Store</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-black/20 text-current">
              Hub
            </span>
          </button>

          {/* Quick Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[var(--tu-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter workstation..."
              className="w-full bg-[var(--tu-bg-card)] border border-[var(--tu-border)] rounded-[var(--tu-radius-sm)] pl-8 pr-2.5 py-1 text-xs text-[var(--tu-text-primary)] placeholder-[var(--tu-text-muted)] focus:outline-none focus:border-[var(--tu-border-focus)] font-sans"
            />
          </div>
        </div>

        {/* Categories Accordions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {categories.map((cat) => {
            const pluginList = cat.pluginIds
              .map((id) => installedPlugins[id])
              .filter(Boolean)
              .filter((p) =>
                p.manifest.name.toLowerCase().includes(searchQuery.toLowerCase())
              );

            return (
              <div key={cat.id} className="space-y-1">
                {/* Accordion Header */}
                <button
                  onClick={() => toggleCategoryCollapse(cat.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[var(--tu-radius-sm)] text-[11px] font-semibold text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5">
                    {cat.isCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--tu-text-muted)]" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-[var(--tu-text-muted)]" />
                    )}
                    <Folder className="w-3.5 h-3.5 text-[var(--tu-text-accent)]" />
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--tu-text-muted)]">
                    {pluginList.length}
                  </span>
                </button>

                {/* Plugin Items in Category */}
                {!cat.isCollapsed && (
                  <div className="pl-4 pr-1 space-y-0.5">
                    {pluginList.length === 0 ? (
                      <div className="px-2 py-1 text-[11px] text-[var(--tu-text-muted)] italic">
                        No tools installed
                      </div>
                    ) : (
                      pluginList.map((p) => {
                        const isPluginActive =
                          activeView === "plugin" && activePluginId === p.manifest.id;

                        return (
                          <div
                            key={p.manifest.id}
                            className="group flex items-center justify-between rounded-[var(--tu-radius-sm)] overflow-hidden"
                          >
                            <button
                              onClick={() => setActiveView("plugin", p.manifest.id)}
                              className={`flex-1 flex items-center gap-2 px-2 py-1.5 text-xs text-left truncate transition-colors cursor-pointer ${
                                isPluginActive
                                  ? "bg-[var(--tu-accent)]/15 text-[var(--tu-accent)] font-semibold"
                                  : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
                              }`}
                            >
                              {getPluginIcon(p.manifest.id)}
                              <span className="truncate">{p.manifest.name}</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                uninstallPlugin(p.manifest.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-[var(--tu-text-muted)] hover:text-[var(--tu-danger)] transition-all cursor-pointer"
                              title="Uninstall plugin"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-2 border-t border-[var(--tu-border)] space-y-1">
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--tu-radius-sm)] text-[11px] font-semibold text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[var(--tu-accent)]" />
            <span>Manage Categories</span>
          </button>
          <button
            onClick={() => setGitHubInstallModalOpen(true)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--tu-radius-sm)] text-[11px] font-semibold text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--tu-text-accent)]" />
            <span>Direct GitHub Install</span>
          </button>
        </div>
      </aside>
    );
  }

  // Horizontal Dock / Bar (Bottom or Top)
  const isBottom = navOrientation === "bottom";
  const positionClass = isBottom ? "bottom-4 left-1/2 -translate-x-1/2" : "top-14 left-1/2 -translate-x-1/2";

  const allInstalled = Object.values(installedPlugins);

  return (
    <div className={`fixed ${positionClass} z-40 select-none animate-in fade-in duration-200`}>
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[var(--tu-bg-surface)]/90 backdrop-blur-md border border-[var(--tu-border)] rounded-2xl shadow-2xl transition-all duration-300">
        {/* Marketplace */}
        <button
          onClick={() => setActiveView("marketplace")}
          title="Community Marketplace"
          className={`relative group flex flex-col items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 cursor-pointer ${
            activeView === "marketplace"
              ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] shadow-lg shadow-[var(--tu-accent)]/20"
              : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
          }`}
        >
          <Store className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
          {activeView === "marketplace" && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--tu-accent-contrast)]" />
          )}
          <span className="pointer-events-none absolute -top-8 px-2 py-0.5 text-[10px] font-medium rounded whitespace-nowrap bg-[var(--tu-bg-card)] text-[var(--tu-text-primary)] border border-[var(--tu-border)] opacity-0 -translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 shadow-md">
            Marketplace
          </span>
        </button>

        {allInstalled.length > 0 && <div className="w-[1px] h-6 bg-[var(--tu-border)] mx-1" />}

        {/* Installed Plugins */}
        {allInstalled.map((p) => {
          const isPluginActive = activeView === "plugin" && activePluginId === p.manifest.id;
          return (
            <button
              key={p.manifest.id}
              onClick={() => setActiveView("plugin", p.manifest.id)}
              title={p.manifest.name}
              className={`relative group flex flex-col items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 cursor-pointer ${
                isPluginActive
                  ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] shadow-lg shadow-[var(--tu-accent)]/20"
                  : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
              }`}
            >
              {getPluginIcon(p.manifest.id)}
              {isPluginActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--tu-accent-contrast)]" />
              )}
              <span className="pointer-events-none absolute -top-8 px-2 py-0.5 text-[10px] font-medium rounded whitespace-nowrap bg-[var(--tu-bg-card)] text-[var(--tu-text-primary)] border border-[var(--tu-border)] opacity-0 -translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 shadow-md">
                {p.manifest.name}
              </span>
            </button>
          );
        })}

        <div className="w-[1px] h-6 bg-[var(--tu-border)] mx-1" />

        {/* Manage Categories Button */}
        <button
          onClick={() => setCategoryModalOpen(true)}
          title="Manage Categories"
          className="relative group flex items-center justify-center w-9 h-9 rounded-xl text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-all cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="pointer-events-none absolute -top-8 px-2 py-0.5 text-[10px] font-medium rounded whitespace-nowrap bg-[var(--tu-bg-card)] text-[var(--tu-text-primary)] border border-[var(--tu-border)] opacity-0 -translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 shadow-md">
            Categories
          </span>
        </button>

        {/* Direct GitHub Install */}
        <button
          onClick={() => setGitHubInstallModalOpen(true)}
          title="Direct GitHub Install"
          className="relative group flex items-center justify-center w-9 h-9 rounded-xl text-[var(--tu-text-muted)] hover:text-[var(--tu-text-accent)] hover:bg-[var(--tu-bg-hover)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="pointer-events-none absolute -top-8 px-2 py-0.5 text-[10px] font-medium rounded whitespace-nowrap bg-[var(--tu-bg-card)] text-[var(--tu-text-primary)] border border-[var(--tu-border)] opacity-0 -translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 shadow-md">
            Install from GitHub
          </span>
        </button>
      </div>
    </div>
  );
};
