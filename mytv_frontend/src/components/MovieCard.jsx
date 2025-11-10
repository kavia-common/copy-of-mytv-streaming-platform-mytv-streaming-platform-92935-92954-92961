import React from "react";

/**
 * PUBLIC_INTERFACE
 * MovieCard
 * Poster-style card for horizontal rails.
 */
export default function MovieCard({ movie }) {
  return (
    <div className="rail-item group relative w-40 sm:w-48 md:w-56 lg:w-64 flex-none cursor-pointer">
      <div className="aspect-video overflow-hidden rounded-md bg-slate-800 shadow-soft">
        <img
          src={movie.backdrop}
          alt={`${movie.title} poster`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="mt-2 text-sm font-medium text-gray-200 line-clamp-1">{movie.title}</div>
    </div>
  );
}
