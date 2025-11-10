import React, { useEffect, useMemo } from "react";
import NavBar from "../components/NavBar";
import HeroBanner from "../components/HeroBanner";
import Rail from "../components/Rail";
import Footer from "../components/Footer";
import { movies, groupByGenre } from "../data/movies";
import { useFocusManager } from "../remote/focus/FocusContext";

/**
 * PUBLIC_INTERFACE
 * Home
 * Sticky nav, tall hero with gradient background, and several horizontal rails that scroll.
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
    const t = setTimeout(() => setFocus(defaultId), 80);
    return () => clearTimeout(t);
  }, [setFocus]);

  const railItems = railOrder.map((genre) => groups[genre] || []);
  const getUpNeighbor = (railIdx, itemIdx) => {
    const prevRail = railIdx - 1;
    if (prevRail < 0) return "navbar-login";
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
    <div className="min-h-screen bg-[color:var(--ocean-bg)] flex flex-col">
      <NavBar />
      <main className="pt-16 flex-1">
        <HeroBanner movie={featured} />
        <div className="mt-2">
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
