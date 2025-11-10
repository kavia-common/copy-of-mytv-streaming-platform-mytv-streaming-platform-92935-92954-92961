import React, { useEffect, useMemo } from "react";
import NavBar from "../components/NavBar";
import HeroBanner from "../components/HeroBanner";
import Rail from "../components/Rail";
import { movies, groupByGenre } from "../data/movies";
import { useFocusManager } from "../remote/focus/FocusContext";

/**
 * PUBLIC_INTERFACE
 * Home
 * Fixed top nav, hero banner from featured movie, and horizontal rails by genre.
 * Adds remote navigation support across rails and cards.
 */
export default function Home() {
  const groups = useMemo(() => groupByGenre(movies), []);
  const featured = movies[0];

  const railOrder = ["Trending", "Action", "Comedy", "Drama"];
  const { setFocus } = useFocusManager();

  // Initialize default focus to first item of first rail
  useEffect(() => {
    const defaultId = `rail-0-item-0`;
    const t = setTimeout(() => setFocus(defaultId), 50);
    return () => clearTimeout(t);
  }, [setFocus]);

  // Determine neighbor functions for up/down transitions between rails at same column index
  const railItems = railOrder.map((genre) => groups[genre] || []);
  const getUpNeighbor = (railIdx, itemIdx) => {
    const prevRail = railIdx - 1;
    if (prevRail < 0) return "navbar-login"; // jump to login button in navbar if pressing up from first rail
    const prevLen = railItems[prevRail]?.length || 0;
    const col = Math.min(itemIdx, prevLen - 1);
    return `rail-${prevRail}-item-${Math.max(0, col)}`;
  };
  const getDownNeighbor = (railIdx, itemIdx) => {
    const nextRail = railIdx + 1;
    if (nextRail >= railItems.length) return null;
    const nextLen = railItems[nextRail]?.length || 0;
    const col = Math.min(itemIdx, nextLen - 1);
    return `rail-${nextRail}-item-${Math.max(0, col)}`;
  };

  return (
    <div className="min-h-screen bg-[#0b1020]">
      <NavBar />
      <main className="pt-16">
        <HeroBanner movie={featured} />
        {railOrder.map((genre, railIdx) =>
          railItems[railIdx]?.length ? (
            <Rail
              key={genre}
              title={genre}
              items={railItems[railIdx]}
              railIndex={railIdx}
              baseId="rail"
              baseNeighborUp={(itemIdx) => getUpNeighbor(railIdx, itemIdx)}
              baseNeighborDown={(itemIdx) => getDownNeighbor(railIdx, itemIdx)}
            />
          ) : null
        )}
      </main>
    </div>
  );
}
