import React, { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useThemeStore } from "@/store/useThemeStore";

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

  // Synthesize CSS variables into an auto-injected style tag
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
        sandbox="allow-scripts"
        className="w-full h-full border-none bg-transparent"
        title={`Plugin: ${pluginId}`}
      />
    </div>
  );
};
