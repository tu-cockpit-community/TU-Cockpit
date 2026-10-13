import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface DeadlineItem {
  id: string;
  course_id: string;
  course_name: string;
  title: string;
  due_date: string;
  url: string;
  source: string;
  completed: boolean;
  notified_24h: boolean;
  notified_2h: boolean;
}

interface DeadlineState {
  deadlines: DeadlineItem[];
  isLoading: boolean;
  isAgendaOpen: boolean;
  setAgendaOpen: (open: boolean) => void;
  fetchDeadlines: () => Promise<void>;
  syncDeadlines: (feedUrl: string) => Promise<void>;
  toggleCompleted: (id: string, completed: boolean) => Promise<void>;
  addDeadline: (item: DeadlineItem) => Promise<void>;
  exportIcs: () => Promise<string>;
  getUpcomingCount24h: () => number;
}

export const useDeadlineStore = create<DeadlineState>((set, get) => ({
  deadlines: [],
  isLoading: false,
  isAgendaOpen: false,
  setAgendaOpen: (open) => set({ isAgendaOpen: open }),

  fetchDeadlines: async () => {
    try {
      set({ isLoading: true });
      const items = await invoke<DeadlineItem[]>("get_student_deadlines");
      set({ deadlines: items });
    } catch (err) {
      console.warn("fetchDeadlines fallback:", err);
      // Fallback sample data if outside desktop runtime
      if (get().deadlines.length === 0) {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 18 * 60 * 60 * 1000);
        const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        set({
          deadlines: [
            {
              id: "sample_1",
              course_id: "188.956",
              course_name: "VU Algorithmen und Datenstrukturen",
              title: "Übungsblatt 2 - Sortieralgorithmen",
              due_date: tomorrow.toISOString(),
              url: "https://tuwel.tuwien.ac.at",
              source: "TUWEL",
              completed: false,
              notified_24h: false,
              notified_2h: false,
            },
            {
              id: "sample_2",
              course_id: "104.261",
              course_name: "VO Analysis 1 für Informatik",
              title: "Zwischentest 1 (Freihaus HS 1)",
              due_date: inThreeDays.toISOString(),
              url: "https://tiss.tuwien.ac.at",
              source: "TISS",
              completed: false,
              notified_24h: false,
              notified_2h: false,
            },
          ],
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  syncDeadlines: async (feedUrl: string) => {
    set({ isLoading: true });
    try {
      const items = await invoke<DeadlineItem[]>("sync_tuwel_deadlines", {
        icalFeedUrl: feedUrl,
      });
      set({ deadlines: items });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleCompleted: async (id: string, completed: boolean) => {
    try {
      await invoke("toggle_deadline_completed", { id, completed });
    } catch {
      // offline fallback
    }
    set((state) => ({
      deadlines: state.deadlines.map((d) =>
        d.id === id ? { ...d, completed } : d
      ),
    }));
  },

  addDeadline: async (item: DeadlineItem) => {
    try {
      await invoke("add_student_deadline", { item });
    } catch {
      // offline fallback
    }
    set((state) => ({
      deadlines: [...state.deadlines.filter((d) => d.id !== item.id), item].sort(
        (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      ),
    }));
  },

  exportIcs: async () => {
    return await invoke<string>("export_local_ics_feed");
  },

  getUpcomingCount24h: () => {
    const now = Date.now();
    const threshold = now + 24 * 60 * 60 * 1000;
    return get().deadlines.filter((d) => {
      if (d.completed) return false;
      const due = new Date(d.due_date).getTime();
      return due > now && due <= threshold;
    }).length;
  },
}));
