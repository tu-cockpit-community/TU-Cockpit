import React from "react";
import { useAppStore, NavOrientation } from "@/store/useAppStore";
import {
  PanelLeft,
  PanelRight,
  PanelBottom,
  PanelTop,
  FolderPlus,
  Check,
  Layout,
  Layers,
} from "lucide-react";

export const LayoutSettings: React.FC = () => {
  const {
    navOrientation,
    setNavOrientation,
    categories,
    setCategoryModalOpen,
  } = useAppStore();

  const orientations: {
    id: NavOrientation;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: "left",
      title: "Left Sidebar (Workstation)",
      description: "Vertical collapsible sidebar on the left side of the screen with category accordions.",
      icon: PanelLeft,
    },
    {
      id: "right",
      title: "Right Sidebar",
      description: "Vertical sidebar on the right side of the screen for right-handed setups.",
      icon: PanelRight,
    },
    {
      id: "bottom",
      title: "Bottom Floating Dock",
      description: "Mac-style glassmorphic dock anchored at the bottom edge.",
      icon: PanelBottom,
    },
    {
      id: "top",
      title: "Top Navigation Bar",
      description: "Clean horizontal bar pinned below the executive status header.",
      icon: PanelTop,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-[var(--tu-text-primary)]">
      {/* Header */}
      <div>
        <h3 className="text-base font-bold flex items-center gap-2">
          <Layout className="w-5 h-5 text-[var(--tu-accent)]" />
          Navigation Layout & Orientation
        </h3>
        <p className="text-xs text-[var(--tu-text-secondary)] mt-0.5">
          Choose where your workstation navigation bar is positioned and manage your custom tool categories.
        </p>
      </div>

      {/* Orientation Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {orientations.map((item) => {
          const Icon = item.icon;
          const isSelected = navOrientation === item.id;

          return (
            <div
              key={item.id}
              onClick={() => setNavOrientation(item.id)}
              className={`p-4 rounded-[var(--tu-radius-lg)] border cursor-pointer transition-all duration-200 flex items-start gap-3.5 ${
                isSelected
                  ? "bg-[var(--tu-accent)]/10 border-[var(--tu-accent)] shadow-md shadow-[var(--tu-accent)]/10"
                  : "bg-[var(--tu-bg-surface)] border-[var(--tu-border)] hover:border-[var(--tu-border-focus)] hover:bg-[var(--tu-bg-hover)]"
              }`}
            >
              <div
                className={`p-2.5 rounded-[var(--tu-radius)] shrink-0 transition-colors ${
                  isSelected
                    ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)]"
                    : "bg-[var(--tu-bg-card)] text-[var(--tu-text-secondary)]"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[var(--tu-text-primary)]">
                    {item.title}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--tu-text-secondary)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Categories Overview */}
      <div className="p-5 rounded-[var(--tu-radius-lg)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] shadow-[var(--tu-shadow)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-[var(--tu-text-primary)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--tu-text-accent)]" />
              Custom Tool Categories
            </h4>
            <p className="text-xs text-[var(--tu-text-secondary)] mt-0.5">
              Organize your installed portals, widgets, and plugins into custom groups.
            </p>
          </div>

          <button
            onClick={() => setCategoryModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-[var(--tu-radius-sm)] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            Manage Categories
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-3 rounded-[var(--tu-radius)] bg-[var(--tu-bg-card)] border border-[var(--tu-border)] space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-[var(--tu-text-primary)]">
                  {cat.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--tu-bg-base)] text-[var(--tu-text-muted)] border border-[var(--tu-border)]">
                  {cat.pluginIds.length} items
                </span>
              </div>
              <span className="text-[10px] text-[var(--tu-text-muted)] block">
                {cat.isDefault ? "System Category" : "Custom Category"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
