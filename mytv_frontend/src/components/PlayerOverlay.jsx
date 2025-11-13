import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import shaka from "shaka-player";
import { getKeyFromEvent } from "../remote/tizen-keys";

// Temporary diagnostics flag parsing (non-intrusive, removable):
// If REACT_APP_FEATURE_FLAGS includes "showStreamUrl", a tiny on-screen badge will be shown.
const FEATURE_FLAGS = (process.env.REACT_APP_FEATURE_FLAGS || "").split(",").map((s) => s.trim().toLowerCase());
const DIAG_SHOW_STREAM_URL = FEATURE_FLAGS.includes("showstreamurl");

// PUBLIC_INTERFACE
export default function PlayerOverlay({ src, type, onClose, title = "Now Playing" }) {
  /** Full-screen overlay that hosts a video element and Shaka Player with custom controls.
   * Ensures the center play/pause icon reflects actual playback state by syncing to media events.
   */
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [usingNative, setUsingNative] = useState(false);

  // Play state bound to the central control icon
  const [isPlaying, setIsPlaying] = useState(false);

  // Diagnostics: capture the exact URL we attempt to play.
  const [diagUrl, setDiagUrl] = useState("");

  // Controls visibility state and debounce for race conditions (ads/initial buffering)
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef(null);
  const rafRef = useRef(0);
  const playSyncTimerRef = useRef(0);

  // Progress state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedRanges, setBufferedRanges] = useState([]);

  // Helper: Decide mime/extension heuristics for native fallback and Shaka hints
  const urlInfo = useMemo(() => {
    const u = typeof src === "string" ? src : "";
    const lower = u.toLowerCase();
    const isDash = type === "dash" || lower.includes(".mpd") || lower.includes("format=dash");
    const isHls = type === "hls" || lower.includes(".m3u8") || lower.includes("format=hls");
    const isMp4 = lower.endsWith(".mp4") || lower.includes("video/mp4");
    return { isDash, isHls, isMp4 };
  }, [src, type]);

  const showControls = useCallback((delayMs = 2500) => {
    setControlsVisible(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, delayMs);
  }, []);

  // Debounced state sync after events (to avoid timing issues with Shaka internal state flips)
  const syncPlayState = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const v = videoRef.current;
      if (!v) return;
      setIsPlaying(!v.paused && !v.ended && v.readyState >= 2);
    });
  }, []);

  // Initialize Shaka or native playback
  useEffect(() => {
    let mounted = true;

    async function initShaka() {
      const videoEl = videoRef.current;
      if (!videoEl) return;

      videoEl.controls = false;
      videoEl.autoplay = false;
      videoEl.playsInline = true;

      // Destroy prior instance
      try {
        await playerRef.current?.destroy?.();
      } catch {}
      playerRef.current = null;

      if (!shaka.Player.isBrowserSupported()) {
        console.warn("Shaka not supported. Falling back to native playback.");
        if (mounted) {
          setErrorText("");
          await playNatively(videoEl);
        }
        return;
      }

      const player = new shaka.Player();
      playerRef.current = player;
      player.addEventListener("error", (evt) => {
        const detail = evt?.detail || evt;
        console.error("Shaka error event", detail);
        setErrorText(detail?.message || "Playback error");
      });

      try {
        await player.attach(videoEl);

        const cfg = {
          streaming: {
            bufferingGoal: 10,
            text: { enabled: false },
          },
          preferredTextLanguage: "",
          textVisibility: false,
          manifest: {
            hls: { ignoreTextStreamFailures: true },
            dash: { ignoreTextStreamFailures: true },
          },
        };
        if (urlInfo.isHls) {
          cfg.manifest = cfg.manifest || {};
          cfg.manifest.hls = { ...(cfg.manifest.hls || {}), ignoreTextStreamFailures: true };
        } else if (urlInfo.isDash) {
          cfg.manifest = cfg.manifest || {};
          cfg.manifest.dash = { ...(cfg.manifest.dash || {}), ignoreTextStreamFailures: true };
        }
        player.configure(cfg);

        // Attempt to hide captions in any Shaka UI overlay (if present)
        try {
          const controls = player.getControls?.();
          if (controls && controls.getConfig && controls.configure) {
            const existing = controls.getConfig();
            controls.configure({
              controlPanelElements: (existing?.controlPanelElements || []).filter((e) => e !== "captions"),
              overflowMenuButtons: (existing?.overflowMenuButtons || []).filter((e) => e !== "captions"),
            });
          }
        } catch (e) {
          console.warn("[Shaka] Failed to strip captions from UI controls:", e);
        }

        console.log("[Shaka] Loading manifest URL:", src);
        try {
          window.__CURRENT_STREAM_URL = src; // eslint-disable-line no-underscore-dangle
        } catch { /* noop */ }
        setDiagUrl(String(src || ""));

        await player.load(src);

        // Enforce hidden captions after load and on related events
        const enforceHidden = () => {
          try {
            player.setTextTrackVisibility(false);
            player.setTextLanguage?.("");
            const tracks = player.getTextTracks ? player.getTextTracks() : [];
            if (tracks && tracks.length && typeof player.selectTextTrack === "function") {
              player.setTextTrackVisibility(false);
            }
          } catch (e) {
            console.warn("[Shaka] Enforce hidden captions failed:", e);
          }
        };
        enforceHidden();
        player.addEventListener("trackschanged", enforceHidden);
        player.addEventListener("texttrackvisibility", enforceHidden);
        player.addEventListener("textlanguagechanged", enforceHidden);

        try {
          const manifestUri = player.getManifestUri?.();
        } catch { /* noop */ }

        try {
          await videoEl.play();
        } catch (e) {
          console.warn("Autoplay blocked; awaiting user Enter to start.", e?.message || e);
        }

        if (mounted) {
          setReady(true);
          setErrorText("");
          setUsingNative(false);
          showControls();
          // Sync play state once after ready
          syncPlayState();
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
        setUsingNative(true);
        videoEl.controls = false;
        videoEl.src = src;

        console.log("[Native] Loading media URL:", src);
        try {
          window.__CURRENT_STREAM_URL = src; // eslint-disable-line no-underscore-dangle
        } catch { /* noop */ }
        setDiagUrl(String(src || ""));

        await videoEl.load?.();
        try {
          await videoEl.play?.();
        } catch (e) {
          console.warn("Native autoplay blocked; waiting for user action.", e?.message || e);
        }
        setReady(true);
        setErrorText("");
        showControls();
        syncPlayState();
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
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (playSyncTimerRef.current) clearTimeout(playSyncTimerRef.current);
    };
  }, [src, urlInfo.isDash, urlInfo.isHls, type, showControls, syncPlayState]);

  // Attach media state listeners to keep isPlaying synced; include debounced updates
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return undefined;

    const update = () => {
      // debounce via RAF to avoid state thrash during quick transitions (e.g., ads/waiting/initial)
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setIsPlaying(!v.paused && !v.ended && v.readyState >= 2);
      });
    };

    const onPlay = () => { update(); showControls(); };
    const onPlaying = () => { update(); };
    const onPause = () => { update(); showControls(); };
    const onEnded = () => { update(); showControls(); };
    const onWaiting = () => {
      // Briefly mark as not playing to show play icon if buffering causes auto-pause visuals
      if (playSyncTimerRef.current) clearTimeout(playSyncTimerRef.current);
      setIsPlaying(false);
      // After a short delay, resync to current paused flag (handles quick rebuffer)
      playSyncTimerRef.current = setTimeout(update, 150);
    };

    v.addEventListener("play", onPlay);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);
    v.addEventListener("waiting", onWaiting);

    // Initial sync
    update();

    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("waiting", onWaiting);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (playSyncTimerRef.current) clearTimeout(playSyncTimerRef.current);
    };
  }, [ready]);

  // Listen to timeupdate, durationchange, progress for progress bar
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTime = () => setCurrentTime(v.currentTime || 0);
    const onDuration = () => setDuration(Number.isFinite(v.duration) ? v.duration : 0);
    const onProgress = () => {
      const ranges = [];
      try {
        const br = v.buffered;
        for (let i = 0; i < br.length; i++) {
          const start = br.start(i);
          const end = br.end(i);
          if (Number.isFinite(start) && Number.isFinite(end)) {
            ranges.push([start, end]);
          }
        }
      } catch {}
      setBufferedRanges(ranges);
    };

    v.addEventListener("timeupdate", onTime);
    v.addEventListener("durationchange", onDuration);
    v.addEventListener("progress", onProgress);
    v.addEventListener("seeking", onTime);
    v.addEventListener("seeked", onTime);

    onDuration();
    onTime();
    onProgress();

    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("durationchange", onDuration);
      v.removeEventListener("progress", onProgress);
      v.removeEventListener("seeking", onTime);
      v.removeEventListener("seeked", onTime);
    };
  }, [ready]);

  // Seek helpers with bounds checks
  const seekBy = useCallback((delta) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    const target = Math.max(0, Math.min((v.currentTime || 0) + delta, v.duration));
    try {
      v.currentTime = target;
    } catch {}
  }, []);

  // PUBLIC_INTERFACE
  function togglePlay() {
    /** Toggle play/pause on the video element. */
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
  }

  // Remote key handling within overlay
  const overlayKeyHandler = useCallback(
    (e) => {
      const logical = getKeyFromEvent(e);
      if (!logical) return;

      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
      const isTypingField = tag === "input" || tag === "textarea";
      if (!isTypingField && ["up", "down", "left", "right"].includes(logical)) {
        e.preventDefault?.();
      }

      showControls();

      switch (logical) {
        case "enter":
          e.preventDefault?.();
          togglePlay();
          break;
        case "left":
          seekBy(-10);
          break;
        case "right":
          seekBy(10);
          break;
        case "back":
          e.preventDefault?.();
          e.stopPropagation?.();
          onClose?.();
          break;
        default:
          break;
      }
    },
    [onClose, seekBy, showControls]
  );

  const onMouseActivity = useCallback(() => {
    showControls();
  }, [showControls]);

  const playedPct = useMemo(() => {
    if (!duration || !Number.isFinite(duration)) return 0;
    return Math.max(0, Math.min(100, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  const bufferBars = useMemo(() => {
    if (!duration || !Number.isFinite(duration)) return null;
    return bufferedRanges.map((r, idx) => {
      const [start, end] = r;
      const left = (Math.max(0, start) / duration) * 100;
      const width = (Math.max(0, end - Math.max(0, start)) / duration) * 100;
      if (!Number.isFinite(left) || !Number.isFinite(width)) return null;
      return (
        <div
          key={`buf-${idx}`}
          className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-white/30 rounded"
          style={{ left: `${left}%`, width: `${width}%` }}
          aria-hidden="true"
        />
      );
    });
  }, [bufferedRanges, duration]);

  const overlayRef = useRef(null);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    el.addEventListener("keydown", overlayKeyHandler);
    return () => {
      el.removeEventListener("keydown", overlayKeyHandler);
    };
  }, [overlayKeyHandler]);

  useEffect(() => {
    const onWindowKeyDownCapture = (e) => {
      const overlayEl = overlayRef.current;
      if (!overlayEl) return;
      if (!overlayEl.contains(e.target)) return;
      overlayKeyHandler(e);
    };
    window.addEventListener("keydown", onWindowKeyDownCapture, true);
    return () => window.removeEventListener("keydown", onWindowKeyDownCapture, true);
  }, [overlayKeyHandler]);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-label="Video Player"
      aria-modal="true"
      className="fixed inset-0 z-[100] bg-black/95 text-white"
      onMouseMove={onMouseActivity}
      onMouseEnter={onMouseActivity}
      onClick={onMouseActivity}
      tabIndex={-1}
    >
      {/* Top bar with back control */}
      <div className={`absolute top-0 left-0 right-0 flex items-center justify-between px-4 md:px-6 py-3 bg-black/40 backdrop-blur-sm transition-opacity ${controlsVisible ? "opacity-100" : "opacity-0"}`}>
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
        <div className="opacity-0" />
      </div>

      {/* Video container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          poster=""
        />
      </div>

      {/* Center controls group */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity ${controlsVisible ? "opacity-100" : "opacity-0"} pointer-events-none`}
        aria-hidden={!controlsVisible}
      >
        <div className="pointer-events-auto flex items-center gap-4 md:gap-6 bg-black/30 ring-1 ring-white/10 rounded-full px-3 py-2 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Rewind 10 seconds"
            className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white text-xl md:text-2xl"
            onClick={() => { seekBy(-10); showControls(); }}
          >
            ⏪
          </button>
          <button
            type="button"
            aria-label={isPlaying ? "Pause" : "Play"}
            className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-ocean-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white text-xl md:text-2xl"
            onClick={() => { togglePlay(); showControls(); }}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button
            type="button"
            aria-label="Forward 10 seconds"
            className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white text-xl md:text-2xl"
            onClick={() => { seekBy(10); showControls(); }}
          >
            ⏩
          </button>
        </div>
      </div>

      {/* Error banner */}
      {errorText && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-md bg-red-600/90 text-white px-3 py-1.5 text-sm ring-1 ring-white/10">
          {errorText}
        </div>
      )}

      {/* Bottom progress bar */}
      <div
        className={`absolute left-0 right-0 bottom-0 px-6 py-4 transition-opacity ${controlsVisible ? "opacity-100" : "opacity-0"}`}
        aria-hidden={!controlsVisible}
      >
        <div className="relative h-2 rounded bg-white/10 overflow-hidden">
          {bufferBars}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-ocean-secondary rounded"
            style={{ width: `${playedPct}%` }}
            aria-label="Played progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Number.isFinite(playedPct) ? Math.round(playedPct) : 0}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-white/80">
          <span aria-label="Current time">{formatTime(currentTime)}</span>
          <span aria-label="Duration">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Minimal help hint */}
      {!errorText && (
        <div className={`absolute bottom-3 right-4 text-xs text-white/80 bg-white/10 rounded px-2 py-1 ring-1 ring-white/10 transition-opacity ${controlsVisible ? "opacity-100" : "opacity-0"}`}>
          Enter: Play/Pause • Left/Right: -10s/+10s • Back: Exit
        </div>
      )}

      {/* Watermark - persistent, subtle, pointer-events none */}
      <div
        className="pointer-events-none absolute bottom-2 right-3 text-white/70 text-[11px] md:text-xs font-semibold tracking-wide select-none"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.7)" }}
        aria-hidden="true"
      >
        MyTV
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function formatTime(seconds) {
  /** Format seconds into M:SS or H:MM:SS if >= 1 hour. */
  const s = Math.max(0, Math.floor(seconds || 0));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  if (hrs > 0) return `${hrs}:${pad(mins)}:${pad(secs)}`;
  return `${mins}:${pad(secs)}`;
}
