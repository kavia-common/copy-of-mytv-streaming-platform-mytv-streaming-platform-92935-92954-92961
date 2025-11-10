import React, { useMemo } from "react";
import { useFocusable } from "../remote/focus/FocusContext";

/**
 * PUBLIC_INTERFACE
 * MovieCard
 * Poster-style card for horizontal rails with hover scale, shadow, and quick metadata.
 * - Maintains 16:9 aspect ratio to prevent layout shifts.
 * - Smooth GPU-accelerated hover/focus transitions with slight tilt and elevated shadow.
 * - Delayed metadata reveal on hover/focus for Netflix-like feel.
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
      // Widths per breakpoint; fixed flex-basis ensures the rail reserves space (no layout shift).
      // overflow-visible allows scaled card to exceed its box without clipping.
      className={`rail-item group relative flex-none cursor-pointer outline-none
        w-36 h-20 sm:w-36 sm:h-20 md:w-44 md:h-24 lg:w-56 lg:h-32 xl:w-64 xl:h-36
        overflow-visible
        ${focused ? "ring-2 ring-amber-400" : ""}`}
      style={{ contain: "layout paint size", transformStyle: "preserve-3d" }}
    >
      <div
        // aspect-[16/9] combined with fixed container size keeps visual ratio tight.
        className={`relative aspect-[16/9] w-full rounded-md bg-[color:var(--ocean-surface)] 
          transition-all duration-300 ease-out transform-gpu will-change-transform will-change-opacity
          ring-1 ring-white/10
          group-hover:scale-[1.08] group-hover:rotate-[1deg] group-hover:drop-shadow-xl
          ${focused ? "scale-[1.08] rotate-[1deg] drop-shadow-xl" : ""}
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
        {/* Metadata overlay - delayed reveal */}
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 translate-y-1 opacity-0
            transition-all duration-300 ease-out delay-100
            group-hover:opacity-100 group-hover:translate-y-0
            ${focused ? "opacity-100 translate-y-0" : ""}
          `}
        >
          <div className="m-2 rounded-md bg-black/70 px-2 py-1.5 text-[11px] text-gray-200 shadow-soft ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold truncate">{movie.title}</span>
              <span className="whitespace-nowrap text-amber-300">⭐ {movie.rating || "8.1"}</span>
            </div>
            <div className="mt-0.5 text-[10px] text-gray-300/90">
              {movie.year || "2024"} • {movie.genre}
            </div>
          </div>
        </div>
      </div>

      {/* Title below card - small, single line to keep rails compact */}
      <div className="mt-1 text-[13px] font-medium text-gray-200 line-clamp-1">{movie.title}</div>
    </div>
  );
}
