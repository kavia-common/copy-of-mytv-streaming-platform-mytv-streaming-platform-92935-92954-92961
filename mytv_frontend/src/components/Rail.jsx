import React, { useMemo, useRef } from "react";
import MovieCard from "./MovieCard";

/**
 * PUBLIC_INTERFACE
 * Rail
 * Horizontally scrollable list with controls. Spacing is clamped and rails do not impact viewport height.
 */
export default function Rail({ title, items = [], railIndex = 0, baseId = "rail", baseNeighborUp, baseNeighborDown }) {
  const ref = useRef(null);

  const scrollBy = (delta) => {
    ref.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  const ids = useMemo(() => items.map((_, idx) => `${baseId}-${railIndex}-item-${idx}`), [items, railIndex, baseId]);

  return (
    <section className="section mt-clamp relative">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-2xl font-bold text-white">{title}</h2>
        <div className="hidden md:flex gap-2">
          <button
            type="button"
            aria-label={`${title} previous`}
            onClick={() => scrollBy(-600)}
            className="rail-chevron rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label={`${title} next`}
            onClick={() => scrollBy(600)}
            className="rail-chevron rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            ›
          </button>
        </div>
      </div>

      <div className="group relative">
        <button
          type="button"
          aria-label={`${title} previous`}
          onClick={() => scrollBy(-600)}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white ring-1 ring-white/10 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-amber-400 rail-chevron"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label={`${title} next`}
          onClick={() => scrollBy(600)}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white ring-1 ring-white/10 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-amber-400 rail-chevron"
        >
          ›
        </button>

        <div
          ref={ref}
          className="rail-list overflow-x-auto overflow-y-visible pb-2"
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
      </div>
    </section>
  );
}
