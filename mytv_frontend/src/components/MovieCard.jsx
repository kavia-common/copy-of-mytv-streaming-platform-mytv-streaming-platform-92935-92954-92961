import React, { useMemo } from "react";
import { useFocusable } from "../remote/focus/FocusContext";

/**
 * PUBLIC_INTERFACE
 * MovieCard
 * Poster-style card for horizontal rails.
 */
export default function MovieCard({ movie, focusId, neighbors, onSelect }) {
  const cardId = focusId || `movie-${movie?.id}`;
  const handleSelect = useMemo(
    () =>
      onSelect ||
      (() => {
        // Placeholder behavior for acceptance criteria
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
