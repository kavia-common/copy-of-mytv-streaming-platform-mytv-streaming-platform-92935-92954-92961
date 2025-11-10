import React from "react";
import Button from "./Button";

/**
 * PUBLIC_INTERFACE
 * HeroBanner
 * Cinematic full-bleed hero with optional video backdrop, gradient overlays, bold title/metadata, and CTAs.
 * Accessible buttons have ARIA labels and keyboard focus-visible styles.
 */
export default function HeroBanner({ movie }) {
  if (!movie) return null;

  const hasVideo = !!movie.trailer; // local data may not have trailer; fallback to image

  return (
    <section className="relative w-full h-[68vh] min-h-[460px] overflow-hidden">
      {/* Backdrop: try video if available, else image */}
      {hasVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={movie.trailer}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
      ) : (
        <img
          src={movie.backdrop}
          alt={`${movie.title} backdrop`}
          className="absolute inset-0 h-full w-full object-cover object-center"
          draggable="false"
        />
      )}

      {/* Cinematic gradient overlays: bottom fade and subtle side vignette */}
      <div className="absolute inset-0 bg-hero-fade pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_10%_50%,rgba(0,0,0,0.65),transparent_60%)] pointer-events-none" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 pt-28 md:pt-40">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow md:leading-[1.05]">
            {movie.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-200/90">
            <span className="text-amber-300 font-semibold">{movie.rating ? `${movie.rating} Match` : "91% Match"}</span>
            <span className="text-gray-300/90">{movie.year || "2024"}</span>
            <span className="rounded border border-white/30 px-1.5 py-0.5 text-[10px] leading-none text-gray-100">HD</span>
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
