import React, { useMemo, useRef, useState } from "react";
import Button from "./Button";

/**
 * PUBLIC_INTERFACE
 * HeroBanner
 * Cinematic full-bleed hero with optional video backdrop, gradient overlays, bold title/metadata, and CTAs.
 * Accessible buttons have ARIA labels and keyboard focus-visible styles.
 *
 * This version wires a responsive dummy video (desktop and mobile sources) that autoplays, loops, is muted,
 * and plays inline on mobile. If the video fails to load or cannot play, it gracefully falls back to the
 * existing image backdrop. Overlays and CTAs are preserved. Performance: uses preload="none", disablePictureInPicture,
 * and provides a poster from the movie backdrop when available.
 */
export default function HeroBanner({ movie }) {
  // Dummy video URLs provided in task
  const DESKTOP_VIDEO = "https://cdn.example.com/trailers/dummy-hero.mp4";
  const MOBILE_VIDEO = "https://cdn.example.com/trailers/dummy-hero-mobile.mp4";

  // Hooks must always be called; guard their usage later if movie is null
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  // pick poster from movie backdrop if available (handle undefined movie)
  const poster = movie?.backdrop || undefined;

  // Basic client hint to prefer mobile source
  const prefersMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 640; // sm breakpoint
  }, []);

  const onVideoError = () => {
    setVideoError(true);
  };

  const onCanPlay = () => {
    // Attempt to start playback programmatically if the browser blocks it; muted allows autoplay typically.
    try {
      const p = videoRef.current?.play?.();
      if (p && typeof p.then === "function") {
        p.catch(() => {
          // If play is blocked for some reason, fallback to image
          setVideoError(true);
        });
      }
    } catch {
      setVideoError(true);
    }
  };

  // If no movie, render an empty placeholder section to maintain layout (no hooks after return)
  if (!movie) {
    return <section className="relative w-full h-[40vh] min-h-[320px] overflow-hidden" aria-hidden="true" />;
  }

  // Render video unless we've encountered an error; provide <source> for mobile/desktop.
  const showVideo = !videoError;

  return (
    <section className="relative w-full h-[68vh] min-h-[460px] overflow-hidden">
      {/* Backdrop: prefer responsive video; graceful fallback to image */}
      {showVideo ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          preload="none"
          poster={poster}
          disablePictureInPicture
          onError={onVideoError}
          onCanPlay={onCanPlay}
        >
          {/* Mobile-first source, then desktop as default */}
          <source src={MOBILE_VIDEO} media="(max-width: 640px)" type="video/mp4" />
          <source src={DESKTOP_VIDEO} type="video/mp4" />
          {/* If browser doesn't support provided sources, fallback via onError won't trigger, so provide image below */}
        </video>
      ) : (
        <img
          src={movie.backdrop}
          alt={`${movie.title} backdrop`}
          className="absolute inset-0 h-full w-full object-cover object-center"
          draggable="false"
          loading="eager"
        />
      )}

      {/* Fallback image tag in a <noscript> for no-JS environments */}
      <noscript>
        <img
          src={movie.backdrop}
          alt={`${movie.title} backdrop`}
          className="absolute inset-0 h-full w-full object-cover object-center"
          draggable="false"
        />
      </noscript>

      {/* Cinematic gradient overlays: bottom fade and subtle side vignette */}
      <div className="absolute inset-0 bg-hero-fade pointer-events-none" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[radial-gradient(120%_100%_at_10%_50%,rgba(0,0,0,0.65),transparent_60%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 pt-24 md:pt-36">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow md:leading-[1.05]">
            {movie.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-200/90">
            <span className="text-amber-300 font-semibold">
              {movie.rating ? `${movie.rating} Match` : "91% Match"}
            </span>
            <span className="text-gray-300/90">{movie.year || "2024"}</span>
            <span className="rounded border border-white/30 px-1.5 py-0.5 text-[10px] leading-none text-gray-100">
              HD
            </span>
            <span className="text-gray-300/90">{movie.genre}</span>
          </div>
          <p className="mt-3 md:mt-4 max-w-2xl text-base md:text-lg text-gray-200/90">
            {movie.description || "Dive into an immersive story set against the vast, mysterious ocean."}
          </p>
          <div className="mt-6 flex gap-3">
            <Button
              variant="secondary"
              aria-label={`Play ${movie.title}`}
              className="px-5 py-2"
              onClick={() => window.alert?.("Play")}
            >
              ▶ Play
            </Button>
            <Button
              variant="ghost"
              aria-label={`More info about ${movie.title}`}
              className="px-5 py-2"
              onClick={() => window.alert?.("More Info")}
            >
              ℹ More Info
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
