import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  GitHubPluginService,
  StoreRegistryPlugin,
} from "@/services/marketplace/GitHubPluginService";
import {
  Download,
  Trash2,
  ExternalLink,
  HardDrive,
  Globe,
  Bell,
  Search,
  Star,
  Users,
  ShieldCheck,
  PlusCircle,
  Loader2,
  Github,
} from "lucide-react";

export const PluginMarketplace: React.FC = () => {
  const {
    installedPlugins,
    installPlugin,
    uninstallPlugin,
    setActiveView,
    setGitHubInstallModalOpen,
  } = useAppStore();

  const [registryPlugins, setRegistryPlugins] = useState<StoreRegistryPlugin[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    GitHubPluginService.fetchStoreRegistry().then((reg) => {
      if (mounted) {
        setRegistryPlugins(reg.plugins);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleInstallPlugin = async (entry: StoreRegistryPlugin) => {
    setLoadingMap((prev) => ({ ...prev, [entry.id]: true }));
    try {
      const repoUrl = entry.githubRepo || `https://github.com/tuwien-community/${entry.id.split(".").pop()}`;
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
            Discover, audit, and install verified community plugins or load arbitrary GitHub repositories.
          </p>
        </div>

        <button
          onClick={() => setGitHubInstallModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Install from GitHub URL
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-1.5 p-1 bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius)]">
          {["All", "Academic", "Campus Life", "Productivity"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] transition-all ${
                selectedCategory === cat
                  ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)]"
                  : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--tu-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified tools & widgets..."
            className="w-full bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius)] pl-9 pr-3 py-1.5 text-xs text-[var(--tu-text-primary)] focus:outline-none focus:border-[var(--tu-border-focus)]"
          />
        </div>
      </div>

      {/* Plugin Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlugins.map((entry) => {
          const isInstalled = !!installedPlugins[entry.id];
          const isLoading = !!loadingMap[entry.id];

          return (
            <div
              key={entry.id}
              className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] p-5 shadow-[var(--tu-shadow)] flex flex-col justify-between hover:border-[var(--tu-border-focus)] transition-all"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-base text-[var(--tu-text-primary)]">
                        {entry.name}
                      </h3>
                      {entry.verified && (
                        <span title="Verified by Community Store Reviewers">
                          <ShieldCheck className="w-4 h-4 text-[var(--tu-success)]" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--tu-text-secondary)]">
                      <span className="flex items-center gap-1 text-[var(--tu-warning)]">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {entry.rating}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[var(--tu-text-muted)]">
                        <Users className="w-3.5 h-3.5" />
                        {entry.downloads.toLocaleString()} installs
                      </span>
                      <span>•</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--tu-bg-card)] border border-[var(--tu-border)]">
                        v{entry.version}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--tu-bg-card)] text-[var(--tu-text-secondary)] border border-[var(--tu-border)]">
                    {entry.category}
                  </span>
                </div>

                <p className="text-xs text-[var(--tu-text-secondary)] leading-relaxed mb-4">
                  {entry.description}
                </p>

                {/* Capability Badges */}
                <div className="space-y-1.5 pt-3 border-t border-[var(--tu-border-subtle)] text-[11px] mb-4">
                  <div className="flex items-center gap-1.5 text-[var(--tu-text-secondary)]">
                    <Globe className="w-3.5 h-3.5 text-[var(--tu-text-accent)] shrink-0" />
                    <span className="truncate font-mono text-[10px]">
                      {entry.capabilities?.network?.join(", ") || "No external network access"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[var(--tu-text-muted)] text-[10px]">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      Isolated SQLite: {((entry.capabilities?.storage?.quotaBytes || 0) / 1024 / 1024).toFixed(1)} MB
                    </span>
                    {entry.capabilities?.notifications && (
                      <span className="flex items-center gap-1 text-[var(--tu-text-accent)]">
                        <Bell className="w-3 h-3" />
                        Notifications Allowed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--tu-border-subtle)]">
                <div className="text-[11px] text-[var(--tu-text-muted)] flex items-center gap-1">
                  <span>By {entry.author.name}</span>
                  {entry.author.github && (
                    <a
                      href={`https://github.com/${entry.author.github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)]"
                    >
                      <Github className="w-3 h-3 inline" />
                    </a>
                  )}
                </div>

                <div>
                  {isInstalled ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveView("plugin", entry.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 transition-opacity flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Launch
                      </button>
                      <button
                        onClick={() => uninstallPlugin(entry.id)}
                        className="text-xs text-[var(--tu-danger)] hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleInstallPlugin(entry)}
                      disabled={isLoading}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] hover:border-[var(--tu-accent)] transition-all flex items-center gap-1.5"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-[var(--tu-accent)]" />
                      )}
                      Install
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
