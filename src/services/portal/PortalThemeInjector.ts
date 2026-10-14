export class PortalThemeInjector {
  private static TUWEL_RULES = `
    body, #page, #page-wrapper, .card, .block, #nav-drawer, .navbar, .header-maxwidth {
      background-color: var(--tu-bg-base) !important;
      color: var(--tu-text-primary) !important;
      font-family: var(--tu-font-sans) !important;
    }
    .card, .block, .activity-item, .path-mod-assign [data-region="grade-panel"], .activity-header {
      background-color: var(--tu-bg-surface) !important;
      border: 1px solid var(--tu-border) !important;
      border-radius: var(--tu-radius) !important;
      color: var(--tu-text-primary) !important;
    }
    .btn-primary, .nav-tabs .nav-link.active, .page-item.active .page-link {
      background-color: var(--tu-accent) !important;
      border-color: var(--tu-accent) !important;
      color: var(--tu-accent-contrast) !important;
    }
    a { color: var(--tu-text-accent) !important; }
    table, .generaltable, .table {
      background-color: var(--tu-bg-surface) !important;
      color: var(--tu-text-primary) !important;
      border-color: var(--tu-border) !important;
    }
    th {
      background-color: var(--tu-bg-card) !important;
      color: var(--tu-text-primary) !important;
    }
  `;

  private static TISS_RULES = `
    body, #content, .content, #header, #navigation, #wrapper {
      background: var(--tu-bg-base) !important;
      color: var(--tu-text-primary) !important;
      font-family: var(--tu-font-sans) !important;
    }
    table.tissTable, .tissPanel, .box, fieldset, .form-group {
      background: var(--tu-bg-surface) !important;
      border: 1px solid var(--tu-border) !important;
      border-radius: var(--tu-radius) !important;
      color: var(--tu-text-primary) !important;
    }
    table.tissTable th {
      background: var(--tu-bg-card) !important;
      color: var(--tu-text-primary) !important;
      border-bottom: 2px solid var(--tu-accent) !important;
    }
    table.tissTable td {
      border-color: var(--tu-border-subtle) !important;
      color: var(--tu-text-secondary) !important;
    }
    input, select, textarea {
      background: var(--tu-bg-card) !important;
      color: var(--tu-text-primary) !important;
      border: 1px solid var(--tu-border) !important;
      border-radius: var(--tu-radius-sm) !important;
    }
    a { color: var(--tu-text-accent) !important; }
  `;

  private static VOWI_RULES = `
    #content, body, #mw-page-base, #mw-head-base, #footer {
      background: var(--tu-bg-base) !important;
      color: var(--tu-text-primary) !important;
      font-family: var(--tu-font-sans) !important;
    }
    .wikitable, .toc, .catlinks, #mw-panel .portal {
      background: var(--tu-bg-surface) !important;
      border: 1px solid var(--tu-border) !important;
      border-radius: var(--tu-radius) !important;
      color: var(--tu-text-primary) !important;
    }
    pre, code {
      background: var(--tu-bg-card) !important;
      color: var(--tu-text-accent) !important;
      font-family: var(--tu-font-mono) !important;
    }
    a { color: var(--tu-text-accent) !important; }
  `;

  private static TUMAPS_RULES = `
    .leaflet-tile-pane, .map-canvas, .ol-layer {
      filter: invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%);
    }
    .leaflet-bar, .search-container, .floor-selector, .info-box, .panel {
      background: var(--tu-bg-surface) !important;
      border: 1px solid var(--tu-border) !important;
      border-radius: var(--tu-radius) !important;
      color: var(--tu-text-primary) !important;
      box-shadow: var(--tu-shadow) !important;
    }
    a { color: var(--tu-text-accent) !important; }
  `;

  public static generateInjectedCss(
    portalId: string,
    tokens: Record<string, string>,
    fontSans: string,
    fontMono: string = "monospace",
    uiScale: number = 1.0
  ): string {
    const rootVariables = Object.entries(tokens)
      .map(([k, v]) => `${k}: ${v} !important;`)
      .join("\n      ");

    const id = portalId.toLowerCase();
    let portalSpecificRules = "";
    if (id.includes("tuwel")) {
      portalSpecificRules = this.TUWEL_RULES;
    } else if (id.includes("tiss")) {
      portalSpecificRules = this.TISS_RULES;
    } else if (id.includes("vowi")) {
      portalSpecificRules = this.VOWI_RULES;
    } else if (id.includes("tumaps") || id.includes("maps")) {
      portalSpecificRules = this.TUMAPS_RULES;
    }

    return `
      :root {
        ${rootVariables}
        --tu-font-sans: ${fontSans} !important;
        --tu-font-mono: ${fontMono} !important;
        --tu-ui-scale: ${uiScale} !important;
      }
      ${portalSpecificRules}
    `;
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
