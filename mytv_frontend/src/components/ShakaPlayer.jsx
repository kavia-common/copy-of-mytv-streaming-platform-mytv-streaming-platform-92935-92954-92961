import React, { useEffect, useRef, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * ShakaPlayer
 * This component wraps Shaka Player to play a given video URL and loads an external WebVTT captions track.
 * - Captions are added via player.addTextTrack and default to OFF.
 * - UI controls include Shaka UI controls (if available in the environment) and a simple toggle button.
 * - Includes robust error handling for player and UI events.
 *
 * Props:
 *  - src: string - the video URL to play
 *  - vttSrc: string - the WebVTT subtitle URL (relative to public), e.g., "/subtitles/video-en.vtt"
 *  - language: string - language code for the track, default "en"
 *  - label: string - label shown to users, default "English"
 */
export default function ShakaPlayer({
  src,
  vttSrc,
  language = 'en',
  label = 'English',
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const uiRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [captionsEnabled, setCaptionsEnabled] = useState(false);

  // Attach global shaka error listeners
  useEffect(() => {
    if (!window.shaka) {
      setErrorMsg('Shaka Player script not found. Ensure shaka-player is available.');
      // eslint-disable-next-line no-console
      console.error('Shaka Player is not available on window. Did you include it in package.json?');
      return;
    }

    const onErrorEvent = (event) => {
      // eslint-disable-next-line no-console
      console.error('Shaka error event:', event);
      const err = event?.detail || event;
      setErrorMsg(`Playback error: ${err?.code || 'Unknown error'}`);
    };

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
      // No global off for shaka errors here because we bind to player/UI directly below
    };
  }, []);

  useEffect(() => {
    let destroyed = false;

    async function init() {
      try {
        const shaka = window.shaka;
        if (!shaka) return;

        // Install polyfills
        shaka.polyfill.installAll();

        // Ensure browser is supported
        if (!shaka.Player.isBrowserSupported()) {
          setErrorMsg('Browser not supported by Shaka Player.');
          return;
        }

        const video = videoRef.current;
        if (!video) {
          setErrorMsg('Video element not available.');
          return;
        }

        // Initialize player
        const player = new shaka.Player(video);
        playerRef.current = player;

        player.addEventListener('error', (e) => {
          // eslint-disable-next-line no-console
          console.error('Shaka Player error:', e?.detail || e);
          setErrorMsg(`Player error: ${e?.detail?.code || 'Unknown'}`);
        });

        // Try enabling Shaka UI if available
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
          }
        }

        // Load the content
        await player.load(src);

        // Add the external WebVTT track; captions default OFF, so do not setTextTrackVisibility(true)
        // Note: Streaming protocols and CORS must allow fetching this vtt from public folder.
        await player.addTextTrack(
          vttSrc,         // uri
          'en',           // language
          'subtitles',    // kind
          'text/vtt',     // mimeType
          '',             // codec (empty for vtt)
          label           // label
        );

        // Ensure text visibility starts OFF (default)
        player.setTextTrackVisibility(false);
        setCaptionsEnabled(false);

        // Confirm text tracks
        const textTracks = player.getTextTracks();
        // eslint-disable-next-line no-console
        console.log('Available text tracks:', textTracks);

      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Init error:', err);
        setErrorMsg(`Initialization error: ${err?.message || 'Unknown'}`);
      }
    }

    init();

    // Cleanup
    return () => {
      destroyed = true;
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
    };
  }, [src, vttSrc, label]);

  const toggleCaptions = () => {
    const player = playerRef.current;
    if (!player) return;
    const next = !captionsEnabled;
    player.setTextTrackVisibility(next);
    setCaptionsEnabled(next);
  };

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl bg-black rounded overflow-hidden"
        style={{ aspectRatio: '16 / 9' }}
      >
        <video
          ref={videoRef}
          className="w-full h-full"
          autoPlay
          controls
          playsInline
          poster=""
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleCaptions}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm"
          aria-pressed={captionsEnabled}
          aria-label="Toggle captions"
        >
          {captionsEnabled ? 'Turn Captions Off' : 'Turn Captions On'}
        </button>
        {errorMsg ? (
          <span className="text-red-600 text-sm" role="alert">
            {errorMsg}
          </span>
        ) : (
          <span className="text-gray-500 text-xs">
            Captions default to off. Use this toggle or the player captions menu.
          </span>
        )}
      </div>
    </div>
  );
}
