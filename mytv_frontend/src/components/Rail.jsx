import React, { useMemo, useRef } from "react";
import MovieCard from "./MovieCard";

/**
 * PUBLIC_INTERFACE
 * Rail
 * Horizontally scrollable list with prev/next controls on desktop,
 * sticky chevrons that appear on hover/focus, and TV-remote directional neighbors.
 * - Prominent section headings and consistent spacing
 * - Smooth scroll via buttons and native wheel/trackpad
 * - Snap behavior via CSS (index.css)
 * - Accessible: ARIA labels on chevrons
 */
export default function Rail({ title, items = [], railIndex = 0, baseId = "rail", baseNeighborUp, baseNeighborDown }) {
  const ref = useRef(null);

  const scrollBy = (delta) => {
    ref.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  const ids = useMemo(() => items.map((_, idx) => `${baseId}-${railIndex}-item-${idx}`), [items, railIndex, baseId]);

  return (
    <section className="relative my-8">
      <div className="mx-4 sm:mx-5 md:mx-6 lg:mx-8 flex items-center justify-between">
        <h2 className="text-lg md:text-2xl font-bold text-white">{title}</h2>
        {/* Desktop chevrons (also appear on container hover/focus) */}
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
        {/* Left/Right chevrons overlayed near edges for large screens */}
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
          className="rail-scroll mt-2 md:mt-3 flex gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 overflow-x-auto overflow-y-visible px-4 sm:px-5 md:px-6 lg:px-8 pb-2"
          onMouseEnter={(e) => {
            // reveal header chevrons
            const section = e.currentTarget.closest('section');
            section?.querySelectorAll('.rail-chevron')?.forEach((el) => el.classList.add('rail-chevron-show'));
          }}
          onMouseLeave={(e) => {
            const section = e.currentTarget.closest('section');
            section?.querySelectorAll('.rail-chevron')?.forEach((el) => el.classList.remove('rail-chevron-show'));
          }}
          onFocusCapture={(e) => {
            const section = e.currentTarget.closest('section');
            section?.querySelectorAll('.rail-chevron')?.forEach((el) => el.classList.add('rail-chevron-show'));
          }}
          onBlurCapture={(e) => {
            const section = e.currentTarget.closest('section');
            section?.querySelectorAll('.rail-chevron')?.forEach((el) => el.classList.remove('rail-chevron-show'));
          }}
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
