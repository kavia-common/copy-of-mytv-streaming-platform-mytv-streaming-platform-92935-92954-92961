import React, { useCallback, useEffect, useRef, useState } from "react";
import shaka from "shaka-player";
import { getKeyFromEvent } from "../remote/tizen-keys";

/**
 * PUBLIC_INTERFACE
 * PlayerOverlay
 * Full-screen overlay that hosts a minimal video element and initializes Shaka Player.
 * - Props:
 *   - src: string (DASH or HLS URL) Placeholder is acceptable; user will provide real stream later.
 *   - onClose: function to be called when overlay should close (e.g., Back or close button).
 *   - title: optional title to show in the top-left overlay chrome.
 * - Behavior:
 *   - On mount, creates a Shaka.Player on the <video> element and attempts to load src.
 *   - Logs basic errors to console and displays a lightweight toast banner on failure.
 *   - Remote keys inside overlay:
 *     - Enter toggles play/pause.
 *     - Back (Escape/Backspace/10009) exits the overlay (calls onClose).
 *   - Click on the top-left back button also exits overlay.
 */
export default function PlayerOverlay({ src, onClose, title = "Now Playing" }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [errorText, setErrorText] = useState("");

  // Initialize Shaka on mount
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        if (!shaka.Player.isBrowserSupported()) {
          const msg = "Shaka: Browser not supported.";
          console.error(msg);
          if (mounted) setErrorText(msg);
          return;
        }

        const videoEl = videoRef.current;
        if (!videoEl) return;

        // Minimal UI: hide native controls; allow remote to toggle play/pause
        videoEl.controls = false;
        videoEl.autoplay = true;
        videoEl.playsInline = true;
        videoEl.muted = false;

        const player = new shaka.Player(videoEl);
        playerRef.current = player;

        player.addEventListener("error", (evt) => {
          const detail = evt?.detail || evt;
          console.error("Shaka error", detail);
          setErrorText(detail?.message || "Playback error");
        });

        // Try loading the provided src; handle both DASH and HLS (Shaka supports both with transmuxing where available).
        await player.load(src);
        // Attempt to start playing
        try {
          await videoEl.play();
        } catch (e) {
          // Autoplay may fail if not allowed; we keep overlay open anyway
          console.warn("Autoplay blocked; waiting for user action to play.", e);
        }
        if (mounted) setReady(true);
      } catch (e) {
        console.error("Shaka init/load failed:", e);
        if (mounted) setErrorText(e?.message || "Failed to load stream");
      }
    }

    init();

    return () => {
      mounted = false;
      try {
        playerRef.current?.destroy?.();
      } catch {}
      playerRef.current = null;
    };
  }, [src]);

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
          v.play?.();
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
        <div className="text-sm md:text-base opacity-90">{title}</div>
        <div className="opacity-0"> {/* spacer to balance layout */} </div>
      </div>

      {/* Video container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          poster=""
        />
      </div>

      {/* Error banner */}
      {errorText && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-red-600/90 text-white px-3 py-1.5 text-sm ring-1 ring-white/10">
          {errorText}
        </div>
      )}

      {/* Minimal help hint (optional) */}
      {!errorText && (
        <div className="absolute bottom-3 right-4 text-xs text-white/80 bg-white/10 rounded px-2 py-1 ring-1 ring-white/10">
          Enter: Play/Pause • Back: Exit
        </div>
      )}

      {/* Ready indicator subtle fade-in border (just for polish) */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`}
        aria-hidden="true"
      />
    </div>
  );
}
