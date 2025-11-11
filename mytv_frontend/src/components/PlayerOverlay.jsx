import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import shaka from "shaka-player";
import { getKeyFromEvent } from "../remote/tizen-keys";

/**
 * PUBLIC_INTERFACE
 * PlayerOverlay
 * Full-screen overlay that hosts a minimal video element and initializes Shaka Player.
 * - Props:
 *   - src: string (manifest or media URL)
 *   - type: 'dash' | 'hls' | undefined (optional hint from API; used to set Shaka config)
 *   - onClose: function to be called when overlay should close (e.g., Back or close button).
 *   - title: optional title to show in the top-left overlay chrome.
 * - Behavior:
 *   - Attaches Shaka to the <video> element before calling player.load(url).
 *   - Sets manifest config based on type (DASH/HLS) when provided; attempts auto-detect otherwise.
 *   - Handles autoplay policy by attempting videoEl.play() after load; if blocked, waits for user Enter.
 *   - On Shaka failure, gracefully falls back to native <video> playback for simple MP4 or HLS.
 *   - Remote keys inside overlay:
 *     - Enter toggles play/pause.
 *     - Back (Escape/Backspace/10009) exits the overlay (calls onClose).
 */
export default function PlayerOverlay({ src, type, onClose, title = "Now Playing" }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [usingNative, setUsingNative] = useState(false);

  // Helper: Decide mime/extension heuristics for native fallback and Shaka hints
  const urlInfo = useMemo(() => {
    const u = typeof src === "string" ? src : "";
    const lower = u.toLowerCase();
    const isDash = type === "dash" || lower.includes(".mpd") || lower.includes("format=dash");
    const isHls = type === "hls" || lower.includes(".m3u8") || lower.includes("format=hls");
    const isMp4 = lower.endsWith(".mp4") || lower.includes("video/mp4");
    return { isDash, isHls, isMp4 };
  }, [src, type]);

  useEffect(() => {
    let mounted = true;

    async function initShaka() {
      const videoEl = videoRef.current;
      if (!videoEl) return;

      // Prepare video element and attributes
      videoEl.controls = false;
      videoEl.autoplay = false; // we'll call play() explicitly after load
      videoEl.playsInline = true;
      // Do not force muted here; let user gesture trigger play if policy blocks autoplay.

      // Always destroy any prior instance before creating a new one
      try {
        await playerRef.current?.destroy?.();
      } catch {}
      playerRef.current = null;

      if (!shaka.Player.isBrowserSupported()) {
        const msg = "Shaka: Browser not supported. Falling back to native playback.";
        console.warn(msg);
        if (mounted) {
          setErrorText("");
          await playNatively(videoEl);
        }
        return;
      }

      // Create and attach player before loading content
      const player = new shaka.Player();
      playerRef.current = player;
      player.addEventListener("error", (evt) => {
        const detail = evt?.detail || evt;
        console.error("Shaka error event", detail);
        setErrorText(detail?.message || "Playback error");
      });

      try {
        // Attach to the video element before load, as recommended
        await player.attach(videoEl);

        // Apply config based on manifest type hints
        const cfg = {
          streaming: {
            bufferingGoal: 10,
          },
        };
        if (urlInfo.isHls) {
          // Enable robust HLS handling config; Shaka uses transmuxing when needed
          cfg.manifest = cfg.manifest || {};
          cfg.manifest.hls = cfg.manifest.hls || {};
          cfg.manifest.hls.ignoreTextStreamFailures = true;
        } else if (urlInfo.isDash) {
          cfg.manifest = cfg.manifest || {};
          cfg.manifest.dash = cfg.manifest.dash || {};
          // Defaults are usually fine; keep minimal config to avoid DRM assumptions
        }
        player.configure(cfg);

        console.info("[PlayerOverlay] Loading with Shaka", {
          src,
          type,
          config: cfg,
        });

        // Load the manifest/media URL
        await player.load(src);

        // Try to start playing explicitly (autoplay policies)
        try {
          await videoEl.play();
        } catch (e) {
          console.warn("Autoplay blocked; awaiting user Enter to start.", e?.message || e);
        }

        if (mounted) {
          setReady(true);
          setErrorText("");
          setUsingNative(false);
        }
      } catch (e) {
        console.error("Shaka initialization/load failed, attempting native fallback…", e);
        if (mounted) {
          await playNatively(videoEl);
        }
      }
    }

    async function playNatively(videoEl) {
      try {
        // Configure native video element for direct playback of MP4 or HLS (where supported)
        setUsingNative(true);
        videoEl.controls = true; // enable controls for native fallback
        videoEl.src = src;
        await videoEl.load?.();
        try {
          await videoEl.play?.();
        } catch (e) {
          console.warn("Native autoplay blocked; waiting for user action.", e?.message || e);
          // No error shown; user can press Enter to trigger play
        }
        setReady(true);
        setErrorText("");
      } catch (e) {
        console.error("Native playback also failed:", e);
        setErrorText("Failed to start playback. Please try again.");
      }
    }

    initShaka();

    return () => {
      mounted = false;
      try {
        playerRef.current?.destroy?.();
      } catch {}
      playerRef.current = null;
      const v = videoRef.current;
      if (v) {
        try {
          v.pause?.();
          v.removeAttribute?.("src");
          v.load?.();
        } catch {}
      }
    };
  }, [src, urlInfo.isDash, urlInfo.isHls, type]);

  // Remote key handling within overlay
  const onKeyDown = useCallback(
    (e) => {
      const logical = getKeyFromEvent(e);
      if (!logical) return;

      // Prevent page scroll while in overlay
      if (["up", "down", "left", "right"].includes(logical)) {
        e.preventDefault?.();
      }

      if (logical === "enter") {
        e.preventDefault?.();
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) {
          v.play?.().catch((err) => {
            console.warn("User-triggered play failed:", err);
            setErrorText("Unable to start playback. Please try again.");
          });
        } else {
          v.pause?.();
        }
      } else if (logical === "back") {
        e.preventDefault?.();
        onClose?.();
      }
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  return (
    <div
      role="dialog"
      aria-label="Video Player"
      aria-modal="true"
      className="fixed inset-0 z-[100] bg-black/95 text-white"
    >
      {/* Top bar: Ocean theme back/close affordance */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 md:px-6 py-3 bg-black/40 backdrop-blur-sm">
        <button
          type="button"
          aria-label="Close player"
          onClick={() => onClose?.()}
          className="inline-flex items-center gap-2 rounded-md bg-white/10 hover:bg-white/20 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <span aria-hidden="true">←</span>
          <span className="hidden sm:inline">Back</span>
        </button>
        <div className="text-sm md:text-base opacity-90">
          {title}
          <span className="ml-2 text-xs text-white/60">
            {usingNative ? "(Native)" : "(Shaka)"}
          </span>
        </div>
        <div className="opacity-0"> {/* spacer to balance layout */} </div>
      </div>

      {/* Video container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          poster=""
          // For better native HLS support in Safari, we can add type hints via <source> if needed.
        />
      </div>

      {/* Error banner */}
      {errorText && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-red-600/90 text-white px-3 py-1.5 text-sm ring-1 ring-white/10">
          {errorText}
        </div>
      )}

      {/* Minimal help hint */}
      {!errorText && (
        <div className="absolute bottom-3 right-4 text-xs text-white/80 bg-white/10 rounded px-2 py-1 ring-1 ring-white/10">
          Enter: Play/Pause • Back: Exit
        </div>
      )}

      {/* Ready indicator subtle fade-in border (just for polish) */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden="true"
      />
    </div>
  );
}
