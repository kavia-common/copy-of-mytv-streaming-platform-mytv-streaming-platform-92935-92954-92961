import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useFocusable } from "../remote/focus/FocusContext";

/**
 * PUBLIC_INTERFACE
 * MovieCard
 * 16:9 poster area with object-fit cover to prevent stretching. Keyboard/remote accessible.
 */
export default function MovieCard({ movie, focusId, neighbors, onSelect }) {
  const navigate = useNavigate();
  const cardId = focusId || `movie-${movie?.id}`;

  const handleSelect = useMemo(
    () =>
      onSelect ||
      (() => {
        if (movie?.id != null) {
          navigate(`/title/${movie.id}`);
        } else {
          window.alert?.(`Selected: ${movie?.title || "Unknown title"}`);
        }
      }),
    [onSelect, movie?.id, movie?.title, navigate]
  );

  const { focusableProps, focused } = useFocusable({
    id: cardId,
    neighbors,
    onSelect: handleSelect,
  });

  return (
    <div
      {...focusableProps}
      role="button"
      aria-label={`${movie?.title || "Movie"} card. Press Enter to open details`}
      onClick={handleSelect}
      onKeyDown={(e) => {
        const key = e.key || "";
        if (key === "Enter" || e.keyCode === 13) {
          e.preventDefault();
          handleSelect();
        }
      }}
      className={`rail-item group relative flex-none cursor-pointer outline-none
        w-[44vw] sm:w-[32vw] md:w-[22vw] lg:w-[18vw] xl:w-[16vw] 2xl:w-[14vw]
        max-w-[18rem] min-w-[9rem]
        overflow-visible
        ${focused ? "ring-2 ring-amber-400" : ""}`}
      style={{ contain: "layout paint size", transformStyle: "preserve-3d" }}
    >
      <div
        className={`relative aspect-[16/9] w-full rounded-md bg-[color:var(--ocean-surface)]
          transform-gpu gpu will-transform motion-transform
          ring-1 ring-white/10
          group-hover:scale-[1.06] group-hover:shadow-card-hover
          ${focused ? "scale-[1.06] shadow-card-hover" : ""}
        `}
        aria-hidden="true"
      >
        <img
          src={movie.backdrop}
          alt={`${movie.title} poster`}
          className="absolute inset-0 h-full w-full rounded-md object-cover select-none pointer-events-none"
          loading="lazy"
          draggable="false"
        />
      </div>

      <div className="mt-1 text-[13px] font-medium text-gray-200 line-clamp-1">
        {movie.title}
      </div>
    </div>
  );
}
