import React, { useMemo } from "react";
import { useFocusable } from "../remote/focus/FocusContext";

/**
 * PUBLIC_INTERFACE
 * MovieCard
 * Poster-style card for horizontal rails with hover scale, shadow, and quick metadata.
 * - Maintains 16:9 aspect ratio to prevent layout shifts.
 * - Smooth GPU-accelerated hover/focus transitions; elevated shadow + subtle scale.
 * - Delayed preview panel shows title, match rating and badges without shifting layout.
 * - Accessible: focus-visible mirrors hover state without jitter.
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
      className={`rail-item group relative flex-none cursor-pointer outline-none
        w-36 h-20 sm:w-36 sm:h-20 md:w-44 md:h-24 lg:w-56 lg:h-32 xl:w-64 xl:h-36
        overflow-visible
        ${focused ? "ring-2 ring-amber-400" : ""}`}
      style={{ contain: "layout paint size", transformStyle: "preserve-3d" }}
    >
      <div
        className={`relative aspect-[16/9] w-full rounded-md bg-[color:var(--ocean-surface)]
          transition-transform duration-300 ease-smooth transform-gpu will-change-transform
          ring-1 ring-white/10
          group-hover:scale-[1.07] group-hover:drop-shadow-xl
          ${focused ? "scale-[1.07] drop-shadow-xl" : ""}
        `}
        aria-hidden="true"
      >
        <img
          src={movie.backdrop}
          alt={`${movie.title} poster`}
          className="h-full w-full rounded-md object-cover select-none pointer-events-none"
          loading="lazy"
          draggable="false"
        />

        {/* Delayed hover/focus preview panel */}
        <div
          className={`absolute left-0 right-0 bottom-0 translate-y-1 opacity-0
            transition-all duration-300 ease-out delay-150
            group-hover:opacity-100 group-hover:translate-y-0
            ${focused ? "opacity-100 translate-y-0" : ""}
          `}
        >
          <div className="m-2 rounded-md bg-black/75 px-2 py-1.5 text-[11px] text-gray-200 shadow-soft ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold truncate">{movie.title}</span>
              <span className="whitespace-nowrap text-amber-300">{movie.rating ? `${movie.rating} Match` : "90% Match"}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-gray-300/90">
              <span>{movie.year || "2024"}</span>
              <span aria-hidden="true">•</span>
              <span>{movie.genre}</span>
              <span className="ml-auto rounded border border-white/30 px-1 py-[1px] text-[9px] leading-none">HD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Title below card - compact single line */}
      <div className="mt-1 text-[13px] font-medium text-gray-200 line-clamp-1">{movie.title}</div>
    </div>
  );
}
