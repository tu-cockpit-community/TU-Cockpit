import React, { useEffect, useRef, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-shell";
import {
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Lock,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  KeyRound,
} from "lucide-react";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useAppStore } from "@/store/useAppStore";

interface NativePortalContainerProps {
  portalId: string;
  url: string;
  title?: string;
  extraActions?: React.ReactNode;
}

export const NativePortalContainer: React.FC<NativePortalContainerProps> = ({
  portalId,
  url,
  title,
  extraActions,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNative, setIsNative] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const isAnyOverlayActive = useOverlayStore((state) => state.isAnyOverlayActive);
  const { isSidebarCollapsed, navOrientation } = useAppStore();

  const lastBoundsRef = useRef<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const rafIdRef = useRef<number | null>(null);

  const syncBounds = useCallback(async () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const x = Math.round(rect.left);
    const y = Math.round(rect.top);
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    const last = lastBoundsRef.current;
    const hasChanged =
      Math.abs(last.x - x) >= 1 ||
      Math.abs(last.y - y) >= 1 ||
      Math.abs(last.width - width) >= 1 ||
      Math.abs(last.height - height) >= 1;

    if (!hasChanged) {
      return;
    }

    lastBoundsRef.current = { x, y, width, height };

    try {
      await invoke("resize_native_portal", {
        portalId,
        x,
        y,
        width,
        height,
      });
    } catch {
      // Ignore if webview not yet ready
    }
  }, [portalId]);

  const scheduleSync = useCallback(() => {
    if (rafIdRef.current !== null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      syncBounds();
    });
  }, [syncBounds]);

  const updateBounds = useCallback(async () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const x = Math.round(rect.left);
    const y = Math.round(rect.top);
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    lastBoundsRef.current = { x, y, width, height };

    try {
      await invoke("create_or_show_native_portal", {
        portalId,
        url,
        x,
        y,
        width,
        height,
      });
      setIsNative(true);
    } catch (err) {
      if (typeof (window as any).__TAURI_INTERNALS__ !== "undefined") {
        console.error("create_or_show_native_portal failed:", err);
      }
      setIsNative(false);
    }
  }, [portalId, url]);

  useEffect(() => {
    updateBounds();

    const resizeObserver = new ResizeObserver(() => {
      scheduleSync();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const handleWindowResize = () => {
      scheduleSync();
    };
    window.addEventListener("resize", handleWindowResize);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleWindowResize);
      invoke("hide_native_portal", { portalId }).catch(() => {});
    };
  }, [portalId, updateBounds, scheduleSync]);

  // High-frequency RAF tracking loop during sidebar animation (220ms matches duration-200)
  useEffect(() => {
    let animId: number;
    const startTime = performance.now();
    const duration = 220;

    const step = (now: number) => {
      syncBounds();
      if (now - startTime < duration) {
        animId = requestAnimationFrame(step);
      }
    };
    animId = requestAnimationFrame(step);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isSidebarCollapsed, navOrientation, syncBounds]);

  // Invisibility Bus: Hide native child-webviews when any React modal/overlay is open
  useEffect(() => {
    if (isAnyOverlayActive) {
      invoke("set_portals_visibility", { visible: false }).catch(() => {});
    } else {
      invoke("set_portals_visibility", { visible: true })
        .then(() => {
          updateBounds();
        })
        .catch(() => {});
    }
  }, [isAnyOverlayActive, updateBounds]);

  const handleGoBack = async () => {
    try {
      await invoke("portal_go_back", { portalId });
    } catch {
      window.history.back();
    }
  };

  const handleGoForward = async () => {
    try {
      await invoke("portal_go_forward", { portalId });
    } catch {
      window.history.forward();
    }
  };

  const handleSetZoom = async (newZoom: number) => {
    const clamped = Math.min(Math.max(newZoom, 50), 200);
    setZoomLevel(clamped);
    try {
      await invoke("portal_set_zoom", { portalId, zoom: clamped / 100 });
    } catch (err) {
      console.warn("portal_set_zoom failed:", err);
    }
  };

  const handleDetachWindow = async () => {
    try {
      await invoke("detach_portal_window", { portalId, url });
    } catch (err) {
      console.error("detach_portal_window failed:", err);
      window.open(url, "_blank", "width=1024,height=768");
    }
  };

  const handleReload = async () => {
    updateBounds();
    try {
      await invoke("navigate_native_portal", { portalId, url });
    } catch {
      // Browser fallback handled by updateBounds
    }
  };

  const handleAutofill = useCallback(async () => {
    try {
      await invoke("inject_portal_autofill", { portalId });
    } catch (err) {
      console.debug("inject_portal_autofill ignored or failed:", err);
    }
  }, [portalId]);

  // Automatic post-mount autofill daemon for Shibboleth SSO (700ms and 2000ms after load)
  useEffect(() => {
    const t1 = setTimeout(() => {
      handleAutofill();
    }, 700);
    const t2 = setTimeout(() => {
      handleAutofill();
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [handleAutofill]);

  const handleOpenExternal = async () => {
    try {
      await open(url);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const getPortalBadge = () => {
    const id = portalId.toLowerCase();
    if (id.includes("tuwel")) return "TUWEL";
    if (id.includes("tiss")) return "TISS";
    if (id.includes("vowi")) return "VoWi";
    if (id.includes("tumaps") || id.includes("maps")) return "TU Maps";
    return title || "Portal";
  };

  return (
    <div className="w-full h-full flex flex-col bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] overflow-hidden shadow-[var(--tu-shadow)]">
      {/* Native Webview Navigation Bar */}
      <div className="h-10 border-b border-[var(--tu-border)] bg-[var(--tu-bg-card)] px-3 flex items-center justify-between shrink-0 select-none text-xs gap-2">
        {/* Left: Navigation and Portal Badge */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleGoBack}
              className="p-1 rounded text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors cursor-pointer"
              title="Go Back"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleGoForward}
              className="p-1 rounded text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors cursor-pointer"
              title="Go Forward"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReload}
              className="p-1 rounded text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors cursor-pointer"
              title="Reload Portal Page"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-[var(--tu-border)] mx-0.5" />

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--tu-accent)]/15 border border-[var(--tu-accent)]/30 text-[var(--tu-accent)] font-semibold text-[11px]">
            <Sparkles className="w-3 h-3" />
            <span>{getPortalBadge()}</span>
          </div>

          {title && (
            <span className="font-semibold text-[var(--tu-text-primary)] hidden md:inline truncate max-w-[120px]">
              {title}
            </span>
          )}
        </div>

        {/* Center: URL Pill with Lock HTTPS Indicator */}
        <div
          title="Secure Institutional Connection (HTTPS WebKit Sandbox)"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-[11px] font-mono text-[var(--tu-text-secondary)] max-w-xs sm:max-w-sm truncate shadow-inner cursor-default"
        >
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">{url}</span>
        </div>

        {/* Right: Zoom controls, Pop-Out & External */}
        <div className="flex items-center gap-1.5">
          {/* Zoom Controls */}
          <div className="flex items-center bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-sm)] px-1 py-0.5 text-[11px]">
            <button
              onClick={() => handleSetZoom(zoomLevel - 10)}
              className="p-0.5 text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] transition-colors cursor-pointer disabled:opacity-30"
              disabled={zoomLevel <= 50}
              title="Zoom Out (-10%)"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleSetZoom(100)}
              className="px-1 text-[10px] font-mono text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-accent)] transition-colors cursor-pointer"
              title="Reset Zoom to 100%"
            >
              {zoomLevel}%
            </button>
            <button
              onClick={() => handleSetZoom(zoomLevel + 10)}
              className="p-0.5 text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] transition-colors cursor-pointer disabled:opacity-30"
              disabled={zoomLevel >= 200}
              title="Zoom In (+10%)"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {extraActions}

          <button
            onClick={handleAutofill}
            className="flex items-center gap-1 px-2 py-1 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] transition-colors cursor-pointer text-[11px]"
            title="Autofill Shibboleth SSO & 2FA Code"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span className="hidden sm:inline">Autofill</span>
          </button>

          <button
            onClick={handleDetachWindow}
            className="flex items-center gap-1 px-2 py-1 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] transition-colors cursor-pointer text-[11px]"
            title="Detach Window: Pop out into a secondary desktop monitor"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Detach</span>
          </button>

          <button
            onClick={handleOpenExternal}
            className="flex items-center gap-1 px-2 py-1 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] transition-colors cursor-pointer text-[11px]"
            title="Open in System Browser"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden lg:inline">External</span>
          </button>
        </div>
      </div>

      {/* Child Webview Anchor Area */}
      <div
        ref={containerRef}
        className="flex-1 w-full h-full relative bg-black/10 min-h-[500px] pointer-events-auto select-auto"
      >
        {!isNative && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 pointer-events-auto select-auto">
            <ShieldCheck className="w-10 h-10 text-[var(--tu-accent)] opacity-60" />
            <h4 className="font-bold text-sm text-[var(--tu-text-primary)]">
              Native Child-Webview Viewport Active
            </h4>
            <p className="text-xs text-[var(--tu-text-secondary)] max-w-md">
              In desktop runtime, this container renders directly via an OS WebKit / WebView2
              child-webview. It bypasses iframe headers and maintains persistent university cookies.
            </p>
            <button
              onClick={handleOpenExternal}
              className="px-3.5 py-1.5 bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] text-xs font-semibold rounded-[var(--tu-radius-sm)] flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Browser
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
