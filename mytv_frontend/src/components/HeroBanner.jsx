import React from "react";
import Button from "./Button";

/**
 * PUBLIC_INTERFACE
 * HeroBanner
 * Full-bleed hero with background image, top-to-bottom gradient overlay, title/desc and CTAs.
 */
export default function HeroBanner({ movie }) {
  if (!movie) return null;

  return (
    <section className="relative w-full h-[60vh] min-h-[420px] overflow-hidden">
      <img
        src={movie.backdrop}
        alt={`${movie.title} backdrop`}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-hero-fade" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 pt-28 md:pt-40">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow">{movie.title}</h1>
        <p className="mt-4 max-w-2xl text-base md:text-lg text-gray-200/90">
          Dive into an immersive story set against the vast, mysterious ocean.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="primary" aria-label="Play now" className="px-5 py-2">
            ▶ Play
          </Button>
          <Button variant="ghost" aria-label="More info" className="px-5 py-2">
            ℹ More Info
          </Button>
        </div>
      </div>
    </section>
  );
}
