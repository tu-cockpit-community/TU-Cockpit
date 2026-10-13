import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface SlideSearchResult {
  course_id: string;
  file_name: string;
  page_number: number;
  snippet: string;
  file_path: string;
}

export interface CachedCourseFile {
  id: string;
  course_id: string;
  course_name: string;
  filename: string;
  file_path: string;
  file_size: number;
  cached_at: string;
}

interface VaultState {
  cachedFiles: CachedCourseFile[];
  searchResults: SlideSearchResult[];
  searchQuery: string;
  isSearching: boolean;
  isVaultModalOpen: boolean;
  selectedPdf: { filePath: string; fileName: string; page?: number } | null;
  base64Pdf: string | null;
  isLoadingPdf: boolean;

  setVaultModalOpen: (open: boolean) => void;
  fetchCachedFiles: () => Promise<void>;
  searchSlides: (query: string) => Promise<void>;
  cachePdf: (courseId: string, url: string, filename: string) => Promise<void>;
  openPdf: (filePath: string, fileName: string, page?: number) => Promise<void>;
  closePdf: () => void;
}

export const useVaultStore = create<VaultState>((set) => ({
  cachedFiles: [],
  searchResults: [],
  searchQuery: "",
  isSearching: false,
  isVaultModalOpen: false,
  selectedPdf: null,
  base64Pdf: null,
  isLoadingPdf: false,

  setVaultModalOpen: (open) => set({ isVaultModalOpen: open }),

  fetchCachedFiles: async () => {
    try {
      const files = await invoke<CachedCourseFile[]>("get_cached_vault_files");
      set({ cachedFiles: files });
    } catch (err) {
      console.warn("fetchCachedFiles fallback:", err);
      // Demo fallback in browser
      set({
        cachedFiles: [
          {
            id: "188.956_Kapitel_04_Sortieren.pdf",
            course_id: "188.956",
            course_name: "VU Algorithmen und Datenstrukturen",
            filename: "Kapitel_04_Sortieren.pdf",
            file_path: "/offline_vault/188.956/Kapitel_04_Sortieren.pdf",
            file_size: 2458000,
            cached_at: new Date().toISOString(),
          },
          {
            id: "104.261_Analysis_Folien_Woche_3.pdf",
            course_id: "104.261",
            course_name: "VO Analysis 1 für Informatik",
            filename: "Analysis_Folien_Woche_3.pdf",
            file_path: "/offline_vault/104.261/Analysis_Folien_Woche_3.pdf",
            file_size: 1890000,
            cached_at: new Date().toISOString(),
          },
        ],
      });
    }
  },

  searchSlides: async (query: string) => {
    set({ searchQuery: query });
    if (!query.trim()) {
      set({ searchResults: [], isSearching: false });
      return;
    }

    set({ isSearching: true });
    try {
      const results = await invoke<SlideSearchResult[]>("search_offline_slides", { query });
      set({ searchResults: results });
    } catch (err) {
      console.warn("searchSlides fallback:", err);
      // Fallback sample search result
      if (query.toLowerCase().includes("sort") || query.toLowerCase().includes("quick")) {
        set({
          searchResults: [
            {
              course_id: "188.956",
              file_name: "Kapitel_04_Sortieren.pdf",
              page_number: 14,
              snippet: "Der <b>Quicksort</b>-Algorithmus hat eine durchschnittliche Laufzeitkomplexitaet von O(n log n)...",
              file_path: "/offline_vault/188.956/Kapitel_04_Sortieren.pdf",
            },
          ],
        });
      } else {
        set({ searchResults: [] });
      }
    } finally {
      set({ isSearching: false });
    }
  },

  cachePdf: async (courseId: string, url: string, filename: string) => {
    try {
      const file = await invoke<CachedCourseFile>("cache_course_pdf", {
        courseId,
        fileUrl: url,
        filename,
      });
      set((state) => ({
        cachedFiles: [file, ...state.cachedFiles.filter((f) => f.id !== file.id)],
      }));
    } catch (err) {
      console.error("cachePdf failed:", err);
    }
  },

  openPdf: async (filePath: string, fileName: string, page?: number) => {
    set({
      selectedPdf: { filePath, fileName, page },
      isLoadingPdf: true,
      base64Pdf: null,
    });
    try {
      const b64 = await invoke<string>("read_vault_pdf_bytes", { filePath });
      set({ base64Pdf: b64 });
    } catch {
      // Offline fallback: provide an empty placeholder or data URI
      set({ base64Pdf: null });
    } finally {
      set({ isLoadingPdf: false });
    }
  },

  closePdf: () => set({ selectedPdf: null, base64Pdf: null }),
}));
