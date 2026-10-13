import { PluginManifest } from "@/store/useAppStore";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class PluginHostManager {
  /**
   * Validates plugin manifest structure and capabilities
   */
  public static validateManifest(manifest: unknown): ValidationResult {
    const errors: string[] = [];
    if (!manifest || typeof manifest !== "object") {
      return { valid: false, errors: ["Manifest must be a valid JSON object"] };
    }

    const m = manifest as Partial<PluginManifest>;
    if (!m.id || typeof m.id !== "string" || !/^[a-zA-Z0-9._-]+$/.test(m.id)) {
      errors.push("Field 'id' must be a valid reverse-DNS or alphanumeric identifier (e.g. tuwien.tuwel.deadlines)");
    }
    if (!m.name || typeof m.name !== "string") {
      errors.push("Field 'name' is required and must be a string");
    }
    if (!m.version || typeof m.version !== "string") {
      errors.push("Field 'version' is required (e.g. 1.0.0)");
    }
    if (!m.entrypoint || typeof m.entrypoint !== "string") {
      errors.push("Field 'entrypoint' is required (e.g. index.html)");
    }

    if (m.capabilities?.network && !Array.isArray(m.capabilities.network)) {
      errors.push("Field 'capabilities.network' must be an array of URL globs if defined");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitizes and parses plugin HTML bundle for secure execution
   */
  public static preparePluginHtml(rawHtml: string): string {
    // Strip parent navigation or frame-busting attempts if present
    return rawHtml.replace(/window\.top\.location/g, "/* blocked */");
  }
}
