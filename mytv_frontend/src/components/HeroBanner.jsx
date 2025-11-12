import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

/**
 * PUBLIC_INTERFACE
 * HeroBanner
 * Enforces a 16:9 hero area clamped within safe viewport heights; media uses object-fit: cover to prevent stretch.
 */
export default function HeroBanner({ movie }) {
  const DESKTOP_VIDEO = "https://cdn.example.com/trailers/dummy-hero.mp4";
  const MOBILE_VIDEO = "https://cdn.example.com/trailers/dummy-hero-mobile.mp4";

  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const poster = movie?.backdrop || undefined;

  const prefersMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 640;
  }, []);

  const onVideoError = () => setVideoError(true);

  const onCanPlay = () => {
    try {
      const p = videoRef.current?.play?.();
      if (p && typeof p.then === "function") {
        p.catch(() => setVideoError(true));
      }
    } catch {
      setVideoError(true);
    } finally {
      requestAnimationFrame(() => {
        videoRef.current?.classList?.add("hero-video-ready");
      });
    }
  };

  if (!movie) {
    return (
      <section className="relative w-full overflow-hidden" style={{ height: "min(56.25vw, 100svh)" }} aria-hidden="true" />
    );
  }

  const showVideo = !videoError;

  return (
    <section
      className="relative w-full overflow-hidden hero header-hero"
      style={{
        height: "clamp(44svh, 62svh, min(56.25vw, 86svh))",
        maxHeight: "100svh",
      }}
    >
      <div className="aspect-16-9">
        {showVideo ? (
          <video
            ref={videoRef}
            className="media-cover"
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
            <source src={MOBILE_VIDEO} media="(max-width: 640px)" type="video/mp4" />
            <source src={DESKTOP_VIDEO} type="video/mp4" />
          </video>
        ) : (
          <img
            src={movie.backdrop}
            alt={`${movie.title} backdrop`}
            className="media-cover"
            draggable="false"
            loading="eager"
          />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 pt-24 md:pt-28">
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
              onClick={() => (movie?.id != null ? navigate(`/title/${movie.id}`) : window.alert?.("Play"))}
            >
              ▶ Play
            </Button>
            <Button
              variant="ghost"
              aria-label={`More info about ${movie.title}`}
              className="px-5 py-2"
              onClick={() => (movie?.id != null ? navigate(`/title/${movie.id}`) : window.alert?.("More Info"))}
            >
              ℹ More Info
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
