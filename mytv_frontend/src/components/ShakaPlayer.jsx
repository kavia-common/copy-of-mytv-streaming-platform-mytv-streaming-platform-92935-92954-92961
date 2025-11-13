import React, { useEffect, useRef, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * ShakaPlayer
 * This component wraps Shaka Player to play a given video URL.
 * Captions/subtitles are explicitly disabled and hidden at both player and UI levels.
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
    };
  }, [src]);

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
