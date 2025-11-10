import React from "react";
import Button from "./Button";

/**
 * PUBLIC_INTERFACE
 * HeroBanner
 * Displays a large featured movie with overlay gradient and CTA buttons.
 */
export default function HeroBanner({ movie }) {
  if (!movie) return null;

  return (
    <section className="relative h-[55vh] min-h-[360px] w-full overflow-hidden">
      <img
        src={movie.backdrop}
        alt={`${movie.title} backdrop`}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020] via-black/40 to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 md:pt-36">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow">
          {movie.title}
        </h1>
        <p className="mt-3 max-w-xl text-gray-200/90">
          Dive into an immersive story set against the vast, mysterious ocean.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="primary" aria-label="Play now">Play</Button>
          <Button variant="secondary" aria-label="More info">More Info</Button>
        </div>
      </div>
    </section>
  );
}
