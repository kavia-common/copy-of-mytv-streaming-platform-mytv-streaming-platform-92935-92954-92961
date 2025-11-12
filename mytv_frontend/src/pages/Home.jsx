import React, { useEffect, useMemo, useRef } from "react";
import NavBar from "../components/NavBar";
import TopNav from "../components/TopNav";
import HeroBanner from "../components/HeroBanner";
import Rail from "../components/Rail";
import Footer from "../components/Footer";
import { movies, groupByGenre } from "../data/movies";
import { useFocusManager, useFocusable } from "../remote/focus/FocusContext";
import { ACTIONS, useRemoteControl } from "../remote/RemoteControl";

/**
 * PUBLIC_INTERFACE
 * Home
 * Sticky translucent navbar, cinematic hero, and polished horizontal rails.
 * Maintains accessibility and TV remote navigation. Footer appears only on Home.
 */
export default function Home() {
  const groups = useMemo(() => groupByGenre(movies), []);
  const featured = movies[0];

  const railOrder = ["Trending", "Action", "Comedy", "Drama"];
  const { setFocus } = useFocusManager();

  // Provide a root anchor to ensure TV remotes have an initial focusable if rails haven't mounted yet
  const { focusableProps: rootFocus } = useFocusable({
    id: "home-root",
    defaultFocused: true,
    onSelect: () => {
      // If pressed Enter on root, move to first rail item
      setFocus("rail-0-item-0");
    },
  });
  const rootRef = useRef(null);

  // Initialize default focus to first item of first rail
  useEffect(() => {
    const defaultId = `rail-0-item-0`;
    const t = setTimeout(() => setFocus(defaultId), 120);
    return () => clearTimeout(t);
  }, [setFocus]);

  // Remote hook mainly to prevent default page scroll on arrow usage before rails focus is set
  useRemoteControl((action, e) => {
    if ([ACTIONS.UP, ACTIONS.DOWN, ACTIONS.LEFT, ACTIONS.RIGHT].includes(action)) {
      e?.preventDefault?.();
      return false; // let default provider move focus
    }
    // Back/Exit/Info handled by provider; Enter activates focused Rail item via focus manager
    return false;
  });

  const railItems = railOrder.map((genre) => groups[genre] || []);
  const getUpNeighbor = (railIdx, itemIdx) => {
    const prevRail = railIdx - 1;
    if (prevRail < 0) return "navbar-login";
    const prevLen = railItems[prevRail]?.length || 0;
    const col = Math.min(itemIdx, Math.max(prevLen - 1, 0));
    return `rail-${prevRail}-item-${col}`;
  };
  const getDownNeighbor = (railIdx, itemIdx) => {
    const nextRail = railIdx + 1;
    if (nextRail >= railItems.length) return null;
    const nextLen = railItems[nextRail]?.length || 0;
    const col = Math.min(itemIdx, Math.max(nextLen - 1, 0));
    return `rail-${nextRail}-item-${col}`;
  };

  return (
    <div className="min-h-screen bg-[color:var(--ocean-bg)] flex flex-col">
      {/* Invisible anchor for initial focus to avoid browser default scrolling with arrows */}
      <button
        {...rootFocus}
        ref={rootRef}
        aria-hidden="true"
        className="sr-only"
      >
        Home Focus Anchor
      </button>

      {/* Keep original NavBar (sections, etc.) and add TopNav avatar for auth */}
      <NavBar />
      <TopNav />
      <main className="flex-1 pt-10 md:pt-10">
        <HeroBanner movie={featured} />
        <div className="mt-1 space-y-2">
          {/* Anchored sections for navbar hash links */}
          <div id="tv">
            <Rail
              title="Trending"
              items={railItems[0]}
              railIndex={0}
              baseId="rail"
              baseNeighborUp={(itemIdx) => getUpNeighbor(0, itemIdx)}
              baseNeighborDown={(itemIdx) => getDownNeighbor(0, itemIdx)}
            />
          </div>
          <div id="movies">
            <Rail
              title="Action"
              items={railItems[1]}
              railIndex={1}
              baseId="rail"
              baseNeighborUp={(itemIdx) => getUpNeighbor(1, itemIdx)}
              baseNeighborDown={(itemIdx) => getDownNeighbor(1, itemIdx)}
            />
          </div>
          <div id="new">
            <Rail
              title="Comedy"
              items={railItems[2]}
              railIndex={2}
              baseId="rail"
              baseNeighborUp={(itemIdx) => getUpNeighbor(2, itemIdx)}
              baseNeighborDown={(itemIdx) => getDownNeighbor(2, itemIdx)}
            />
          </div>
          <div id="list">
            <Rail
              title="Drama"
              items={railItems[3]}
              railIndex={3}
              baseId="rail"
              baseNeighborUp={(itemIdx) => getUpNeighbor(3, itemIdx)}
              baseNeighborDown={(itemIdx) => getDownNeighbor(3, itemIdx)}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
