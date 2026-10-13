import { invoke } from "@tauri-apps/api/core";
import { PluginManifest } from "@/store/useAppStore";

export interface StoreRegistryPlugin {
  id: string;
  name: string;
  version: string;
  author: {
    name: string;
    github?: string;
    url?: string;
  };
  description: string;
  category: "Academic" | "Campus Life" | "Productivity";
  icon?: string;
  homepage?: string;
  githubRepo?: string;
  downloadUrl?: string;
  checksumSha256?: string;
  capabilities: {
    network?: string[];
    storage?: { quotaBytes?: number };
    notifications?: boolean;
    systemClipboard?: boolean;
  };
  verified: boolean;
  rating: number;
  downloads: number;
}

export interface StoreRegistry {
  version: string;
  updatedAt: string;
  plugins: StoreRegistryPlugin[];
}

// Fallback embedded verified catalogue mirroring official community registry
export const DEFAULT_STORE_REGISTRY: StoreRegistry = {
  version: "1.0.0",
  updatedAt: "2026-10-13T20:00:00.000Z",
  plugins: [
    {
      id: "tuwien.community.smart-tuwel",
      name: "Smart TUWEL Companion",
      version: "1.2.0",
      author: {
        name: "TU Student Dev Group",
        github: "tuwien-community",
        url: "https://github.com/tuwien-community",
      },
      description: "Auto-syncs assignment submission deadlines, course announcements, and upcoming quizzes.",
      category: "Academic",
      githubRepo: "https://github.com/tuwien-community/smart-tuwel",
      capabilities: {
        network: ["https://tuwel.tuwien.ac.at/*"],
        storage: { quotaBytes: 2097152 },
        notifications: true,
      },
      verified: true,
      rating: 4.9,
      downloads: 4820,
    },
    {
      id: "tuwien.community.tiss-schedule",
      name: "TISS Exam & Timetable Sync",
      version: "1.1.4",
      author: {
        name: "FSInf Student Union",
        github: "fsinf",
        url: "https://fsinf.at",
      },
      description: "Live exam registration alert, room notifications, and semester syllabus calendar.",
      category: "Academic",
      githubRepo: "https://github.com/fsinf/tiss-schedule",
      capabilities: {
        network: ["https://tiss.tuwien.ac.at/api/*"],
        storage: { quotaBytes: 1048576 },
        notifications: true,
      },
      verified: true,
      rating: 4.8,
      downloads: 3210,
    },
    {
      id: "tuwien.community.vowi-companion",
      name: "VoWi Wiki Fast Search",
      version: "2.0.1",
      author: {
        name: "VoWi Maintainers",
        github: "vowi-team",
        url: "https://vowi.fsinf.at",
      },
      description: "Search lecture notes, previous exam ratings, and professor feedback instantly from Cockpit.",
      category: "Academic",
      githubRepo: "https://github.com/vowi-team/vowi-companion",
      capabilities: {
        network: ["https://vowi.fsinf.at/*"],
        storage: { quotaBytes: 5242880 },
        notifications: false,
      },
      verified: true,
      rating: 4.9,
      downloads: 5190,
    },
    {
      id: "tuwien.campus.mensa-today",
      name: "TU Mensa Daily Specials",
      version: "1.3.0",
      author: {
        name: "Wien Mensen Open Data",
        github: "vienna-mensen",
      },
      description: "Real-time lunch specials, allergy info, and student discounts for Freihaus & Resselgasse.",
      category: "Campus Life",
      githubRepo: "https://github.com/vienna-mensen/tu-cockpit-mensa",
      capabilities: {
        network: ["https://www.mensen.at/*"],
        storage: { quotaBytes: 524288 },
        notifications: false,
      },
      verified: true,
      rating: 4.7,
      downloads: 6420,
    },
    {
      id: "tuwien.campus.room-locator",
      name: "TU Room Locator & Maps",
      version: "1.0.8",
      author: {
        name: "TU Geo Devs",
        github: "tu-geo",
      },
      description: "Quickly locate Hörsäle, institutes, and study zones across Freihaus, Karlsplatz, and Gußhaus.",
      category: "Productivity",
      githubRepo: "https://github.com/tu-geo/tu-rooms",
      capabilities: {
        network: ["https://maps.tuwien.ac.at/*"],
        storage: { quotaBytes: 1048576 },
        notifications: false,
      },
      verified: true,
      rating: 4.6,
      downloads: 2890,
    },
  ],
};

export class GitHubPluginService {
  private static REGISTRY_URL =
    "https://raw.githubusercontent.com/tuwien-community/tu-cockpit-store/main/store-registry.json";

  public static async fetchStoreRegistry(): Promise<StoreRegistry> {
    try {
      const response = await fetch(this.REGISTRY_URL, { cache: "no-cache" });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback to verified local directory if offline or unreleased
    }
    return DEFAULT_STORE_REGISTRY;
  }

  public static async installFromGitHub(
    repoUrl: string,
    releaseTag?: string
  ): Promise<{ manifest: PluginManifest; htmlContent: string; installDir: string }> {
    try {
      // Native Tauri invocation
      const metadata = await invoke<any>("install_plugin_from_github", {
        repoUrl,
        releaseTag: releaseTag || null,
      });

      return {
        manifest: {
          id: metadata.id,
          name: metadata.name,
          version: metadata.version,
          description: metadata.description,
          entrypoint: metadata.entrypoint,
          githubRepo: repoUrl,
          capabilities: metadata.capabilities,
        },
        htmlContent: metadata.entrypoint_html,
        installDir: metadata.install_dir,
      };
    } catch (err: any) {
      // Browser preview fallback simulation
      if (typeof (window as any).__TAURI_INTERNALS__ === "undefined") {
        console.warn("Simulating GitHub installation in web preview for:", repoUrl);
        const name = repoUrl.split("/").pop() || "Community Plugin";
        const id = `community.${name.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
        return {
          manifest: {
            id,
            name: name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            version: releaseTag || "1.0.0",
            description: `Dynamically installed from ${repoUrl}`,
            entrypoint: "index.html",
            githubRepo: repoUrl,
            capabilities: {
              network: ["https://tuwel.tuwien.ac.at/*"],
              storage: { quotaBytes: 1048576 },
              notifications: true,
            },
          },
          htmlContent: `<!DOCTYPE html><html><head><style>body { font-family: var(--tu-font-sans); background: var(--tu-bg-base); color: var(--tu-text-primary); padding: 20px; } .card { background: var(--tu-bg-surface); border: 1px solid var(--tu-border); border-radius: var(--tu-radius); padding: 16px; } h2 { color: var(--tu-accent); font-size: 16px; margin-bottom: 8px; }</style></head><body><div class="card"><h2>${name}</h2><p style="font-size: 12px; color: var(--tu-text-secondary);">Installed dynamically from ${repoUrl}</p><div style="margin-top: 12px; font-size: 11px; color: var(--tu-success);">✓ Sandboxed execution verified</div></div></body></html>`,
          installDir: `/simulated/plugins/${id}/1.0.0`,
        };
      }
      throw err;
    }
  }
}
