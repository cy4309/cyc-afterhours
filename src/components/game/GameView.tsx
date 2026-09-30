"use client";

import { useEffect, useRef, useState } from "react";

const BUILD = "/bouldering/BoulderingWeb/Build";
const BASE = "/bouldering/BoulderingWeb";
const LOADER_SRC = `${BUILD}/BoulderingWeb.loader.js`;

type UnityInstance = {
  SetFullscreen: (mode: number) => void;
  Quit: () => Promise<void>;
};

declare global {
  interface Window {
    createUnityInstance?: (
      canvas: HTMLCanvasElement,
      config: Record<string, unknown>,
      onProgress?: (progress: number) => void,
    ) => Promise<UnityInstance>;
  }
}

function loadUnityLoader(): Promise<
  NonNullable<Window["createUnityInstance"]>
> {
  if (window.createUnityInstance) {
    return Promise.resolve(window.createUnityInstance);
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${LOADER_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.createUnityInstance) resolve(window.createUnityInstance);
        else reject(new Error("Unity loader missing createUnityInstance."));
      });
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Unity loader.")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = LOADER_SRC;
    script.async = true;
    script.onload = () => {
      if (window.createUnityInstance) resolve(window.createUnityInstance);
      else reject(new Error("Unity loader missing createUnityInstance."));
    };
    script.onerror = () => reject(new Error("Failed to load Unity loader."));
    document.body.appendChild(script);
  });
}

export function GameView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<UnityInstance | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    loadUnityLoader()
      .then((createUnityInstance) => {
        if (cancelled || !canvas.isConnected) return undefined;
        return createUnityInstance(
          canvas,
          {
            arguments: [],
            dataUrl: `${BUILD}/BoulderingWeb.data.unityweb`,
            frameworkUrl: `${BUILD}/BoulderingWeb.framework.js.unityweb`,
            codeUrl: `${BUILD}/BoulderingWeb.wasm.unityweb`,
            streamingAssetsUrl: `${BASE}/StreamingAssets`,
            fullscreenElementID: "unity-fullscreen-container",
            companyName: "DefaultCompany",
            productName: "BoulderingPrototype",
            productVersion: "0.1.0",
          },
          (next) => {
            if (!cancelled) setProgress(next);
          },
        );
      })
      .then((instance) => {
        if (!instance) return;
        if (cancelled) {
          void instance.Quit().catch(() => undefined);
          return;
        }
        instanceRef.current = instance;
      })
      .catch((reason) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : String(reason));
        }
      });

    return () => {
      cancelled = true;
      const instance = instanceRef.current;
      instanceRef.current = null;
      if (instance) void instance.Quit().catch(() => undefined);
    };
  }, []);

  return (
    <div className="relative min-h-0 w-full flex-1 bg-[#231F20]">
      <div id="unity-fullscreen-container" className="absolute inset-0">
        <canvas
          ref={canvasRef}
          id="unity-canvas"
          tabIndex={-1}
          className="h-full w-full outline-none"
          style={{ background: "#231F20" }}
        />
        {progress < 1 && !error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#231F20]/80">
            <p className="text-kicker uppercase tracking-kicker text-paper">
              Loading {Math.round(progress * 100)}%
            </p>
          </div>
        ) : null}
        {error ? (
          <p className="absolute inset-x-4 top-1/2 -translate-y-1/2 text-center text-kicker uppercase tracking-kicker text-paper">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
