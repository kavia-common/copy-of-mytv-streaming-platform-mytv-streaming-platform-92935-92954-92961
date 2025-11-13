import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * PUBLIC_INTERFACE
 * ShakaPlayer
 * This component wraps Shaka Player to play a given video URL.
 * Enhancements:
 *  - Persistent subtle watermark at bottom-right.
 *  - Controls hidden by default; shown on hover or user activity and auto-hide after inactivity.
 *  - Smooth fade transitions for controls visibility.
 *  - Captions/subtitles are explicitly disabled and hidden at both player and UI levels.
 *
 * Props:
 *  - src: string - the video URL to play
 */
export default function ShakaPlayer({ src }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const uiRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Visibility state for overlay controls (YouTube-like)
  const [controlsVisible, setControlsVisible] = useState(false);
  const hideTimerRef = useRef(null);

  const showControls = useCallback((timeoutMs = 2500) => {
    setControlsVisible(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, timeoutMs);
  }, []);

  const onUserActivity = useCallback(() => {
    showControls();
  }, [showControls]);

  // Attach global shaka error listeners
  useEffect(() => {
    if (!window.shaka) {
      setErrorMsg('Shaka Player script not found. Ensure shaka-player is available.');
      // eslint-disable-next-line no-console
      console.error('Shaka Player is not available on window. Did you include it in package.json?');
      return;
    }

    document.addEventListener('shaka-ui-loaded', () => {
      // eslint-disable-next-line no-console
      console.log('Shaka UI loaded');
    });
    document.addEventListener('shaka-ui-load-failed', () => {
      // eslint-disable-next-line no-console
      console.warn('Shaka UI failed to load, continuing without UI.');
    });

    return () => {
      document.removeEventListener('shaka-ui-loaded', () => {});
      document.removeEventListener('shaka-ui-load-failed', () => {});
    };
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const shaka = window.shaka;
        if (!shaka) return;

        shaka.polyfill.installAll();

        if (!shaka.Player.isBrowserSupported()) {
          setErrorMsg('Browser not supported by Shaka Player.');
          return;
        }

        const video = videoRef.current;
        if (!video) {
          setErrorMsg('Video element not available.');
          return;
        }

        // Initialize player and configure to disable text tracks
        const player = new shaka.Player(video);
        playerRef.current = player;

        player.addEventListener('error', (e) => {
          // eslint-disable-next-line no-console
          console.error('Shaka Player error:', e?.detail || e);
          setErrorMsg(`Player error: ${e?.detail?.code || 'Unknown'}`);
        });

        // Configure to disable/hide text at multiple levels
        player.configure({
          preferredTextLanguage: '',
          textVisibility: false,
          streaming: {
            text: { // for older versions, ignored by newer ones
              enabled: false,
            },
          },
          manifest: {
            dash: { ignoreTextStreamFailures: true },
            hls: { ignoreTextStreamFailures: true },
          },
        });

        // Setup Shaka UI overlay, excluding captions controls if UI is available
        if (shaka.ui && containerRef.current) {
          const ui = new shaka.ui.Overlay(player, containerRef.current, video);
          uiRef.current = ui;
          const controls = ui.getControls();
          if (controls) {
            controls.addEventListener('error', (e) => {
              // eslint-disable-next-line no-console
              console.error('Shaka UI controls error:', e?.detail || e);
              setErrorMsg(`UI error: ${e?.detail?.code || 'Unknown'}`);
            });
            try {
              const existing = controls.getConfig ? controls.getConfig() : {};
              controls.configure({
                controlPanelElements: (existing?.controlPanelElements || []).filter((e) => e !== 'captions'),
                overflowMenuButtons: (existing?.overflowMenuButtons || []).filter((e) => e !== 'captions'),
              });
            } catch (e) {
              // eslint-disable-next-line no-console
              console.warn('Failed to configure Shaka UI controls to hide captions:', e);
            }
          }
        }

        // Load the content
        await player.load(src);

        // Enforce hidden text tracks after load and on track changes
        const enforceHidden = () => {
          try {
            player.setTextTrackVisibility(false);
            // Optionally deselect language
            if (typeof player.setTextLanguage === 'function') {
              player.setTextLanguage('');
            }
            // Attempt to clear any selected text track if API is available
            const getTracks = player.getTextTracks ? player.getTextTracks() : [];
            if (getTracks && getTracks.length && typeof player.selectTextTrack === 'function') {
              // Selecting null is not supported; ensure visibility stays false instead
              player.setTextTrackVisibility(false);
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn('Failed to enforce hidden captions:', err);
          }
        };

        enforceHidden();
        player.addEventListener('trackschanged', enforceHidden);
        player.addEventListener('texttrackvisibility', enforceHidden);
        player.addEventListener('textlanguagechanged', enforceHidden);

        // Start hidden; reveal briefly and then auto-hide
        setControlsVisible(false);
        showControls();

      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Init error:', err);
        setErrorMsg(`Initialization error: ${err?.message || 'Unknown'}`);
      }
    }

    init();

    // Cleanup
    return () => {
      const player = playerRef.current;
      if (player) {
        try {
          player.destroy();
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('Error destroying Shaka player:', e);
        }
      }
      playerRef.current = null;
      uiRef.current = null;
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [src, showControls]);

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <div
        ref={containerRef}
        className="mytv-player relative w-full max-w-5xl bg-black rounded overflow-hidden group"
        style={{ aspectRatio: '16 / 9' }}
        onMouseMove={onUserActivity}
        onMouseEnter={onUserActivity}
        onClick={onUserActivity}
        onKeyDown={onUserActivity}
        onTouchStart={onUserActivity}
        data-controls-visible={controlsVisible ? 'true' : 'false'}
      >
        <video
          ref={videoRef}
          className="w-full h-full"
          autoPlay
          // hide native controls; Shaka UI overlay still available but we fade it by CSS wrapper behavior
          controls={false}
          playsInline
          poster=""
        />
        {/* Watermark - persistent, subtle, pointer-events none */}
        <div
          className="pointer-events-none absolute bottom-2 right-3 text-white/70 text-[11px] md:text-xs font-semibold tracking-wide select-none"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}
          aria-hidden="true"
        >
          MyTV
        </div>

        {/* Fade helper overlay to show/hide controls area like YouTube (affects Shaka UI if present) */}
        <div
          className={`absolute inset-x-0 bottom-0 transition-opacity duration-300 ease-linear ${controlsVisible ? 'opacity-100' : 'opacity-0'} will-change-[opacity]`}
          aria-hidden={!controlsVisible}
        >
          {/* optional gradient to improve contrast over content */}
          <div className="pointer-events-none h-20 w-full bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      </div>
      {errorMsg ? (
        <div className="flex items-center gap-3">
          <span className="text-red-600 text-sm" role="alert">
            {errorMsg}
          </span>
        </div>
      ) : null}
    </div>
  );
}
