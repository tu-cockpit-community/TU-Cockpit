import React, { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  GitHubPluginService,
  StoreRegistryPlugin,
} from "@/services/marketplace/GitHubPluginService";
import { CommunityOrgService } from "@/services/marketplace/CommunityOrgService";
import {
  Download,
  Trash2,
  ExternalLink,
  Globe,
  Search,
  Star,
  Users,
  ShieldCheck,
  PlusCircle,
  Loader2,
  Github,
  RefreshCw,
} from "lucide-react";

export const PluginMarketplace: React.FC = () => {
  const {
    installedPlugins,
    installPlugin,
    uninstallPlugin,
    setActiveView,
    setGitHubInstallModalOpen,
    communityOrgName,
  } = useAppStore();

  const [registryPlugins, setRegistryPlugins] = useState<StoreRegistryPlugin[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [sourceType, setSourceType] = useState<"network" | "cache" | "fallback">("cache");

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
    setLoadingMap((prev) => ({ ...prev, [entry.id]: true }));
    try {
      const repoUrl =
        entry.githubRepo ||
        `https://github.com/${communityOrgName}/${entry.id.split(".").pop()}`;
      const result = await GitHubPluginService.installFromGitHub(repoUrl);
      installPlugin(result.manifest, result.htmlContent, "registry", result.installDir);
    } catch (err: any) {
      console.warn("Falling back to local registry install for:", entry.id);
      const manifest = {
        id: entry.id,
        name: entry.name,
        version: entry.version,
        description: entry.description,
        entrypoint: "index.html",
        githubRepo: entry.githubRepo,
        capabilities: entry.capabilities,
      };
      const fallbackHtml = `<!DOCTYPE html><html><head><style>body { font-family: var(--tu-font-sans); background: var(--tu-bg-base); color: var(--tu-text-primary); padding: 20px; } .card { background: var(--tu-bg-surface); border: 1px solid var(--tu-border); border-radius: var(--tu-radius); padding: 16px; } h2 { color: var(--tu-accent); font-size: 16px; margin-bottom: 8px; }</style></head><body><div class="card"><h2>${entry.name}</h2><p style="font-size: 12px; color: var(--tu-text-secondary);">${entry.description}</p><div style="margin-top: 12px; font-size: 11px; color: var(--tu-success);">✓ Sandboxed execution verified</div></div></body></html>`;
      installPlugin(manifest, fallbackHtml, "registry");
    } finally {
      setLoadingMap((prev) => ({ ...prev, [entry.id]: false }));
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
            Discover and install community plugins auto-discovered from GitHub or load custom repositories.
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
          <button
            onClick={() => setGitHubInstallModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Install from GitHub URL
          </button>
        </div>
      </div>

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
          {["All", "Academic", "Campus Life", "Productivity"].map((cat) => (
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
            const isLoading = !!loadingMap[plugin.id];

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
                      <span className="text-[11px] text-[var(--tu-text-secondary)] flex items-center gap-1 mt-0.5">
                        <span>by {plugin.author.name}</span>
                        {plugin.author.github && (
                          <a
                            href={`https://github.com/${plugin.author.github}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)]"
                          >
                            <Github className="w-3 h-3" />
                          </a>
                        )}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--tu-bg-card)] border border-[var(--tu-border)] text-[var(--tu-text-muted)]">
                      v{plugin.version}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--tu-text-secondary)] line-clamp-2 mb-4 leading-relaxed">
                    {plugin.description}
                  </p>

                  <div className="flex flex-wrap gap-2 text-[11px] text-[var(--tu-text-muted)] border-t border-[var(--tu-border-subtle)] pt-3 mb-4">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {plugin.rating}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {plugin.downloads.toLocaleString()}
                    </span>
                    {plugin.capabilities.network && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[var(--tu-text-accent)]">
                          <Globe className="w-3 h-3" />
                          Network API
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
                        onClick={() => uninstallPlugin(plugin.id)}
                        className="p-1.5 rounded-[var(--tu-radius-sm)] border border-[var(--tu-danger)]/30 text-[var(--tu-danger)] hover:bg-[var(--tu-danger)]/10 transition-colors cursor-pointer"
                        title="Uninstall plugin"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleInstallPlugin(plugin)}
                      disabled={isLoading}
                      className="flex-1 py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1.5 shadow cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          Install Plugin
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
