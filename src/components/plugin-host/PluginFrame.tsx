import React, { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useThemeStore } from "@/store/useThemeStore";
import { AutofillDaemon } from "@/services/auth/AutofillDaemon";

export interface PluginFrameProps {
  pluginId: string;
  htmlContent: string;
  allowedGlobs?: string[];
  onReady?: () => void;
}

export const PluginFrame: React.FC<PluginFrameProps> = ({
  pluginId,
  htmlContent,
  allowedGlobs = [],
  onReady,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const portRef = useRef<MessagePort | null>(null);
  const { tokens, fontSans, fontMono, uiScale } = useThemeStore();

  // Synthesize CSS variables into an auto-injected style tag and bridge script
  const generateThemeStyleBlock = () => `
    <style id="tu-cockpit-injected-theme">
      :root {
        ${Object.entries(tokens)
          .map(([k, v]) => `${k}: ${v};`)
          .join("\n        ")}
        --tu-font-sans: ${fontSans};
        --tu-font-mono: ${fontMono};
        --tu-ui-scale: ${uiScale};
      }
    </style>
    <script id="tu-cockpit-injected-bridge">
      try {
        if (window.parent && window.parent.__TAURI_INTERNALS__) {
          window.__TAURI_INTERNALS__ = window.parent.__TAURI_INTERNALS__;
        }
        if (window.parent && window.parent.__TAURI__) {
          window.__TAURI__ = window.parent.__TAURI__;
        } else if (window.__TAURI_INTERNALS__) {
          window.__TAURI__ = {
            core: {
              invoke: window.__TAURI_INTERNALS__.invoke,
              convertFileSrc: window.__TAURI_INTERNALS__.convertFileSrc,
            },
          };
        }
      } catch (e) {
        console.warn("Could not bind parent __TAURI__ into iframe:", e);
      }
    </script>
  `;

  // Prepend or inject into the head of the plugin's HTML
  const themedHtml = htmlContent.includes("<head>")
    ? htmlContent.replace("<head>", `<head>${generateThemeStyleBlock()}`)
    : `${generateThemeStyleBlock()}${htmlContent}`;

  // Broadcast real-time theme updates whenever user customizes tokens, fonts, or scale
  useEffect(() => {
    if (portRef.current) {
      portRef.current.postMessage({
        jsonrpc: "2.0",
        method: "theme:changed",
        params: { tokens, fontSans, fontMono, uiScale },
      });
    }
  }, [tokens, fontSans, fontMono, uiScale]);

  // Forward vault and filesystem events to the plugin iframe
  useEffect(() => {
    let unlistenVault: (() => void) | undefined;
    let unlistenPath: (() => void) | undefined;

    const setupListeners = async () => {
      if ((window as any).__TAURI__?.event?.listen) {
        try {
          unlistenVault = await (window as any).__TAURI__.event.listen(
            "slide-saved-to-vault",
            () => {
              iframeRef.current?.contentWindow?.postMessage({ type: "REFRESH_SLIDES" }, "*");
            }
          );
          unlistenPath = await (window as any).__TAURI__.event.listen(
            "slide-vault-path-changed",
            (event: any) => {
              iframeRef.current?.contentWindow?.postMessage(
                { type: "VAULT_PATH_CHANGED", path: event.payload?.path },
                "*"
              );
              iframeRef.current?.contentWindow?.postMessage({ type: "REFRESH_SLIDES" }, "*");
            }
          );
        } catch (e) {
          console.warn("Could not bind Tauri listeners in PluginFrame:", e);
        }
      }
    };
    setupListeners();

    const handleGlobalMsg = (e: MessageEvent) => {
      if (
        e.data?.type === "SLIDE_SAVED" ||
        e.data?.type === "REFRESH_SLIDES" ||
        e.data?.type === "VAULT_PATH_CHANGED"
      ) {
        iframeRef.current?.contentWindow?.postMessage(e.data, "*");
      }
    };
    window.addEventListener("message", handleGlobalMsg);

    return () => {
      window.removeEventListener("message", handleGlobalMsg);
      if (unlistenVault) unlistenVault();
      if (unlistenPath) unlistenPath();
    };
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const channel = new MessageChannel();
    const { port1, port2 } = channel;
    portRef.current = port1;

    // Handle RPC messages from the sandboxed iframe
    port1.onmessage = async (event: MessageEvent) => {
      const { jsonrpc, id, method, params } = event.data || {};
      if (jsonrpc !== "2.0") return;

      try {
        if (method === "lifecycle:ready") {
          onReady?.();
          port1.postMessage({ jsonrpc: "2.0", id, result: true });
        } else if (method === "theme:get") {
          port1.postMessage({
            jsonrpc: "2.0",
            id,
            result: { tokens, fontSans, fontMono, uiScale },
          });
        } else if (method === "http:request") {
          const { url, method: httpMethod, headers, body } = params || {};
          let result: any;
          try {
            // Attempt native Tauri invocation
            result = await invoke("execute_plugin_network_request", {
              pluginId,
              url,
              method: httpMethod || "GET",
              headers: headers || {},
              body: body || null,
              allowedGlobs,
            });
          } catch (invokeErr: any) {
            // If running in pure web browser preview, provide graceful simulation
            if (typeof (window as any).__TAURI_INTERNALS__ === "undefined") {
              console.warn("Running in browser dev preview: simulating network response for", url);
              result = {
                status: 200,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ simulated: true, url }),
              };
            } else {
              throw invokeErr;
            }
          }
          port1.postMessage({ jsonrpc: "2.0", id, result });
        } else if (method === "storage:get") {
          const { key } = params || {};
          const val = localStorage.getItem(`tu_plugin:${pluginId}:${key}`);
          port1.postMessage({ jsonrpc: "2.0", id, result: val });
        } else if (method === "storage:set") {
          const { key, value } = params || {};
          localStorage.setItem(`tu_plugin:${pluginId}:${key}`, value);
          port1.postMessage({ jsonrpc: "2.0", id, result: true });
        } else if (method === "vault:list_files") {
          const files = await invoke("list_slide_vault_files");
          port1.postMessage({ jsonrpc: "2.0", id, result: files });
        } else if (method === "vault:save_slide") {
          const { courseName, filename, bytes } = params || {};
          const dest = await invoke("save_slide_to_vault", {
            courseName,
            filename,
            bytes,
          });
          port1.postMessage({ jsonrpc: "2.0", id, result: dest });
        } else if (method === "vault:get_path") {
          const path = await invoke("get_slide_vault_path");
          port1.postMessage({ jsonrpc: "2.0", id, result: path });
        } else if (method === "vault:read_pdf") {
          const { filePath, path } = params || {};
          const b64 = await invoke("read_vault_pdf_bytes", {
            filePath: filePath || path,
            path: filePath || path,
          });
          port1.postMessage({ jsonrpc: "2.0", id, result: b64 });
        } else if (method === "vault:open_file") {
          const { path } = params || {};
          await invoke("open_slide_file", { path });
          port1.postMessage({ jsonrpc: "2.0", id, result: true });
        } else if (method === "autofill:getPayload") {
          if (pluginId.startsWith("tuwien.official.")) {
            const payload = await AutofillDaemon.getAutofillPayload();
            port1.postMessage({ jsonrpc: "2.0", id, result: payload });
          } else {
            port1.postMessage({
              jsonrpc: "2.0",
              id,
              error: {
                code: -32603,
                message: "Access Denied: Autofill credentials are restricted to official university plugins.",
              },
            });
          }
        } else {
          port1.postMessage({
            jsonrpc: "2.0",
            id,
            error: { code: -32601, message: `Method '${method}' not found` },
          });
        }
      } catch (err: any) {
        port1.postMessage({
          jsonrpc: "2.0",
          id,
          error: { code: -32000, message: err?.message || err?.toString() || "Unknown error" },
        });
      }
    };

    const handleLoad = () => {
      try {
        if (iframe.contentWindow) {
          if ((window as any).__TAURI_INTERNALS__) {
            (iframe.contentWindow as any).__TAURI_INTERNALS__ = (window as any).__TAURI_INTERNALS__;
          }
          if ((window as any).__TAURI__) {
            (iframe.contentWindow as any).__TAURI__ = (window as any).__TAURI__;
          } else if ((window as any).__TAURI_INTERNALS__) {
            (iframe.contentWindow as any).__TAURI__ = {
              core: {
                invoke: (window as any).__TAURI_INTERNALS__.invoke,
                convertFileSrc: (window as any).__TAURI_INTERNALS__.convertFileSrc,
              },
            };
          }
        }
      } catch (err) {
        console.warn("Could not attach __TAURI__ to iframe window:", err);
      }
      // Transfer port2 securely into the iframe context
      iframe.contentWindow?.postMessage({ type: "INIT_RPC_PORT" }, "*", [port2]);
    };

    iframe.addEventListener("load", handleLoad);
    return () => {
      iframe.removeEventListener("load", handleLoad);
      port1.close();
      portRef.current = null;
    };
  }, [pluginId, allowedGlobs, onReady, tokens, fontSans, fontMono, uiScale]);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-[var(--tu-radius)] border border-[var(--tu-border)] bg-[var(--tu-bg-surface)] shadow-[var(--tu-shadow)]">
      <iframe
        ref={iframeRef}
        srcDoc={themedHtml}
        sandbox="allow-scripts allow-forms allow-same-origin"
        className="w-full h-full border-none bg-transparent"
        title={`Plugin: ${pluginId}`}
      />
    </div>
  );
};
