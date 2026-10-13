import { create } from "zustand";

interface PaletteState {
  isOpen: boolean;
  searchQuery: string;
  selectedIndex: number;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedIndex: (index: number) => void;
}

export const usePaletteStore = create<PaletteState>((set) => ({
  isOpen: false,
  searchQuery: "",
  selectedIndex: 0,
  openPalette: () => set({ isOpen: true, searchQuery: "", selectedIndex: 0 }),
  closePalette: () => set({ isOpen: false, searchQuery: "", selectedIndex: 0 }),
  togglePalette: () =>
    set((state) => ({
      isOpen: !state.isOpen,
      searchQuery: "",
      selectedIndex: 0,
    })),
  setSearchQuery: (query) => set({ searchQuery: query, selectedIndex: 0 }),
  setSelectedIndex: (index) => set({ selectedIndex: index }),
}));
