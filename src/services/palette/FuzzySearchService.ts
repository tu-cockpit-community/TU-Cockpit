import { invoke } from "@tauri-apps/api/core";
import TU_ROOMS_DATA from "@/data/tu_rooms_index.json";

export interface CampusRoom {
  id: string;
  name: string;
  building: string;
  address: string;
  code: string;
  floor: string;
  coordinates: { lat: number; lng: number };
  mapUrl: string;
}

export type PaletteCategory = "plugins" | "rooms" | "courses" | "actions";

export interface PaletteItem {
  id: string;
  title: string;
  subtitle: string;
  category: PaletteCategory;
  categoryLabel: string;
  badge?: string;
  iconName?: string;
  keywords?: string[];
  action: () => void | Promise<void>;
}

export interface PaletteContext {
  installedPlugins: Record<string, any>;
  setActiveView: (view: "marketplace" | "portals" | "plugin", pluginId?: string) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  openSettings: () => void;
  openLoginModal: () => void;
  currentTheme: string;
}

const ACADEMIC_COURSES = [
  {
    id: "course_188_956",
    code: "188.956",
    name: "Algorithmen und Datenstrukturen",
    type: "VU 4.0",
    semester: "WS 2026",
    tuwelUrl: "https://tuwel.tuwien.ac.at/",
    tissUrl: "https://tiss.tuwien.ac.at/course/courseDetails.xhtml?courseNumber=188956",
  },
  {
    id: "course_104_261",
    code: "104.261",
    name: "Analysis 1 für Informatik",
    type: "VO 3.0",
    semester: "WS 2026",
    tuwelUrl: "https://tuwel.tuwien.ac.at/",
    tissUrl: "https://tiss.tuwien.ac.at/course/courseDetails.xhtml?courseNumber=104261",
  },
  {
    id: "course_185_a48",
    code: "185.A48",
    name: "Software Engineering",
    type: "PR 6.0",
    semester: "WS 2026",
    tuwelUrl: "https://tuwel.tuwien.ac.at/",
    tissUrl: "https://tiss.tuwien.ac.at/course/courseDetails.xhtml?courseNumber=185A48",
  },
  {
    id: "course_184_735",
    code: "184.735",
    name: "Datenbanksysteme",
    type: "VU 3.0",
    semester: "WS 2026",
    tuwelUrl: "https://tuwel.tuwien.ac.at/",
    tissUrl: "https://tiss.tuwien.ac.at/course/courseDetails.xhtml?courseNumber=184735",
  },
  {
    id: "course_183_589",
    code: "183.589",
    name: "Technische Grundlagen der Informatik",
    type: "VO 3.0",
    semester: "WS 2026",
    tuwelUrl: "https://tuwel.tuwien.ac.at/",
    tissUrl: "https://tiss.tuwien.ac.at/course/courseDetails.xhtml?courseNumber=183589",
  },
];

export class FuzzySearchService {
  static getAllItems(ctx: PaletteContext): PaletteItem[] {
    const items: PaletteItem[] = [];

    // 1. Installed Plugins and Official Portals
    Object.values(ctx.installedPlugins).forEach((plugin) => {
      const isOfficial = plugin.manifest.id.startsWith("tuwien.official.");
      items.push({
        id: `plugin_${plugin.manifest.id}`,
        title: plugin.manifest.name,
        subtitle: isOfficial ? "Official University Portal" : plugin.manifest.description || "Community Plugin",
        category: "plugins",
        categoryLabel: "Installed Plugins & University Portals",
        badge: isOfficial ? "Portal" : "Plugin",
        iconName: isOfficial ? "GraduationCap" : "Puzzle",
        keywords: [plugin.manifest.id, plugin.manifest.name, plugin.manifest.category || ""],
        action: () => {
          ctx.setActiveView("plugin", plugin.manifest.id);
        },
      });
    });

    // 2. Campus Rooms & Lecture Halls
    const rooms = TU_ROOMS_DATA as CampusRoom[];
    rooms.forEach((room) => {
      items.push({
        id: `room_${room.id}`,
        title: `${room.name} (${room.code})`,
        subtitle: `${room.building} • ${room.address} • ${room.floor}`,
        category: "rooms",
        categoryLabel: "TU Wien Campus Rooms & Lecture Halls",
        badge: "TU Maps",
        iconName: "MapPin",
        keywords: [room.name, room.code, room.building, room.floor, room.address],
        action: async () => {
          ctx.setActiveView("plugin", "tuwien.official.tumaps");
          try {
            await invoke("navigate_native_portal", {
              portalId: "tuwien.official.tumaps",
              url: room.mapUrl,
            });
          } catch (e) {
            console.warn("Could not navigate native portal directly:", e);
          }
        },
      });
    });

    // 3. Academic Courses & LVAs
    ACADEMIC_COURSES.forEach((course) => {
      items.push({
        id: course.id,
        title: `${course.code} ${course.name}`,
        subtitle: `${course.type} • ${course.semester}`,
        category: "courses",
        categoryLabel: "Academic Courses (Active Semester)",
        badge: "Course",
        iconName: "BookOpen",
        keywords: [course.code, course.name, course.type, "lva", "course"],
        action: () => {
          ctx.setActiveView("plugin", "tuwien.official.tuwel");
        },
      });
    });

    // 4. Quick System Actions
    items.push({
      id: "action_toggle_sidebar",
      title: "Toggle Sidebar (Collapse / Expand)",
      subtitle: "Toggle between 256px sidebar and 56px compact icon rail",
      category: "actions",
      categoryLabel: "Quick System Actions",
      badge: "Action",
      iconName: "PanelLeftClose",
      keywords: ["sidebar", "collapse", "expand", "navigation", "dock", "hide"],
      action: () => {
        ctx.toggleSidebar();
      },
    });

    items.push({
      id: "action_toggle_theme",
      title: "Toggle Dark / Light Theme",
      subtitle: `Current theme: ${ctx.currentTheme}`,
      category: "actions",
      categoryLabel: "Quick System Actions",
      badge: "Action",
      iconName: "SunMoon",
      keywords: ["theme", "dark", "light", "appearance", "mode", "color"],
      action: () => {
        ctx.toggleTheme();
      },
    });

    items.push({
      id: "action_autofill",
      title: "Autofill University Credentials into Active Portal",
      subtitle: "Inject stored TU Wien credentials and TOTP into Shibboleth SSO",
      category: "actions",
      categoryLabel: "Quick System Actions",
      badge: "Security",
      iconName: "KeyRound",
      keywords: ["autofill", "login", "sso", "totp", "mfa", "password", "vault"],
      action: () => {
        ctx.openLoginModal();
      },
    });

    items.push({
      id: "action_open_marketplace",
      title: "Open Community Marketplace Hub",
      subtitle: "Discover, install, and update verified student plugins",
      category: "actions",
      categoryLabel: "Quick System Actions",
      badge: "Hub",
      iconName: "Store",
      keywords: ["store", "marketplace", "plugins", "install", "community"],
      action: () => {
        ctx.setActiveView("marketplace");
      },
    });

    items.push({
      id: "action_open_settings",
      title: "Open Cockpit Settings",
      subtitle: "Configure appearance, sync, navigation orientation, and categories",
      category: "actions",
      categoryLabel: "Quick System Actions",
      badge: "Settings",
      iconName: "Settings",
      keywords: ["settings", "preferences", "config", "orientation", "tokens"],
      action: () => {
        ctx.openSettings();
      },
    });

    return items;
  }

  static search(items: PaletteItem[], query: string): PaletteItem[] {
    const clean = query.trim().toLowerCase();
    if (!clean) {
      return items;
    }

    const scored = items.map((item) => {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      const subtitleLower = item.subtitle.toLowerCase();

      // Exact match or prefix match in title
      if (titleLower === clean) score += 100;
      else if (titleLower.startsWith(clean)) score += 80;
      else if (titleLower.includes(clean)) score += 50;

      // Clean stripped comparison for room codes (e.g. "ei 7" vs "ei7")
      const strippedClean = clean.replace(/\s+/g, "");
      const strippedTitle = titleLower.replace(/\s+/g, "");
      if (strippedTitle.includes(strippedClean)) score += 60;

      // Subtitle match
      if (subtitleLower.includes(clean)) score += 20;

      // Keywords match
      if (item.keywords) {
        item.keywords.forEach((kw) => {
          const kwLower = kw.toLowerCase();
          if (kwLower === clean) score += 40;
          else if (kwLower.includes(clean)) score += 25;
        });
      }

      return { item, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.item);
  }
}
