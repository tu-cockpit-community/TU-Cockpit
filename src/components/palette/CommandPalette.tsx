import React, { useEffect, useRef, useMemo } from "react";
import { usePaletteStore } from "@/store/usePaletteStore";
import { useAppStore } from "@/store/useAppStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  FuzzySearchService,
  PaletteItem,
  PaletteContext,
} from "@/services/palette/FuzzySearchService";
import {
  Search,
  MapPin,
  GraduationCap,
  Puzzle,
  BookOpen,
  PanelLeftClose,
  SunMoon,
  KeyRound,
  Store,
  Settings,
  CornerDownLeft,
  X,
} from "lucide-react";

interface CommandPaletteProps {
  onOpenSettings: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onOpenSettings }) => {
  const {
    isOpen,
    searchQuery,
    selectedIndex,
    closePalette,
    togglePalette,
    setSearchQuery,
    setSelectedIndex,
  } = usePaletteStore();

  const {
    installedPlugins,
    setActiveView,
    toggleSidebar,
  } = useAppStore();

  const { activeThemeId, setTheme } = useThemeStore();
  const { setLoginModalOpen } = useAuthStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global shortcut listener: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        togglePalette();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePalette]);

  // Focus input whenever opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const paletteContext: PaletteContext = useMemo(
    () => ({
      installedPlugins,
      setActiveView,
      toggleSidebar,
      toggleTheme: () => {
        const isDark = activeThemeId.includes("dark") || activeThemeId === "oled-stealth";
        setTheme(isDark ? "tu-wien-light" : "tu-wien-dark");
      },
      openSettings: onOpenSettings,
      openLoginModal: () => setLoginModalOpen(true),
      currentTheme: activeThemeId,
    }),
    [installedPlugins, setActiveView, toggleSidebar, activeThemeId, setTheme, onOpenSettings, setLoginModalOpen]
  );

  const allItems = useMemo(() => {
    return FuzzySearchService.getAllItems(paletteContext);
  }, [paletteContext]);

  const filteredItems = useMemo(() => {
    return FuzzySearchService.search(allItems, searchQuery);
  }, [allItems, searchQuery]);

  // Ensure selectedIndex is within bounds
  useEffect(() => {
    if (selectedIndex >= filteredItems.length && filteredItems.length > 0) {
      setSelectedIndex(0);
    }
  }, [filteredItems, selectedIndex, setSelectedIndex]);

  // Handle keyboard navigation within the palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(
        selectedIndex < filteredItems.length - 1 ? selectedIndex + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        selectedIndex > 0 ? selectedIndex - 1 : Math.max(filteredItems.length - 1, 0)
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        executeItem(filteredItems[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
    }
  };

  const executeItem = async (item: PaletteItem) => {
    closePalette();
    try {
      await item.action();
    } catch (err) {
      console.error("Failed to execute command item action:", err);
    }
  };

  const getItemIcon = (iconName?: string) => {
    switch (iconName) {
      case "MapPin":
        return <MapPin className="w-4 h-4 text-rose-400" />;
      case "GraduationCap":
        return <GraduationCap className="w-4 h-4 text-[var(--tu-accent)]" />;
      case "BookOpen":
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case "PanelLeftClose":
        return <PanelLeftClose className="w-4 h-4 text-amber-400" />;
      case "SunMoon":
        return <SunMoon className="w-4 h-4 text-indigo-400" />;
      case "KeyRound":
        return <KeyRound className="w-4 h-4 text-amber-400" />;
      case "Store":
        return <Store className="w-4 h-4 text-cyan-400" />;
      case "Settings":
        return <Settings className="w-4 h-4 text-[var(--tu-text-secondary)]" />;
      default:
        return <Puzzle className="w-4 h-4 text-[var(--tu-text-accent)]" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-start justify-center pt-20 px-4 transition-all duration-150 animate-in fade-in"
      onClick={() => closePalette()}
    >
      <div
        className="bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col text-[var(--tu-text-primary)]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--tu-border)] bg-[var(--tu-bg-card)]">
          <Search className="w-5 h-5 text-[var(--tu-text-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campus rooms, portals, courses, actions..."
            className="flex-1 bg-transparent text-sm text-[var(--tu-text-primary)] placeholder-[var(--tu-text-muted)] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-[var(--tu-text-muted)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded">
            Esc
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-96 overflow-y-auto p-2 divide-y divide-[var(--tu-border)]/40 space-y-1"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--tu-text-secondary)] space-y-2">
              <Search className="w-8 h-8 text-[var(--tu-text-muted)] mx-auto opacity-40" />
              <p className="font-semibold">No results found for "{searchQuery}"</p>
              <p className="text-[11px] text-[var(--tu-text-muted)]">
                Try searching for room codes (e.g. "EI 7", "HS 1"), courses ("188.956"), or actions ("theme").
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between gap-3 p-2.5 rounded-[var(--tu-radius-sm)] transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[var(--tu-accent)]/15 text-[var(--tu-text-primary)] border border-[var(--tu-accent)]/30"
                      : "text-[var(--tu-text-secondary)] hover:bg-[var(--tu-bg-hover)] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] shrink-0">
                      {getItemIcon(item.iconName)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold truncate ${
                            isSelected ? "text-[var(--tu-text-primary)]" : ""
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-[var(--tu-bg-card)] border border-[var(--tu-border)] text-[var(--tu-text-muted)] shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--tu-text-muted)] truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-[var(--tu-accent)] font-semibold">
                        <span>Select</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2 border-t border-[var(--tu-border)] bg-[var(--tu-bg-card)] flex items-center justify-between text-[11px] text-[var(--tu-text-muted)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-[10px] font-mono">
                ↑↓
              </kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-[10px] font-mono">
                ↵
              </kbd>
              <span>Execute</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-[10px] font-mono">
                Esc
              </kbd>
              <span>Close</span>
            </span>
          </div>

          <div className="text-[10px] font-mono">
            <span>TU Wien Spotlight</span>
          </div>
        </div>
      </div>
    </div>
  );
};
