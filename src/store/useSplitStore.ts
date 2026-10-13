import { create } from "zustand";

export interface PortalOption {
  id: string;
  name: string;
  url: string;
}

export const PORTAL_OPTIONS: PortalOption[] = [
  { id: "tuwien.official.tuwel", name: "TUWEL (Moodle)", url: "https://tuwel.tuwien.ac.at/" },
  { id: "tuwien.official.tiss", name: "TISS Portal", url: "https://tiss.tuwien.ac.at/" },
  { id: "tuwien.official.vowi", name: "VoWi Wiki", url: "https://vowi.fsinf.at/" },
  { id: "tuwien.official.tumaps", name: "TU Maps", url: "https://maps.tuwien.ac.at/" },
];

interface SplitState {
  isSplitActive: boolean;
  leftPortalId: string;
  rightPortalId: string;
  splitRatio: number; // clamped 0.2 to 0.8
  setSplitActive: (active: boolean) => void;
  setLeftPortalId: (id: string) => void;
  setRightPortalId: (id: string) => void;
  setSplitRatio: (ratio: number) => void;
  toggleSplit: () => void;
}

export const useSplitStore = create<SplitState>((set) => ({
  isSplitActive: false,
  leftPortalId: "tuwien.official.tuwel",
  rightPortalId: "tuwien.official.vowi",
  splitRatio: 0.5,
  setSplitActive: (active) => set({ isSplitActive: active }),
  setLeftPortalId: (id) => set({ leftPortalId: id }),
  setRightPortalId: (id) => set({ rightPortalId: id }),
  setSplitRatio: (ratio) => set({ splitRatio: Math.max(0.2, Math.min(0.8, ratio)) }),
  toggleSplit: () => set((state) => ({ isSplitActive: !state.isSplitActive })),
}));
