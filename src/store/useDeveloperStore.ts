import { create } from "zustand";

export type SubmissionStatus = "Draft" | "Submitted" | "In Review" | "Approved";

export interface PluginSubmission {
  id: string; // Reverse-DNS plugin ID, e.g. "at.ac.tuwien.mensa-radar"
  name: string;
  version: string;
  description: string;
  categories: string[];
  githubRepo: string;
  releaseTag: string;
  networkJustifications: Record<string, string>;
  storageQuotaBytes: number;
  notifications: boolean;
  status: SubmissionStatus;
  submittedAt: string;
  prNumber?: number;
  prUrl?: string;
  reviewNotes?: string;
}

export interface DeveloperState {
  submissions: PluginSubmission[];
  isPublishModalOpen: boolean;

  setPublishModalOpen: (open: boolean) => void;
  addSubmission: (
    data: Omit<PluginSubmission, "submittedAt" | "status" | "prNumber" | "prUrl">
  ) => PluginSubmission;
  updateSubmissionStatus: (id: string, status: SubmissionStatus, notes?: string) => void;
  deleteSubmission: (id: string) => void;
}

const INITIAL_SUBMISSIONS: PluginSubmission[] = [
    {
      id: "at.ac.tuwien.mensa-radar",
      name: "TU Mensa Radar",
      version: "1.2.0",
      description: "Real-time daily lunch menus and wait time estimators for Freihaus & Resselgasse mensas.",
      categories: ["campus", "tools"],
      githubRepo: "https://github.com/tuwien-community/tu-mensa-radar",
      releaseTag: "v1.2.0",
      networkJustifications: {
        "https://menu.mensen.at/*": "Required to scrape daily meal plans and pricing.",
      },
      storageQuotaBytes: 1048576,
      notifications: true,
      status: "Approved",
      submittedAt: "2026-09-28T14:22:00Z",
      prNumber: 14,
      prUrl: "https://github.com/tuwien-community/tu-cockpit-store/pull/14",
      reviewNotes: "Security audit passed. Zero credential access, sandboxed DOM rendering verified.",
    },
    {
      id: "at.ac.tuwien.tiss-schedule-sync",
      name: "TISS Live Calendar Exporter",
      version: "0.9.1",
      description: "One-click iCal calendar export and live synchronization for enrolled TISS courses.",
      categories: ["academics", "productivity"],
      githubRepo: "https://github.com/tuwien-community/tiss-schedule-sync",
      releaseTag: "v0.9.1",
      networkJustifications: {
        "https://tiss.tuwien.ac.at/events/*": "Fetches authenticated student course schedule dates.",
      },
      storageQuotaBytes: 2097152,
      notifications: false,
      status: "In Review",
      submittedAt: "2026-10-10T09:15:00Z",
      prNumber: 28,
      prUrl: "https://github.com/tuwien-community/tu-cockpit-store/pull/28",
  },
];

export const useDeveloperStore = create<DeveloperState>((set, get) => ({
  submissions: INITIAL_SUBMISSIONS,
  isPublishModalOpen: false,

  setPublishModalOpen: (open) => set({ isPublishModalOpen: open }),

  addSubmission: (data) => {
    const prNumber = Math.floor(30 + Math.random() * 50);
    const newSubmission: PluginSubmission = {
      ...data,
      status: "Submitted",
      submittedAt: new Date().toISOString(),
      prNumber,
      prUrl: `https://github.com/tuwien-community/tu-cockpit-store/pull/${prNumber}`,
      reviewNotes: "Dispatched to GitOps queue. Automated static analysis and review queued.",
    };

    set({
      submissions: [newSubmission, ...get().submissions],
      isPublishModalOpen: false,
    });

    return newSubmission;
  },

  updateSubmissionStatus: (id, status, notes) => {
    set({
      submissions: get().submissions.map((sub) =>
        sub.id === id ? { ...sub, status, reviewNotes: notes || sub.reviewNotes } : sub
      ),
    });
  },

  deleteSubmission: (id) => {
    set({
      submissions: get().submissions.filter((sub) => sub.id !== id),
    });
  },
}));
