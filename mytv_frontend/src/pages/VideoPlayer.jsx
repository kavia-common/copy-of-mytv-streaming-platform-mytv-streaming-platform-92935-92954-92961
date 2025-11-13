import React from 'react';
import ShakaPlayer from '../components/ShakaPlayer';

/**
 * PUBLIC_INTERFACE
 * VideoPlayer
 * Page component that renders the ShakaPlayer with the specified video and captions.
 */
export default function VideoPlayer() {
  const src = 'https://5bc9cfc0.api.kavia.app/videos/video.mp4';
  const vtt = '/subtitles/video-en.vtt';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-xl mb-4 font-semibold">MyTV - Video with Subtitles</h1>
      <ShakaPlayer src={src} vttSrc={vtt} language="en" label="English" />
    </div>
  );
}
