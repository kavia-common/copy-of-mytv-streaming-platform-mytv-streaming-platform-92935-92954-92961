import React, { useMemo, useRef } from "react";
import MovieCard from "./MovieCard";

/**
 * PUBLIC_INTERFACE
 * Rail
 * Horizontally scrollable list with prev/next controls on desktop,
 * TV-remote directional neighbors, and subtle hover polish.
 */
export default function Rail({ title, items = [], railIndex = 0, baseId = "rail", baseNeighborUp, baseNeighborDown }) {
  const ref = useRef(null);
  const scrollBy = (delta) => {
    ref.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  const ids = useMemo(() => items.map((m, idx) => `${baseId}-${railIndex}-item-${idx}`), [items, railIndex, baseId]);

  return (
    <section className="relative my-8">
      <div className="mx-6 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
        <div className="hidden md:flex gap-2">
          <button
            aria-label={`${title} previous`}
            onClick={() => scrollBy(-500)}
            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            ‹
          </button>
          <button
            aria-label={`${title} next`}
            onClick={() => scrollBy(500)}
            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            ›
          </button>
        </div>
      </div>
      <div
        ref={ref}
        className="rail-scroll mt-3 flex gap-3 overflow-x-auto px-6 pb-2"
      >
        {items.map((m, idx) => {
          const left = idx > 0 ? ids[idx - 1] : null;
          const right = idx < ids.length - 1 ? ids[idx + 1] : null;
          const neighbors = {
            left,
            right,
            up: baseNeighborUp ? (typeof baseNeighborUp === "function" ? baseNeighborUp(idx) : baseNeighborUp) : null,
            down: baseNeighborDown ? (typeof baseNeighborDown === "function" ? baseNeighborDown(idx) : baseNeighborDown) : null,
          };
          return <MovieCard key={`${m.id}-${idx}`} movie={m} focusId={ids[idx]} neighbors={neighbors} />;
        })}
      </div>
    </section>
  );
}
