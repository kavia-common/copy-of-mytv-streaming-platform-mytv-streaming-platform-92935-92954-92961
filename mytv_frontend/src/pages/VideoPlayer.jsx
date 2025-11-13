import React, { useCallback, useState } from 'react';
import PlayerOverlay from '../components/PlayerOverlay';

/**
 * PUBLIC_INTERFACE
 * VideoPlayer
 * Page component that renders the PlayerOverlay with captions disabled/hidden.
 */
export default function VideoPlayer() {
  const [open, setOpen] = useState(true);
  const src = 'https://5bc9cfc0.api.kavia.app/videos/video.mp4';

  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-xl mb-4 font-semibold">MyTV - Video Playback</h1>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Open Player
        </button>
      ) : (
        <PlayerOverlay src={src} onClose={handleClose} title="Sample Video" />
      )}
    </div>
  );
}
