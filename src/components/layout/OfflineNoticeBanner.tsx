import React from "react";
import { useNetworkStore } from "@/store/useNetworkStore";
import { useAppStore } from "@/store/useAppStore";
import { usePaletteStore } from "@/store/usePaletteStore";
import { WifiOff, FolderDown, Search, X } from "lucide-react";

export const OfflineNoticeBanner: React.FC = () => {
  const { isOnline, isDismissed, setDismissed } = useNetworkStore();
  const { setActiveView } = useAppStore();
  const { openPalette } = usePaletteStore();

  if (isOnline || isDismissed) {
    return null;
  }

  return (
    <div className="w-full bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-200 select-none animate-in slide-in-from-top-2 duration-200 z-20">
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
          <WifiOff className="w-3 h-3" />
        </div>
        <div>
          <span className="font-semibold text-amber-300">Offline Mode Active</span>
          <span className="hidden sm:inline text-amber-300/80 ml-1.5">
            — Disconnected from campus network. Local cached materials remain available.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveView("plugin", "tuwien.community.slide-vault")}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-medium transition-colors cursor-pointer text-[11px]"
          title="Open Slide Vault for cached course slides"
        >
          <FolderDown className="w-3 h-3" />
          <span>Slide Vault</span>
        </button>

        <button
          onClick={openPalette}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300/90 border border-amber-500/20 font-medium transition-colors cursor-pointer text-[11px]"
          title="Search offline rooms & cached notes"
        >
          <Search className="w-3 h-3" />
          <span>Search Offline (⌘K)</span>
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer ml-1"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
