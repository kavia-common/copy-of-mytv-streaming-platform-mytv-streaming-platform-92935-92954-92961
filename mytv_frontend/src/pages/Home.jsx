import React, { useMemo } from "react";
import NavBar from "../components/NavBar";
import HeroBanner from "../components/HeroBanner";
import Rail from "../components/Rail";
import { movies, groupByGenre } from "../data/movies";

/**
 * PUBLIC_INTERFACE
 * Home
 * Fixed top nav, hero banner from featured movie, and horizontal rails by genre.
 */
export default function Home() {
  const groups = useMemo(() => groupByGenre(movies), []);
  const featured = movies[0];

  const railOrder = ["Trending", "Action", "Comedy", "Drama"];
  return (
    <div className="min-h-screen bg-[#0b1020]">
      <NavBar />
      <main className="pt-16">
        <HeroBanner movie={featured} />
        {railOrder.map((genre) =>
          groups[genre]?.length ? (
            <Rail key={genre} title={genre} items={groups[genre]} />
          ) : null
        )}
      </main>
    </div>
  );
}
