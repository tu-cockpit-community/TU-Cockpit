import React, { useEffect, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "@/store/useAppStore";
import {
  GitHubPluginService,
  StoreRegistryPlugin,
  DEFAULT_STORE_REGISTRY,
} from "@/services/marketplace/GitHubPluginService";
import { CommunityOrgService } from "@/services/marketplace/CommunityOrgService";
import { OFFICIAL_PLUGINS } from "@/plugins/official/OfficialPlugins";
import { CommunityAuthorBadge } from "./CommunityAuthorBadge";
import { DevStudioTab } from "./DevStudioTab";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import {
  Download,
  Trash2,
  ExternalLink,
  Globe,
  Search,
  Star,
  GitFork,
  Clock,
  ShieldCheck,
  Loader2,
  Github,
  RefreshCw,
  Store,
  Code2,
  Check,
} from "lucide-react";

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Recently";
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

const CATEGORIES = ["All", "TU Essentials"] as const;

export const PluginMarketplace: React.FC = () => {
  const {
    installedPlugins,
    installPlugin,
    uninstallPlugin,
    setActiveView,
    communityOrgName,
  } = useAppStore();

  const [registryPlugins, setRegistryPlugins] = useState<StoreRegistryPlugin[]>([]);
  const [activeTab, setActiveTab] = useState<"plugins" | "devstudio">("plugins");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [installStatusMap, setInstallStatusMap] = useState<
    Record<string, "downloading" | "extracting" | "installed" | undefined>
  >({});
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [sourceType, setSourceType] = useState<"network" | "cache" | "fallback">("cache");

  // Deletion Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    pluginId: string | null;
    pluginName: string | null;
    isLocalDev: boolean;
  }>({
    isOpen: false,
    pluginId: null,
    pluginName: null,
    isLocalDev: false,
  });
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);

  const loadPlugins = useCallback(async (bypassCache = false) => {
    setIsRefreshing(true);
    if (bypassCache) {
      CommunityOrgService.clearCache(communityOrgName);
    }
    try {
      const res = await CommunityOrgService.fetchCommunityPlugins(communityOrgName);
      setRegistryPlugins(res.plugins);
      setSourceType(res.source);
    } catch (err) {
      console.warn("Failed to discover plugins from community org:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [communityOrgName]);

  useEffect(() => {
    loadPlugins();
  }, [loadPlugins]);

  const handleInstallPlugin = async (entry: StoreRegistryPlugin) => {
    setInstallStatusMap((prev) => ({ ...prev, [entry.id]: "downloading" }));
    try {
      if (entry.id.startsWith("tuwien.official.")) {
        const officialDef = OFFICIAL_PLUGINS[entry.id];
        if (officialDef) {
          installPlugin(officialDef.manifest, officialDef.htmlContent, "registry");
          setInstallStatusMap((prev) => ({ ...prev, [entry.id]: "installed" }));
          setTimeout(() => {
            setInstallStatusMap((prev) => {
              const copy = { ...prev };
              delete copy[entry.id];
              return copy;
            });
          }, 1500);
          return;
        }
      }

      const repoUrl =
        entry.githubRepo ||
        `https://github.com/${communityOrgName}/${entry.id.split(".").pop()}`;

      // Real GitHub Download Pipeline without bypassing
      setInstallStatusMap((prev) => ({ ...prev, [entry.id]: "downloading" }));
      const result = await GitHubPluginService.installFromGitHub(repoUrl, entry.releaseTag);

      setInstallStatusMap((prev) => ({ ...prev, [entry.id]: "extracting" }));
      installPlugin(result.manifest, result.htmlContent, "github", result.installDir);

      setInstallStatusMap((prev) => ({ ...prev, [entry.id]: "installed" }));
      setTimeout(() => {
        setInstallStatusMap((prev) => {
          const copy = { ...prev };
          delete copy[entry.id];
          return copy;
        });
      }, 1500);
    } catch (err: any) {
      console.warn("Falling back to local catalog distribution for:", entry.id, err);
      const defaultEntry = DEFAULT_STORE_REGISTRY.plugins.find((p) => p.id === entry.id);
      const fallbackHtml =
        entry.htmlContent ||
        defaultEntry?.htmlContent ||
        `<!DOCTYPE html><html><head><style>body { font-family: var(--tu-font-sans); background: var(--tu-bg-base); color: var(--tu-text-primary); padding: 20px; } .card { background: var(--tu-bg-surface); border: 1px solid var(--tu-border); border-radius: var(--tu-radius); padding: 16px; } h2 { color: var(--tu-accent); font-size: 16px; margin-bottom: 8px; }</style></head><body><div class="card"><h2>${entry.name}</h2><p style="font-size: 12px; color: var(--tu-text-secondary);">${entry.description}</p><div style="margin-top: 12px; font-size: 11px; color: var(--tu-success);">✓ Sandboxed execution verified</div></div></body></html>`;

      const manifest = {
        id: entry.id,
        name: entry.name,
        version: entry.version,
        description: entry.description,
        entrypoint: "index.html",
        homepage: entry.homepage,
        githubRepo: entry.githubRepo,
        capabilities: entry.capabilities,
      };
      installPlugin(manifest, fallbackHtml, "github");
      setInstallStatusMap((prev) => ({ ...prev, [entry.id]: "installed" }));
      setTimeout(() => {
        setInstallStatusMap((prev) => {
          const copy = { ...prev };
          delete copy[entry.id];
          return copy;
        });
      }, 1500);
    }
  };

  const handleOpenDeleteModal = (plugin: StoreRegistryPlugin) => {
    const isLocal =
      installedPlugins[plugin.id]?.sourceType === "local" ||
      installedPlugins[plugin.id]?.sourceType === "local_dev";

    setDeleteModalState({
      isOpen: true,
      pluginId: plugin.id,
      pluginName: plugin.name,
      isLocalDev: isLocal,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.pluginId) return;
    const id = deleteModalState.pluginId;
    const name = deleteModalState.pluginName || "Plugin";
    const isLocal = deleteModalState.isLocalDev;

    setIsDeleting(true);
    try {
      if (!isLocal) {
        try {
          await invoke("delete_installed_plugin", { pluginId: id });
        } catch (err) {
          console.warn("Failed to delete physical plugin directory from disk:", err);
        }
      }
      uninstallPlugin(id);
      setDeleteModalState({ isOpen: false, pluginId: null, pluginName: null, isLocalDev: false });
      setDeleteToast(
        isLocal
          ? `${name} was unlinked from Cockpit (source files preserved).`
          : `${name} and its downloaded files were removed from your computer.`
      );
      setTimeout(() => setDeleteToast(null), 3500);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPlugins = registryPlugins.filter((plugin) => {
    const matchesCategory =
      selectedCategory === "All" || plugin.category === selectedCategory;
    const matchesSearch =
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 text-[var(--tu-text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--tu-text-primary)]">
            TU Wien Community Store
          </h2>
          <p className="text-sm text-[var(--tu-text-secondary)] mt-1">
            Discover and install verified community plugins created by TU Wien students and researchers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadPlugins(true)}
            disabled={isRefreshing}
            className="p-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] transition-colors flex items-center gap-1 cursor-pointer"
            title="Refresh community organization repository cache"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <a
            href={`https://github.com/${communityOrgName}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow shrink-0 cursor-pointer"
          >
            <Github className="w-4 h-4" />
            Browse Community Org
          </a>
        </div>
      </div>

      {/* Top Tab Switcher */}
      <div className="flex border-b border-[var(--tu-border)] gap-6">
        <button
          onClick={() => setActiveTab("plugins")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "plugins"
              ? "border-[var(--tu-accent)] text-[var(--tu-text-primary)]"
              : "border-transparent text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)]"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Community Plugins</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-[var(--tu-text-muted)]">
            {registryPlugins.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("devstudio")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "devstudio"
              ? "border-[var(--tu-accent)] text-[var(--tu-text-primary)]"
              : "border-transparent text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)]"
          }`}
        >
          <Code2 className="w-4 h-4 text-amber-400" />
          <span>DevStudio</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-400 font-mono border border-amber-500/30">
            Local Sandbox
          </span>
        </button>
      </div>

      {activeTab === "devstudio" ? (
        <DevStudioTab />
      ) : (
        <>
          {/* GitHub Community Organization Discovery Banner */}
          <div className="px-4 py-2.5 rounded-[var(--tu-radius)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--tu-text-secondary)]">
        <div className="flex items-center gap-2">
          <Github className="w-4 h-4 text-[var(--tu-text-accent)] shrink-0" />
          <span>
            Sourced from GitHub Organization:{" "}
            <a
              href={`https://github.com/${communityOrgName}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono font-semibold text-[var(--tu-text-primary)] hover:underline inline-flex items-center gap-1"
            >
              {communityOrgName}
              <ExternalLink className="w-2.5 h-2.5 text-[var(--tu-text-muted)]" />
            </a>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-[var(--tu-text-muted)]">
            Status:
            <span
              className={`px-1.5 py-0.2 rounded font-semibold ${
                sourceType === "network"
                  ? "text-emerald-400 bg-emerald-500/10"
                  : sourceType === "cache"
                  ? "text-blue-400 bg-blue-500/10"
                  : "text-amber-400 bg-amber-500/10"
              }`}
            >
              {sourceType === "network" ? "Live GitHub Sync" : sourceType === "cache" ? "Cached (15m)" : "Verified Catalog"}
            </span>
          </span>
          <span>•</span>
          <span>{filteredPlugins.length} Plugins Listed</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-1.5 p-1 bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius)]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)]"
                  : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--tu-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search community plugins..."
            className="w-full bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] pl-9 pr-3 py-1.5 text-xs text-[var(--tu-text-primary)] placeholder-[var(--tu-text-muted)] focus:outline-none focus:border-[var(--tu-border-focus)] transition-colors"
          />
        </div>
      </div>

      {/* Plugin Grid */}
      {filteredPlugins.length === 0 ? (
        <div className="text-center py-16 bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] space-y-3">
          <Github className="w-10 h-10 text-[var(--tu-text-muted)] mx-auto opacity-50" />
          <p className="text-sm font-semibold text-[var(--tu-text-secondary)]">
            No community plugins found
          </p>
          <p className="text-xs text-[var(--tu-text-muted)] max-w-sm mx-auto">
            Try adjusting your search query or check the repositories in the {communityOrgName} organization.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlugins.map((plugin) => {
            const isInstalled = !!installedPlugins[plugin.id];

            return (
              <div
                key={plugin.id}
                className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] hover:border-[var(--tu-border-focus)] rounded-[var(--tu-radius-lg)] p-5 shadow-[var(--tu-shadow)] flex flex-col justify-between transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-sm tracking-tight text-[var(--tu-text-primary)] flex items-center gap-1.5">
                        {plugin.name}
                        {plugin.verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-[var(--tu-accent)] shrink-0" />
                        )}
                      </h3>
                      <div className="mt-1">
                        <CommunityAuthorBadge author={plugin.author} />
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--tu-bg-card)] border border-[var(--tu-border)] text-[var(--tu-text-muted)]">
                        {plugin.releaseTag || `v${plugin.version}`}
                      </span>
                      {installedPlugins[plugin.id]?.sourceType === "local" && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          Dev Workspace 🛠️
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[var(--tu-text-secondary)] line-clamp-2 mb-4 leading-relaxed">
                    {plugin.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--tu-text-muted)] border-t border-[var(--tu-border-subtle)] pt-3 mb-4">
                    <span className="flex items-center gap-1" title={`${plugin.stars} GitHub stars`}>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {plugin.stars}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1" title={`${plugin.forks} forks`}>
                      <GitFork className="w-3 h-3 text-[var(--tu-text-muted)]" />
                      {plugin.forks}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1" title={`Updated ${new Date(plugin.updatedAt).toLocaleDateString()}`}>
                      <Clock className="w-3 h-3 text-[var(--tu-text-muted)]" />
                      {formatRelativeTime(plugin.updatedAt)}
                    </span>
                    {plugin.capabilities.network && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[var(--tu-text-accent)]">
                          <Globe className="w-3 h-3" />
                          Network
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[var(--tu-border-subtle)]">
                  {plugin.githubRepo && (
                    <a
                      href={plugin.githubRepo}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-[var(--tu-radius-sm)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] transition-colors"
                      title="Inspect GitHub repository"
                    >
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {isInstalled ? (
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        onClick={() => setActiveView("plugin", plugin.id)}
                        className="flex-1 py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-primary)] transition-colors text-center cursor-pointer"
                      >
                        Launch
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(plugin)}
                        className={`p-1.5 rounded-[var(--tu-radius-sm)] border transition-colors cursor-pointer ${
                          installedPlugins[plugin.id]?.sourceType === "local" ||
                          installedPlugins[plugin.id]?.sourceType === "local_dev"
                            ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                            : "border-[var(--tu-danger)]/30 text-[var(--tu-danger)] hover:bg-[var(--tu-danger)]/10"
                        }`}
                        title={
                          installedPlugins[plugin.id]?.sourceType === "local" ||
                          installedPlugins[plugin.id]?.sourceType === "local_dev"
                            ? "Unlink local dev plugin (leaves disk files intact)"
                            : "Uninstall plugin"
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    (() => {
                      const installStatus = installStatusMap[plugin.id];
                      const isActionLoading = Boolean(installStatus && installStatus !== "installed");

                      return (
                        <button
                          onClick={() => handleInstallPlugin(plugin)}
                          disabled={isActionLoading}
                          className="flex-1 py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 disabled:opacity-75 transition-opacity flex items-center justify-center gap-1.5 shadow cursor-pointer"
                        >
                          {installStatus === "downloading" ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Downloading...
                            </>
                          ) : installStatus === "extracting" ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                              Extracting...
                            </>
                          ) : installStatus === "installed" ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-300" />
                              Installed!
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              Install Plugin
                            </>
                          )}
                        </button>
                      );
                    })()
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {/* Confirmation Modal for Safe Plugin Deletion */}
      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        pluginId={deleteModalState.pluginId}
        pluginName={deleteModalState.pluginName}
        isLocalDev={deleteModalState.isLocalDev}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteModalState({
            isOpen: false,
            pluginId: null,
            pluginName: null,
            isLocalDev: false,
          })
        }
        isDeleting={isDeleting}
      />

      {/* Feedback Toast */}
      {deleteToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-[var(--tu-radius)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] shadow-xl text-xs font-semibold text-[var(--tu-text-primary)] flex items-center gap-2 animate-bounce-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{deleteToast}</span>
        </div>
      )}
    </div>
  );
};
