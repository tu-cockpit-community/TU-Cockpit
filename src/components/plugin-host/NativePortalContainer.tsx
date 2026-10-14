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
} from "lucide-react";

interface NativePortalContainerProps {
  portalId: string;
  url: string;
  title?: string;
}

export const NativePortalContainer: React.FC<NativePortalContainerProps> = ({
  portalId,
  url,
  title,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNative, setIsNative] = useState<boolean>(true);

  const updateBounds = useCallback(async () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    try {
      await invoke("create_or_show_native_portal", {
        portalId,
        url,
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
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

    const handleResize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      invoke("resize_native_portal", {
        portalId,
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      }).catch(() => {});
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      invoke("hide_native_portal", { portalId }).catch(() => {});
    };
  }, [portalId, updateBounds]);

  const handleDetachWindow = async () => {
    try {
      await invoke("detach_portal_window", { portalId, url });
    } catch (err) {
      console.error("detach_portal_window failed:", err);
      window.open(url, "_blank", "width=1024,height=768");
    }
  };

  const handleReload = async () => {
    try {
      await invoke("navigate_native_portal", { portalId, url });
    } catch {
      // Browser fallback
      updateBounds();
    }
  };

  const handleOpenExternal = async () => {
    try {
      await open(url);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] overflow-hidden shadow-[var(--tu-shadow)]">
      {/* Native Webview Navigation Bar */}
      <div className="h-10 border-b border-[var(--tu-border)] bg-[var(--tu-bg-card)] px-4 flex items-center justify-between shrink-0 select-none text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--tu-accent)]/15 border border-[var(--tu-accent)]/30 text-[var(--tu-accent)] font-semibold text-[11px]">
            <Sparkles className="w-3 h-3" />
            <span>Native Viewport</span>
          </div>

          {title && (
            <span className="font-semibold text-[var(--tu-text-primary)] hidden sm:inline">
              {title}
            </span>
          )}
        </div>

        {/* URL Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] text-[11px] font-mono text-[var(--tu-text-secondary)] max-w-sm truncate">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">{url}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDetachWindow}
            className="flex items-center gap-1 px-2 py-1 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] transition-colors cursor-pointer text-[11px]"
            title="Pop out into a detached floating OS window"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Pop-Out</span>
          </button>

          <button
            onClick={handleReload}
            className="p-1 rounded text-[var(--tu-text-muted)] hover:text-[var(--tu-text-primary)] hover:bg-[var(--tu-bg-hover)] transition-colors cursor-pointer"
            title="Reload Portal Page"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleOpenExternal}
            className="flex items-center gap-1 px-2 py-1 rounded-[var(--tu-radius-sm)] bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-secondary)] hover:text-[var(--tu-text-primary)] transition-colors cursor-pointer text-[11px]"
            title="Open in System Browser"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden md:inline">External</span>
          </button>
        </div>
      </div>

      {/* Child Webview Anchor Area */}
      <div
        ref={containerRef}
        className="flex-1 w-full h-full relative bg-black/10 min-h-[500px]"
      >
        {!isNative && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3">
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
