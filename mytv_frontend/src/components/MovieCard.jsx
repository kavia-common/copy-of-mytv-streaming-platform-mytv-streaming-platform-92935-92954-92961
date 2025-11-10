import React, { useMemo } from "react";
import { useFocusable } from "../remote/focus/FocusContext";

/**
 * PUBLIC_INTERFACE
 * MovieCard
 * Poster-style card for horizontal rails with hover scale, shadow, and quick metadata.
 */
export default function MovieCard({ movie, focusId, neighbors, onSelect }) {
  const cardId = focusId || `movie-${movie?.id}`;
  const handleSelect = useMemo(
    () =>
      onSelect ||
      (() => {
        window.alert?.(`Selected: ${movie?.title}`);
      }),
    [onSelect, movie?.title]
  );

  const { focusableProps, focused } = useFocusable({
    id: cardId,
    neighbors,
    onSelect: handleSelect,
  });

  return (
    <div
      {...focusableProps}
      className={`rail-item group relative w-40 sm:w-48 md:w-56 lg:w-64 flex-none cursor-pointer outline-none ${
        focused ? "ring-2 ring-amber-400" : ""
      }`}
    >
      <div className="aspect-video overflow-hidden rounded-md bg-[color:var(--ocean-surface)] transition-transform duration-300 ease-smooth group-hover:scale-105 group-hover:shadow-card-hover">
        <img
          src={movie.backdrop}
          alt={`${movie.title} poster`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="mt-2 text-sm font-medium text-gray-200 line-clamp-1">{movie.title}</div>
      <div className="pointer-events-none absolute inset-x-0 -bottom-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="rounded-md bg-black/70 p-2 text-xs text-gray-200 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{movie.title}</span>
            <span className="text-amber-300">⭐ {movie.rating || "8.1"}</span>
          </div>
          <div className="mt-1 text-[11px] text-gray-300/90">{movie.year || "2024"} • {movie.genre}</div>
        </div>
      </div>
    </div>
  );
}
