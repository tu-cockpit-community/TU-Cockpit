/**
 * @deprecated Decoupled from core desktop shell in Phase 6.
 * See community repository: https://github.com/tu-cockpit-community/tu-slide-vault
 * and docs/plugins/tu-slide-vault.md.
 */
import React, { useState } from "react";
import { useVaultStore } from "@/store/useVaultStore";
import {
  FileText,
  X,
  ZoomIn,
  ZoomOut,
  Moon,
  Sun,
  RotateCcw,
  Maximize2,
  Minimize2,
} from "lucide-react";

export const PDFViewerModal: React.FC = () => {
  const { selectedPdf, base64Pdf, isLoadingPdf, closePdf } = useVaultStore();
  const [zoom, setZoom] = useState<number>(100);
  const [isDarkModeFilter, setIsDarkModeFilter] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  if (!selectedPdf) return null;

  const pdfDataUrl = base64Pdf
    ? `data:application/pdf;base64,${base64Pdf}#page=${selectedPdf.page || 1}`
    : null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 ${
        isFullscreen ? "p-0" : ""
      }`}
    >
      <div
        className={`bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] rounded-[var(--tu-radius-lg)] shadow-2xl overflow-hidden flex flex-col w-full ${
          isFullscreen ? "h-screen w-screen rounded-none border-none" : "max-w-5xl h-[90vh]"
        }`}
      >
        {/* PDF Reader Toolbar */}
        <div className="h-11 px-4 border-b border-[var(--tu-border)] bg-[var(--tu-bg-card)] flex items-center justify-between shrink-0 select-none text-xs">
          {/* File Name & Page Indicator */}
          <div className="flex items-center gap-2 truncate">
            <FileText className="w-4 h-4 text-[var(--tu-accent)] shrink-0" />
            <span className="font-bold text-[var(--tu-text-primary)] truncate max-w-sm sm:max-w-md">
              {selectedPdf.fileName}
            </span>
            {selectedPdf.page && (
              <span className="px-1.5 py-0.5 rounded bg-[var(--tu-accent)]/15 border border-[var(--tu-accent)]/30 text-[var(--tu-accent)] font-semibold text-[10px]">
                Page {selectedPdf.page}
              </span>
            )}
          </div>

          {/* Controls: Zoom, Invert Dark Mode, Fullscreen, Close */}
          <div className="flex items-center gap-1.5">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-[var(--tu-bg-surface)] px-1.5 py-0.5 rounded border border-[var(--tu-border)]">
              <button
                onClick={() => setZoom((z) => Math.max(50, z - 15))}
                className="p-1 hover:text-[var(--tu-text-primary)] text-[var(--tu-text-muted)] cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-[var(--tu-text-secondary)] min-w-[36px] text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(200, z + 15))}
                className="p-1 hover:text-[var(--tu-text-primary)] text-[var(--tu-text-muted)] cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(100)}
                className="p-1 hover:text-[var(--tu-text-primary)] text-[var(--tu-text-muted)] cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Dark Mode Inversion Filter Toggle */}
            <button
              onClick={() => setIsDarkModeFilter((f) => !f)}
              className={`flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-medium transition-colors cursor-pointer ${
                isDarkModeFilter
                  ? "bg-[var(--tu-accent)] text-[var(--tu-accent-contrast)] border-[var(--tu-accent)]"
                  : "bg-[var(--tu-bg-surface)] text-[var(--tu-text-secondary)] border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)]"
              }`}
              title="Toggle Slide Dark Mode Inversion"
            >
              {isDarkModeFilter ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
              <span className="hidden sm:inline">OLED Dark</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen((fs) => !fs)}
              className="p-1.5 rounded bg-[var(--tu-bg-surface)] border border-[var(--tu-border)] hover:bg-[var(--tu-bg-hover)] text-[var(--tu-text-secondary)] cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close */}
            <button
              onClick={closePdf}
              className="p-1.5 rounded text-[var(--tu-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Close PDF Reader"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Reader Canvas / Viewport */}
        <div className="flex-1 w-full h-full relative overflow-auto bg-neutral-900 flex items-center justify-center p-2">
          {isLoadingPdf && (
            <div className="text-center space-y-2 text-white/70">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
              <p className="text-xs">Loading cached lecture slides...</p>
            </div>
          )}

          {!isLoadingPdf && pdfDataUrl && (
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
                transition: "transform 0.15s ease",
              }}
              className="w-full h-full flex items-center justify-center"
            >
              <iframe
                src={pdfDataUrl}
                title={selectedPdf.fileName}
                className={`w-full h-full rounded border-0 transition-all ${
                  isDarkModeFilter
                    ? "filter invert-[0.88] hue-rotate-180 brightness-[0.95] contrast-[1.05]"
                    : ""
                }`}
              />
            </div>
          )}

          {!isLoadingPdf && !pdfDataUrl && (
            <div className="text-center p-8 space-y-3 max-w-md">
              <FileText className="w-12 h-12 text-[var(--tu-accent)] mx-auto opacity-70" />
              <h4 className="text-sm font-bold text-white">Offline Slide Preview</h4>
              <p className="text-xs text-neutral-400">
                Viewing local cached copy: <code>{selectedPdf.filePath}</code>.
              </p>
              <div className="p-4 rounded bg-black/40 border border-neutral-700 text-left font-mono text-[11px] text-neutral-300">
                Course: {selectedPdf.fileName}
                <br />
                Target Page: {selectedPdf.page || 1}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
