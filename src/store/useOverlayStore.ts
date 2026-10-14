import { create } from "zustand";

export interface OverlayState {
  activeOverlays: Set<string>;
  openOverlay: (id: string) => void;
  closeOverlay: (id: string) => void;
  isAnyOverlayActive: boolean;
}

export const useOverlayStore = create<OverlayState>((set) => ({
  activeOverlays: new Set<string>(),
  isAnyOverlayActive: false,
  openOverlay: (id: string) =>
    set((state) => {
      const next = new Set(state.activeOverlays);
      next.add(id);
      return {
        activeOverlays: next,
        isAnyOverlayActive: next.size > 0,
      };
    }),
  closeOverlay: (id: string) =>
    set((state) => {
      const next = new Set(state.activeOverlays);
      next.delete(id);
      return {
        activeOverlays: next,
        isAnyOverlayActive: next.size > 0,
      };
    }),
}));
