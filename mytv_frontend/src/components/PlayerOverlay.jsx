import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import shaka from "shaka-player";
import { getKeyFromEvent } from "../remote/tizen-keys";

// Temporary diagnostics flag parsing (non-intrusive, removable):
// If REACT_APP_FEATURE_FLAGS includes "showStreamUrl", a tiny on-screen badge will be shown.
const FEATURE_FLAGS = (process.env.REACT_APP_FEATURE_FLAGS || "").split(",").map((s) => s.trim().toLowerCase());
const DIAG_SHOW_STREAM_URL = FEATURE_FLAGS.includes("showstreamurl");

/**
 * Subtitle configuration:
 * - External WebVTT support for EN/ES via env vars.
 */
const SUBTITLE_KIND = "subtitle";
const EXT_VTT_EN = process.env.REACT_APP_SUBTITLE_VTT_URL_EN || "";
const EXT_VTT_ES = process.env.REACT_APP_SUBTITLE_VTT_URL_ES || "";
const SUB_LANG_SESSION_KEY = "mytv.player.subtitles.language";

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
 *     - Left/Right seek -10s/+10s.
 *     - Back (Escape/Backspace/10009) exits the overlay (calls onClose).
 * - UI:
 *   - Centered controls group: Rewind 10s, Play/Pause, Forward 10s, shown on hover/move/focus and auto-hidden after inactivity.
 *   - Bottom progress bar showing played vs buffered segments; updates on timeupdate/progress.
 */
export default function PlayerOverlay({ src, type, onClose, title = "Now Playing" }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [usingNative, setUsingNative] = useState(false);

  // Subtitles state: default ON, persist within session
  const SUB_SESSION_KEY = "mytv.player.subtitles.enabled";
  const [subsEnabled, setSubsEnabled] = useState(() => {
    try {
      const raw = sessionStorage.getItem(SUB_SESSION_KEY);
      return raw === null ? true : raw === "true";
    } catch {
      return true;
    }
  });
  const [subtitleError, setSubtitleError] = useState("");
  // Track languages available and the selected language
  const [availableTextLangs, setAvailableTextLangs] = useState([]); // e.g., ["en","es"]
  const [selectedLang, setSelectedLang] = useState(() => {
    try {
      return sessionStorage.getItem(SUB_LANG_SESSION_KEY) || "";
    } catch {
      return "";
    }
  });

  const persistSelectedLang = useCallback((lang) => {
    try {
      sessionStorage.setItem(SUB_LANG_SESSION_KEY, lang || "");
    } catch {
      // ignore
    }
  }, []);

  const persistSubsEnabled = useCallback((val) => {
    try {
      sessionStorage.setItem(SUB_SESSION_KEY, String(val));
    } catch {
      // ignore
    }
  }, []);

  // Diagnostics: capture the exact URL we attempt to play.
  const [diagUrl, setDiagUrl] = useState("");

  // Copy helper for diagnostics badge
  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log("[Diag] Copied stream URL to clipboard.");
    } catch (e) {
      console.warn("[Diag] Clipboard copy failed:", e);
    }
  }, []);

  // Truncated label for on-screen badge
  const diagLabel = useMemo(() => {
    if (!diagUrl) return "";
    try {
      // Keep original form for exactness; just truncate visually
      const max = 56;
      if (diagUrl.length <= max) return diagUrl;
      const head = diagUrl.slice(0, 28);
      const tail = diagUrl.slice(-20);
      return `${head}…${tail}`;
    } catch {
      return diagUrl;
    }
  }, [diagUrl]);

  // Controls visibility state
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef(null);

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

  // Show controls and set auto-hide timer
  const showControls = useCallback((delayMs = 2500) => {
    setControlsVisible(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, delayMs);
  }, []);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // Select text language according to preferred order and enabled state
  const applyTextLanguage = useCallback((player, langPref, enabled) => {
    if (!player) return;
    try {
      // Visibility first
      if (typeof player.setTextTrackVisibility === "function") {
        player.setTextTrackVisibility(!!enabled);
      }
      if (!enabled) return;

      // Prefer explicit track selection when available
      const tracks = player.getTextTracks ? player.getTextTracks() : [];
      let target = null;
      if (langPref) {
        target = tracks.find((t) => (t.language || "").toLowerCase().startsWith(langPref.toLowerCase()));
      }
      // If no exact match, try English, then Spanish, then first
      if (!target) target = tracks.find((t) => (t.language || "").toLowerCase().startsWith("en"));
      if (!target) target = tracks.find((t) => (t.language || "").toLowerCase().startsWith("es"));
      if (!target && tracks.length > 0) target = tracks[0];

      if (target && typeof player.selectTextTrack === "function") {
        player.selectTextTrack(target);
      } else if (langPref && typeof player.setTextLanguage === "function") {
        player.setTextLanguage(langPref);
      }
    } catch (e) {
      console.warn("[Shaka] applyTextLanguage failed:", e);
    }
  }, []);

  // Refresh available languages from player
  const refreshAvailableLanguages = useCallback((player) => {
    try {
      const langs = [];
      const tracks = player?.getTextTracks ? player.getTextTracks() : [];
      tracks.forEach((t) => {
        const code = (t.language || "").toLowerCase();
        if (code && !langs.includes(code)) langs.push(code);
      });
      // Normalize common variants
      const normalized = langs.map((l) => (l.startsWith("en") ? "en" : l.startsWith("es") ? "es" : l));
      const unique = Array.from(new Set(normalized));
      setAvailableTextLangs(unique);
      return unique;
    } catch {
      setAvailableTextLangs([]);
      return [];
    }
  }, []);

  // Initialize Shaka or native playback
  useEffect(() => {
    let mounted = true;

    async function initShaka() {
      const videoEl = videoRef.current;
      if (!videoEl) return;

      // Prepare video element and attributes
      videoEl.controls = false;
      videoEl.autoplay = false; // we'll call play() explicitly after load
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
          },
        };
        if (urlInfo.isHls) {
          cfg.manifest = cfg.manifest || {};
          cfg.manifest.hls = cfg.manifest.hls || {};
          cfg.manifest.hls.ignoreTextStreamFailures = true;
        } else if (urlInfo.isDash) {
          cfg.manifest = cfg.manifest || {};
          cfg.manifest.dash = cfg.manifest.dash || {};
        }
        player.configure(cfg);

        // TEMP DIAGNOSTICS: Log and expose the exact URL being loaded by Shaka.
        // This is intentionally verbose and easy to remove.
        console.log("[Shaka] Loading manifest URL:", src);
        try {
          // Expose for quick inspection
          window.__CURRENT_STREAM_URL = src; // eslint-disable-line no-underscore-dangle
        } catch {
          /* noop */}
        setDiagUrl(String(src || ""));

        await player.load(src);

        // After load: set up subtitles EN/ES and selector
        try {
          // Register optional external tracks first so they appear in the list
          if (EXT_VTT_EN) {
            try {
              await player.addTextTrack(EXT_VTT_EN, "en", "text/vtt", SUBTITLE_KIND, "EN");
              console.log("[Shaka] External EN subtitle added:", EXT_VTT_EN);
            } catch (e) {
              console.warn("[Shaka] Failed to add EN VTT:", e);
              setSubtitleError("Failed to load EN subtitles.");
            }
          }
          if (EXT_VTT_ES) {
            try {
              await player.addTextTrack(EXT_VTT_ES, "es", "text/vtt", SUBTITLE_KIND, "ES");
              console.log("[Shaka] External ES subtitle added:", EXT_VTT_ES);
            } catch (e) {
              console.warn("[Shaka] Failed to add ES VTT:", e);
              setSubtitleError((prev) => prev || "Failed to load ES subtitles.");
            }
          }

          // Pick default language: last selected, else EN, else first available
          const langs = refreshAvailableLanguages(player);
          let desired = selectedLang;
          if (!desired || !langs.includes(desired)) {
            if (langs.includes("en")) desired = "en";
            else if (langs.includes("es")) desired = "es";
            else desired = langs[0] || "";
          }
          setSelectedLang(desired);
          if (desired) persistSelectedLang(desired);

          // Apply visibility and selection
          applyTextLanguage(player, desired, subsEnabled);

          // Listen for track changes to refresh availability dynamically
          const onTracksChanged = () => {
            const newLangs = refreshAvailableLanguages(player);
            if (newLangs.length && !newLangs.includes(selectedLang)) {
              // current selected language disappeared, fallback
              const fallback = newLangs.includes("en") ? "en" : newLangs[0];
              setSelectedLang(fallback);
              persistSelectedLang(fallback);
              applyTextLanguage(player, fallback, subsEnabled);
            }
          };
          player.addEventListener("texttrackchanged", onTracksChanged);
          player.addEventListener("trackschanged", onTracksChanged);

          // Cleanup listeners when effect re-runs/unmounts via return in outer effect
        } catch (subtitleSetupErr) {
          console.warn("[Shaka] Subtitle setup encountered an error:", subtitleSetupErr);
          setSubtitleError("Subtitle setup error.");
        }

        // Confirm current manifest after load (Shaka may resolve redirects)
        try {
          const manifestUri = player.getManifestUri?.();
          if (manifestUri) {
            console.log("[Shaka] Manifest resolved to:", manifestUri);
            window.__CURRENT_STREAM_URL = manifestUri; // eslint-disable-line no-underscore-dangle
            setDiagUrl(String(manifestUri));
          }
        } catch {
          /* noop */}

        try {
          await videoEl.play();
        } catch (e) {
          console.warn("Autoplay blocked; awaiting user Enter to start.", e?.message || e);
        }

        if (mounted) {
          setReady(true);
          setErrorText("");
          setUsingNative(false);
          showControls(); // show initially, then auto-hide
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
        videoEl.controls = false; // still use custom controls
        videoEl.src = src;

        // TEMP DIAGNOSTICS for native path
        console.log("[Native] Loading media URL:", src);
        try {
          window.__CURRENT_STREAM_URL = src; // eslint-disable-line no-underscore-dangle
        } catch {
          /* noop */}
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
    };
  }, [src, urlInfo.isDash, urlInfo.isHls, type, showControls, subsEnabled]);

  // Listen to timeupdate, durationchange, progress for progress bar
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTime = () => {
      setCurrentTime(v.currentTime || 0);
    };
    const onDuration = () => {
      setDuration(Number.isFinite(v.duration) ? v.duration : 0);
    };
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
    // Initialize once
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

  // PUBLIC_INTERFACE
  function toggleSubtitles() {
    /** Toggle subtitle visibility on/off and persist during session. */
    const next = !subsEnabled;
    setSubsEnabled(next);
    persistSubsEnabled(next);

    const player = playerRef.current;
    if (player && typeof player.setTextTrackVisibility === "function") {
      try {
        applyTextLanguage(player, selectedLang, next);
      } catch (e) {
        console.warn("[Shaka] Failed to update subtitle visibility:", e);
        setSubtitleError("Unable to toggle subtitles.");
      }
    } else {
      // Native fallback path: expose tracks on HTML5 video if any exist
      const v = videoRef.current;
      try {
        if (v && v.textTracks && v.textTracks.length > 0) {
          for (let i = 0; i < v.textTracks.length; i++) {
            const track = v.textTracks[i];
            track.mode = next ? "showing" : "disabled";
          }
        }
      } catch (err) {
        console.warn("[Native] Subtitle toggle failed:", err);
        setSubtitleError("Unable to toggle subtitles.");
      }
    }
  }

  // Remote key handling within overlay: scoped and resilient even when <video> has focus.
  const overlayKeyHandler = useCallback(
    (e) => {
      const logical = getKeyFromEvent(e);
      if (!logical) return;

      // Do not hijack typing fields
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
      const isTypingField = tag === "input" || tag === "textarea";
      if (!isTypingField && ["up", "down", "left", "right"].includes(logical)) {
        e.preventDefault?.(); // prevent page scroll or default arrow handling
      }

      // Always reveal controls on interaction
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
          // Samsung Back key (10009), Escape, Backspace should close overlay
          // Prevent default to avoid browser navigation or Tizen system back bubbling
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

  // Mouse movement/hover shows controls
  const onMouseActivity = useCallback(() => {
    showControls();
  }, [showControls]);

  // Focus the overlay root on mount so it can capture Back/Escape, without disturbing input fields (none here)
  useEffect(() => {
    const t = setTimeout(() => overlayRef.current?.focus?.(), 0);
    return () => clearTimeout(t);
  }, []);

  // Compute played percentage
  const playedPct = useMemo(() => {
    if (!duration || !Number.isFinite(duration)) return 0;
    return Math.max(0, Math.min(100, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  // Render buffered segments as absolute positioned bars
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

  // Attach an overlay-scoped keydown listener
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    el.addEventListener("keydown", overlayKeyHandler);
    return () => {
      el.removeEventListener("keydown", overlayKeyHandler);
    };
  }, [overlayKeyHandler]);

  // Keep available language list in sync when enabled toggles or player becomes ready
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const langs = refreshAvailableLanguages(player);
    // If selected disappears, fallback
    if (langs.length && selectedLang && !langs.includes(selectedLang)) {
      const fallback = langs.includes("en") ? "en" : langs[0];
      setSelectedLang(fallback);
      persistSelectedLang(fallback);
      applyTextLanguage(player, fallback, subsEnabled);
    } else if (langs.length && subsEnabled) {
      applyTextLanguage(player, selectedLang, true);
    }
  }, [ready, subsEnabled, refreshAvailableLanguages, applyTextLanguage, selectedLang, persistSelectedLang]);

  // Also capture Back/Escape when video has focus by listening at window in capture phase,
  // but only act if the event target is inside the overlay.
  useEffect(() => {
    const onWindowKeyDownCapture = (e) => {
      const overlayEl = overlayRef.current;
      if (!overlayEl) return;
      if (!overlayEl.contains(e.target)) return; // ignore outside overlay
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
      {/* Top bar: Ocean theme back/close affordance */}
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

      {/* Center controls group: rewind 10s, play/pause, forward 10s */}
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
            aria-label="Play or pause"
            className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-ocean-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white text-xl md:text-2xl"
            onClick={() => { togglePlay(); showControls(); }}
          >
            ⏯
          </button>
          <button
            type="button"
            aria-label="Forward 10 seconds"
            className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 text-white text-xl md:text-2xl"
            onClick={() => { seekBy(10); showControls(); }}
          >
            ⏩
          </button>
          <button
            type="button"
            aria-label={subsEnabled ? "Turn subtitles off" : "Turn subtitles on"}
            title={subsEnabled ? "Subtitles: On" : "Subtitles: Off"}
            className={`h-12 w-12 md:h-14 md:w-14 rounded-full focus:outline-none focus:ring-2 text-white text-base md:text-lg ${
              subsEnabled
                ? "bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-300"
                : "bg-white/10 hover:bg-white/20 focus:ring-white/30"
            }`}
            onClick={() => { toggleSubtitles(); showControls(); }}
          >
            CC
          </button>
        </div>
      </div>

      {/* Error banner */}
      {errorText && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-md bg-red-600/90 text-white px-3 py-1.5 text-sm ring-1 ring-white/10">
          {errorText}
        </div>
      )}
      {subtitleError && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 rounded-md bg-red-600/80 text-white px-3 py-1.5 text-sm ring-1 ring-white/10">
          {subtitleError}
        </div>
      )}

      {/* Bottom progress bar with buffered segments and played progress */}
      <div
        className={`absolute left-0 right-0 bottom-0 px-6 py-4 transition-opacity ${controlsVisible ? "opacity-100" : "opacity-0"}`}
        aria-hidden={!controlsVisible}
      >
        <div className="relative h-2 rounded bg-white/10 overflow-hidden">
          {/* Buffered segments */}
          {bufferBars}
          {/* Played progress */}
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
          Enter: Play/Pause • Left/Right: -10s/+10s • Back: Exit • CC: Subtitles • Lang: EN/ES
        </div>
      )}

      {/* TEMP DIAGNOSTICS BADGE (hidden unless feature flag is set) */}
      {DIAG_SHOW_STREAM_URL && diagUrl && (
        <button
          type="button"
          aria-hidden="true"
          title={diagUrl}
          onClick={() => copyToClipboard(diagUrl)}
          className="absolute top-2 right-2 max-w-[60vw] truncate text-[10px] sm:text-xs text-white/90 bg-amber-600/80 hover:bg-amber-600 rounded px-2 py-1 ring-1 ring-white/20 shadow"
          style={{ zIndex: 101 }}
        >
          URL: {diagLabel}
        </button>
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
