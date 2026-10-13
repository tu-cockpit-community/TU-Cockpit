import { EncryptedSyncEnvelope } from "./CryptoSyncEngine";

export interface SyncPayloadData {
  theme: {
    activeThemeId: string;
    fontSans: string;
    fontMono: string;
    uiScale: number;
    tokens: Record<string, string>;
  };
  installedPlugins: Array<{
    id: string;
    version: string;
    enabled: boolean;
  }>;
  dockPinnedIds: string[];
  updatedAt: string;
}

export class GistSyncAdapter {
  private static FILENAME = "tu_cockpit_e2ee_sync.json";

  public static async pushSync(
    githubToken: string,
    gistId: string | null,
    envelope: EncryptedSyncEnvelope
  ): Promise<{ gistId: string }> {
    const payload = {
      description: "TU Cockpit Encrypted Settings Backup (Zero-Knowledge E2EE)",
      public: false,
      files: {
        [this.FILENAME]: {
          content: JSON.stringify(envelope, null, 2),
        },
      },
    };

    const url = gistId
      ? `https://api.github.com/gists/${gistId}`
      : "https://api.github.com/gists";
    const method = gistId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to upload sync state: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    return { gistId: data.id };
  }

  public static async pullSync(
    githubToken: string,
    gistId: string
  ): Promise<EncryptedSyncEnvelope> {
    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to pull sync state: ${res.statusText}`);
    }

    const data = await res.json();
    const file = data.files?.[this.FILENAME];
    if (!file || !file.content) {
      throw new Error(`Sync file ${this.FILENAME} not found in Gist`);
    }

    return JSON.parse(file.content);
  }
}
