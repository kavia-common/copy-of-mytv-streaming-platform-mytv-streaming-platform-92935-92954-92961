import React, { useRef } from "react";
import MovieCard from "./MovieCard";

/**
 * PUBLIC_INTERFACE
 * Rail
 * Horizontally scrollable list with prev/next controls on desktop
 */
export default function Rail({ title, items = [] }) {
  const ref = useRef(null);
  const scrollBy = (delta) => {
    ref.current?.scrollBy({ left: delta, behavior: "smooth" });
  };
  return (
    <section className="relative my-6">
      <div className="mx-6 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
        <div className="hidden md:flex gap-2">
          <button
            aria-label={`${title} previous`}
            onClick={() => scrollBy(-400)}
            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            ‹
          </button>
          <button
            aria-label={`${title} next`}
            onClick={() => scrollBy(400)}
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
        {items.map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>
    </section>
  );
}
