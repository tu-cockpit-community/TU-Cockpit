import React, { useEffect, useRef, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useSplitStore, PORTAL_OPTIONS } from "@/store/useSplitStore";
import {
  Columns2,
  ExternalLink,
  Sparkles,
  X,
  Maximize2,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

export const SplitViewContainer: React.FC = () => {
  const {
    isSplitActive,
    leftPortalId,
    rightPortalId,
    splitRatio,
    setSplitActive,
    setLeftPortalId,
    setRightPortalId,
    setSplitRatio,
  } = useSplitStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isNative, setIsNative] = useState(true);

  const leftPortal = PORTAL_OPTIONS.find((p) => p.id === leftPortalId) || PORTAL_OPTIONS[0];
  const rightPortal = PORTAL_OPTIONS.find((p) => p.id === rightPortalId) || PORTAL_OPTIONS[2];

  // Sync split view dimensions to Tauri native child-webviews
  const updateSplitBounds = useCallback(async () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    try {
      await invoke("orchestrate_split_portals", {
        portalLeft: leftPortalId,
        portalRight: rightPortalId,
        splitRatio,
        totalX: Math.round(rect.left),
        totalY: Math.round(rect.top),
        totalWidth: Math.round(rect.width),
        totalHeight: Math.round(rect.height),
      });
      setIsNative(true);
    } catch (err) {
      if (typeof (window as any).__TAURI_INTERNALS__ !== "undefined") {
        console.error("orchestrate_split_portals failed:", err);
      }
      setIsNative(false);
    }
  }, [leftPortalId, rightPortalId, splitRatio]);

  useEffect(() => {
    if (!isSplitActive) return;

    updateSplitBounds();

    const handleResize = () => {
      updateSplitBounds();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      invoke("hide_native_portal", { portalId: leftPortalId }).catch(() => {});
      invoke("hide_native_portal", { portalId: rightPortalId }).catch(() => {});
    };
  }, [isSplitActive, leftPortalId, rightPortalId, updateSplitBounds]);

  // Handle divider dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = moveEvent.clientX - rect.left;
      const newRatio = currentX / rect.width;
      setSplitRatio(newRatio);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleDetachWindow = async (portalId: string, url: string) => {
    try {
      await invoke("detach_portal_window", { portalId, url });
    } catch (err) {
      console.error("detach_portal_window failed:", err);
      window.open(url, "_blank", "width=1024,height=768");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] overflow-hidden shadow-[var(--tu-shadow)]">
      {/* Split Control Header */}
      <div className="h-11 border-b border-[var(--tu-border)] bg-[var(--tu-bg-card)] px-3 flex items-center justify-between shrink-0 select-none text-xs">
        {/* Left Portal Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--tu-accent)]/15 border border-[var(--tu-accent)]/30 text-[var(--tu-accent)] font-semibold text-[11px]">
            <Columns2 className="w-3 h-3" />
            <span>Split Workstation</span>
          </div>

          <div className="relative inline-flex items-center">
            <select
              value={leftPortalId}
              onChange={(e) => setLeftPortalId(e.target.value)}
              className="bg-[var(--tu-bg-surface)] text-[var(--tu-text-primary)] border border-[var(--tu-border)] rounded-[var(--tu-radius-sm)] px-2.5 py-1 text-xs font-medium cursor-pointer pr-7 appearance-none focus:outline-none focus:border-[var(--tu-accent)]"
            >
              {PORTAL_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  Left: {opt.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[var(--tu-text-muted)] absolute right-2 pointer-events-none" />
          </div>
        </div>

        {/* Center Presets */}
        <div className="flex items-center gap-1.5 bg-[var(--tu-bg-surface)] p-0.5 rounded-[var(--tu-radius-sm)] border border-[var(--tu-border)]">
          <button
            onClick={() => setSplitRatio(0.5)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              Math.abs(splitRatio - 0.5) < 0.05
                ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)]"
                : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
            }`}
            title="Equal Split"
          >
            1:1 Split
          </button>
          <button
            onClick={() => setSplitRatio(0.7)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              Math.abs(splitRatio - 0.7) < 0.05
                ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)]"
                : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
            }`}
            title="70% Left, 30% Right"
          >
            7:3 Split
          </button>
          <button
            onClick={() => setSplitRatio(0.3)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              Math.abs(splitRatio - 0.3) < 0.05
                ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)]"
                : "text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)]"
            }`}
            title="30% Left, 70% Right"
          >
            3:7 Split
          </button>
        </div>

        {/* Right Portal Selector & Detach / Close Controls */}
        <div className="flex items-center gap-2">
          <div className="relative inline-flex items-center">
            <select
              value={rightPortalId}
              onChange={(e) => setRightPortalId(e.target.value)}
              className="bg-[var(--tu-bg-surface)] text-[var(--tu-text-primary)] border border-[var(--tu-border)] rounded-[var(--tu-radius-sm)] px-2.5 py-1 text-xs font-medium cursor-pointer pr-7 appearance-none focus:outline-none focus:border-[var(--tu-accent)]"
            >
              {PORTAL_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  Right: {opt.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[var(--tu-text-muted)] absolute right-2 pointer-events-none" />
          </div>

          <button
            onClick={() => handleDetachWindow(rightPortal.id, rightPortal.url)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] transition-colors cursor-pointer text-[11px]"
            title="Pop out right portal into a detached floating OS window"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Pop-Out Window</span>
          </button>

          <button
            onClick={() => setSplitActive(false)}
            className="p-1 rounded text-[var(--tu-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Exit Split Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dual Webview Viewport Area */}
      <div
        ref={containerRef}
        className={`flex-1 w-full h-full relative flex min-h-[500px] select-none ${
          isDragging ? "cursor-col-resize select-none pointer-events-none" : ""
        }`}
      >
        {/* Left Webview Placeholder / Non-Tauri fallback */}
        <div
          style={{ width: `${splitRatio * 100}%` }}
          className="h-full relative border-r border-[var(--tu-border)]/50 flex flex-col items-center justify-center p-4 bg-black/5"
        >
          {!isNative && (
            <div className="text-center space-y-2 p-4 max-w-xs">
              <ShieldCheck className="w-8 h-8 text-[var(--tu-accent)] mx-auto opacity-70" />
              <div className="font-bold text-xs text-[var(--tu-text-primary)]">
                {leftPortal.name}
              </div>
              <p className="text-[11px] text-[var(--tu-text-secondary)]">
                Native child-webview active in desktop runtime.
              </p>
              <a
                href={leftPortal.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] rounded font-medium mt-1"
              >
                <ExternalLink className="w-3 h-3" />
                Open External
              </a>
            </div>
          )}
        </div>

        {/* Draggable Divider Bar */}
        <div
          onMouseDown={handleMouseDown}
          className={`w-2 relative z-30 cursor-col-resize flex items-center justify-center transition-colors group ${
            isDragging
              ? "bg-[var(--tu-accent)]"
              : "bg-[var(--tu-border)]/40 hover:bg-[var(--tu-accent)]"
          }`}
          title="Drag to adjust split ratio"
        >
          <div className="w-0.5 h-8 rounded-full bg-[var(--tu-text-muted)] group-hover:bg-white transition-colors" />
        </div>

        {/* Right Webview Placeholder / Non-Tauri fallback */}
        <div
          style={{ width: `${(1 - splitRatio) * 100}%` }}
          className="h-full flex-1 relative flex flex-col items-center justify-center p-4 bg-black/5"
        >
          {!isNative && (
            <div className="text-center space-y-2 p-4 max-w-xs">
              <Sparkles className="w-8 h-8 text-[var(--tu-accent)] mx-auto opacity-70" />
              <div className="font-bold text-xs text-[var(--tu-text-primary)]">
                {rightPortal.name}
              </div>
              <p className="text-[11px] text-[var(--tu-text-secondary)]">
                Native child-webview active in desktop runtime.
              </p>
              <a
                href={rightPortal.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] rounded font-medium mt-1"
              >
                <ExternalLink className="w-3 h-3" />
                Open External
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
