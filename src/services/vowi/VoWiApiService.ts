/**
 * VoWi MediaWiki Headless API Service
 * Queries the public MediaWiki API at https://vowi.fsinf.at/api.php
 * Supports cross-origin queries via origin=* parameter.
 */

export interface VoWiSearchResult {
  title: string;
  displayTitle: string;
  snippet?: string;
  url: string;
  pageid?: number;
}

export interface VoWiSection {
  index: string;
  line: string;
  level: string;
  anchor: string;
}

export interface VoWiPageContent {
  title: string;
  displayTitle: string;
  html: string;
  rawText: string;
  sections: VoWiSection[];
  url: string;
  ects?: string;
  lvaType?: string;
  professors?: string;
}

const VOWI_API_BASE = "https://vowi.fsinf.at/api.php";
const VOWI_WIKI_BASE = "https://vowi.fsinf.at/wiki";

/**
 * Curated popular TU Wien courses to display before user types a query
 */
export const POPULAR_VOWI_COURSES: VoWiSearchResult[] = [
  {
    title: "TU Wien:Algorithmen und Datenstrukturen VU (Peitl)",
    displayTitle: "Algorithmen und Datenstrukturen VU (Peitl)",
    snippet: "Pflichtfach im Bachelorstudium Informatik & Wirtschaftsinformatik.",
    url: `${VOWI_WIKI_BASE}/TU_Wien:Algorithmen_und_Datenstrukturen_VU_(Peitl)`,
  },
  {
    title: "TU Wien:Analysis VU (Stufler)",
    displayTitle: "Analysis VU (Stufler)",
    snippet: "Mathematische Grundlagen, Differential- & Integralrechnung für Informatik.",
    url: `${VOWI_WIKI_BASE}/TU_Wien:Analysis_VU_(Stufler)`,
  },
  {
    title: "TU Wien:Einführung in die Programmierung 1 VU (diverse)",
    displayTitle: "Einführung in die Programmierung 1 VU (diverse)",
    snippet: "Grundlegende Programmierparadigmen in Java/C für Studienanfänger.",
    url: `${VOWI_WIKI_BASE}/TU_Wien:Einführung_in_die_Programmierung_1_VU_(diverse)`,
  },
  {
    title: "TU Wien:Lineare Algebra VU (diverse)",
    displayTitle: "Lineare Algebra VU (diverse)",
    snippet: "Vektorräume, Matrizen, lineare Gleichungssysteme und Eigenwerte.",
    url: `${VOWI_WIKI_BASE}/TU_Wien:Lineare_Algebra_VU_(diverse)`,
  },
  {
    title: "TU Wien:Software Engineering VU (diverse)",
    displayTitle: "Software Engineering VU (diverse)",
    snippet: "Agile Entwicklung, Architekturen, Entwurfsmuster und Teamprojekt.",
    url: `${VOWI_WIKI_BASE}/TU_Wien:Software_Engineering_VU_(diverse)`,
  },
  {
    title: "TU Wien:Datenbanksysteme VU (diverse)",
    displayTitle: "Datenbanksysteme VU (diverse)",
    snippet: "Relationales Modell, SQL, Normalisierung und Transaktionsverwaltung.",
    url: `${VOWI_WIKI_BASE}/TU_Wien:Datenbanksysteme_VU_(diverse)`,
  },
];

export class VoWiApiService {
  /**
   * Search courses on VoWi using MediaWiki search across TU Wien namespaces
   */
  static async searchCourses(query: string): Promise<VoWiSearchResult[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return POPULAR_VOWI_COURSES;
    }

    try {
      // First try MediaWiki query search with TU Wien namespace (3000) and main namespace (0)
      const searchUrl = `${VOWI_API_BASE}?action=query&list=search&srsearch=${encodeURIComponent(
        trimmed
      )}&srnamespace=3000|0|2996&srlimit=15&format=json&origin=*`;

      const response = await fetch(searchUrl, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`MediaWiki search failed with status ${response.status}`);
      }

      const data = await response.json();
      const results: VoWiSearchResult[] = [];

      if (data?.query?.search && Array.isArray(data.query.search)) {
        for (const item of data.query.search) {
          const rawTitle: string = item.title;
          const displayTitle = rawTitle.replace(/^TU Wien:/i, "").trim();
          const cleanSnippet = item.snippet
            ? item.snippet.replace(/<span class="searchmatch">/g, "<b>").replace(/<\/span>/g, "</b>")
            : undefined;

          results.push({
            title: rawTitle,
            displayTitle: displayTitle || rawTitle,
            snippet: cleanSnippet,
            url: `${VOWI_WIKI_BASE}/${encodeURIComponent(rawTitle.replace(/ /g, "_"))}`,
            pageid: item.pageid,
          });
        }
      }

      // If no results in custom namespaces, fallback to OpenSearch API
      if (results.length === 0) {
        const openSearchUrl = `${VOWI_API_BASE}?action=opensearch&search=${encodeURIComponent(
          trimmed
        )}&limit=10&format=json&origin=*`;
        const osRes = await fetch(openSearchUrl);
        if (osRes.ok) {
          const osData = await osRes.json();
          if (Array.isArray(osData) && osData[1] && Array.isArray(osData[1])) {
            const titles: string[] = osData[1];
            const snippets: string[] = osData[2] || [];
            const urls: string[] = osData[3] || [];

            for (let i = 0; i < titles.length; i++) {
              const rawTitle = titles[i];
              results.push({
                title: rawTitle,
                displayTitle: rawTitle.replace(/^TU Wien:/i, "").trim(),
                snippet: snippets[i] || undefined,
                url: urls[i] || `${VOWI_WIKI_BASE}/${encodeURIComponent(rawTitle.replace(/ /g, "_"))}`,
              });
            }
          }
        }
      }

      return results;
    } catch (err) {
      console.error("VoWi searchCourses error:", err);
      // Filter popular courses on network or search error
      return POPULAR_VOWI_COURSES.filter(
        (c) =>
          c.displayTitle.toLowerCase().includes(trimmed.toLowerCase()) ||
          (c.snippet && c.snippet.toLowerCase().includes(trimmed.toLowerCase()))
      );
    }
  }

  /**
   * Fetch parsed HTML content and metadata for a specific VoWi article
   */
  static async fetchPageContent(title: string): Promise<VoWiPageContent> {
    try {
      const parseUrl = `${VOWI_API_BASE}?action=parse&page=${encodeURIComponent(
        title
      )}&prop=text|sections|wikitext&format=json&origin=*`;

      const response = await fetch(parseUrl, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`MediaWiki parse failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.info || "Page not found");
      }

      const parse = data.parse || {};
      const rawHtml: string = parse.text?.["*"] || "<p>Kein Inhalt gefunden.</p>";
      const rawText: string = parse.wikitext?.["*"] || "";
      const sectionsRaw = parse.sections || [];

      const sections: VoWiSection[] = sectionsRaw.map((s: any) => ({
        index: s.index,
        line: s.line,
        level: s.level,
        anchor: s.anchor,
      }));

      // Parse metadata from wikitext / html
      let ects: string | undefined;
      const ectsMatch = rawText.match(/\|\s*ects\s*=\s*([0-9.,]+)/i);
      if (ectsMatch) ects = ectsMatch[1];

      let lvaType: string | undefined;
      const typeMatch = rawText.match(/\|\s*typ\s*=\s*([A-Za-z]+)/i);
      if (typeMatch) lvaType = typeMatch[1];

      let professors: string | undefined;
      const profMatch = rawText.match(/\|\s*vortragende\s*=\s*([^\n|]+)/i);
      if (profMatch) professors = profMatch[1].trim();

      // Clean HTML:
      // 1. Rewrite relative links href="/wiki/..." to full VoWi URLs or data-wiki-page
      // 2. Rewrite images src="/images/..." to https://vowi.fsinf.at/images/...
      // 3. Remove .mw-editsection elements
      let cleanHtml = rawHtml
        .replace(
          /href="\/wiki\/([^"]+)"/g,
          (_match, page) => `href="https://vowi.fsinf.at/wiki/${page}" data-wiki-page="${decodeURIComponent(page)}"`
        )
        .replace(
          /href="\/index\.php\?title=([^&"]+)[^"]*"/g,
          (_match, page) => `href="https://vowi.fsinf.at/wiki/${page}" data-wiki-page="${decodeURIComponent(page)}"`
        )
        .replace(/src="\/images\//g, 'src="https://vowi.fsinf.at/images/')
        .replace(/srcset="\/images\//g, 'srcset="https://vowi.fsinf.at/images/')
        .replace(/<span class="mw-editsection">[\s\S]*?<\/span>/g, "");

      const displayTitle = (parse.title || title).replace(/^TU Wien:/i, "").trim();

      return {
        title: parse.title || title,
        displayTitle,
        html: cleanHtml,
        rawText,
        sections,
        url: `${VOWI_WIKI_BASE}/${encodeURIComponent((parse.title || title).replace(/ /g, "_"))}`,
        ects,
        lvaType,
        professors,
      };
    } catch (err: any) {
      console.error("VoWi fetchPageContent error:", err);
      throw err;
    }
  }
}
