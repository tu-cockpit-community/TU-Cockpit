import Database from "@tauri-apps/plugin-sql";

export class LocalDbService {
  private static db: Database | null = null;
  private static isNative = typeof window !== "undefined" && typeof (window as any).__TAURI_INTERNALS__ !== "undefined";

  public static async getDb(): Promise<Database | null> {
    if (!this.isNative) return null;
    if (!this.db) {
      try {
        this.db = await Database.load("sqlite:tucockpit.db");
        await this.initSchema();
      } catch (err) {
        console.warn("Failed to load SQLite database, falling back to localStorage:", err);
        return null;
      }
    }
    return this.db;
  }

  private static async initSchema(): Promise<void> {
    if (!this.db) return;
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS plugin_storage (
        plugin_id TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (plugin_id, key)
      );
    `);
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS sync_state (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  public static async getPluginValue(pluginId: string, key: string): Promise<string | null> {
    const db = await this.getDb();
    if (db) {
      const rows: any[] = await db.select(
        "SELECT value FROM plugin_storage WHERE plugin_id = $1 AND key = $2",
        [pluginId, key]
      );
      return rows.length > 0 ? rows[0].value : null;
    }
    return localStorage.getItem(`tu_plugin:${pluginId}:${key}`);
  }

  public static async setPluginValue(pluginId: string, key: string, value: string): Promise<void> {
    const db = await this.getDb();
    if (db) {
      await db.execute(
        `INSERT INTO plugin_storage (plugin_id, key, value, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT(plugin_id, key) DO UPDATE SET value = $3, updated_at = CURRENT_TIMESTAMP`,
        [pluginId, key, value]
      );
      return;
    }
    localStorage.setItem(`tu_plugin:${pluginId}:${key}`, value);
  }
}
