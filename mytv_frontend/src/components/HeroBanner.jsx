import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

/**
 * PUBLIC_INTERFACE
 * HeroBanner
 * Renders a full-width 16:9 image banner with dark overlay, safe viewport clamps,
 * and CTA placeholders. Uses local fallback banner image to avoid external deps.
 */
export default function HeroBanner({ movie, bannerImage }) {
  const navigate = useNavigate();

  const title = movie?.title || "Featured Title";
  const description =
    movie?.description ||
    "Experience an immersive story set against the vast, mysterious ocean. Stream instantly on MyTV.";
  const genre = movie?.genre || "Adventure";
  const year = movie?.year || "2024";
  const rating = movie?.rating ? `${movie.rating} Match` : "91% Match";

  // Prefer explicit prop, then movie backdrop, then local default asset
  const imgSrc = bannerImage || movie?.backdrop || "/assets/banner-default.jpg";

  return (
    <section
      className="relative w-full overflow-hidden hero header-hero"
      style={{
        // Enforce responsive height with safe viewport clamps
        height: "min(56rem, 80svh)",
        maxHeight: "100svh",
      }}
    >
      {/* 16:9 holder ensures the media never distorts */}
      <div className="aspect-16-9">
        <img
          src={imgSrc}
          alt={title ? `${title} banner` : "Hero banner"}
          className="media-cover"
          draggable="false"
          loading="eager"
        />
      </div>

      {/* Dark gradient overlay to ensure text contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.7) 10%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Content stack */}
      <div className="absolute inset-0 z-10">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 pt-24 md:pt-28 flex items-end">
          <div className="max-w-3xl pb-8 md:pb-12 hero-overlay-fade hero-overlay-in">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow md:leading-[1.05]">
              {title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-200/90">
              <span className="text-amber-300 font-semibold">{rating}</span>
              <span className="text-gray-300/90">{year}</span>
              <span className="rounded border border-white/30 px-1.5 py-0.5 text-[10px] leading-none text-gray-100">
                HD
              </span>
              <span className="text-gray-300/90">{genre}</span>
            </div>
            <p className="mt-3 md:mt-4 max-w-2xl text-base md:text-lg text-gray-200/90">
              {description}
            </p>

            <div className="mt-6 flex gap-3">
              <Button
                variant="secondary"
                aria-label={`Play ${title}`}
                className="px-5 py-2"
                onClick={() =>
                  movie?.id != null ? navigate(`/title/${movie.id}`) : window.alert?.("Play")
                }
              >
                ▶ Play
              </Button>
              <Button
                variant="ghost"
                aria-label={`More info about ${title}`}
                className="px-5 py-2"
                onClick={() =>
                  movie?.id != null ? navigate(`/title/${movie.id}`) : window.alert?.("More Info")
                }
              >
                ℹ More Info
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
