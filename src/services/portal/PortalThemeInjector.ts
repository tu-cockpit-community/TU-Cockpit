export class PortalThemeInjector {
  // Phase 8: University portals (TUWEL, TISS, VoWi, TU Maps) render in 100% authentic mode
  // Destructive !important overrides are decommissioned to prevent breaking Moodle quizzes and JSF tables.
  public static readonly TUWEL_RULES = "";
  public static readonly TISS_RULES = "";
  public static readonly VOWI_RULES = "";
  public static readonly TUMAPS_RULES = "";

  public static generateInjectedCss(
    _portalId: string,
    _tokens: Record<string, string>,
    _fontSans: string,
    _fontMono: string = "monospace",
    _uiScale: number = 1.0
  ): string {
    // In authentic mode, do not inject custom styles into institutional web pages
    return "";
  }
}

export function generateThemePayload(
  portalId: string,
  tokens: Record<string, string>,
  fontSans: string,
  uiScale: number = 1.0,
  fontMono: string = "monospace"
): string {
  return PortalThemeInjector.generateInjectedCss(portalId, tokens, fontSans, fontMono, uiScale);
}
