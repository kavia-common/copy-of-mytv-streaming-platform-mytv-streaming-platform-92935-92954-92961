import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import TopNav from "../components/TopNav";
import HeroBanner from "../components/HeroBanner";
import Rail from "../components/Rail";
import Footer from "../components/Footer";
import { movies, groupByGenre } from "../data/movies";
import { useFocusManager, useFocusable } from "../remote/focus/FocusContext";
import useRemoteKeys, { REMOTE_ACTIONS } from "../remote/useRemoteKeys";

/**
 * PUBLIC_INTERFACE
 * Home
 * Sticky translucent navbar, cinematic hero, and polished horizontal rails.
 * Maintains accessibility and TV remote navigation. Footer appears only on Home.
 * Integrates centralized remote key handling with on-screen debug overlay.
 */
export default function Home() {
  const groups = useMemo(() => groupByGenre(movies), []);
  const featured = movies[0];

  const railOrder = ["Trending", "Action", "Comedy", "Drama"];
  const { setFocus } = useFocusManager();
  const navigate = useNavigate();

  // Simple focus/selection state for first visible rail to demo navigation and Enter action
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [lastAction, setLastAction] = useState(null);
  const [showDebug, setShowDebug] = useState(true);

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

  // Centralized remote key handling demo for the second page (Home)
  const handleRemote = useCallback((action, e) => {
    setLastAction(action);

    switch (action) {
      case REMOTE_ACTIONS.LEFT: {
        e?.preventDefault?.();
        setFocusedIndex((i) => Math.max(0, i - 1));
        setFocus(`rail-0-item-${Math.max(0, focusedIndex - 1)}`);
        return true;
      }
      case REMOTE_ACTIONS.RIGHT: {
        e?.preventDefault?.();
        const maxIdx = (railItems[0]?.length || 1) - 1;
        setFocusedIndex((i) => Math.min(maxIdx, i + 1));
        setFocus(`rail-0-item-${Math.min(maxIdx, focusedIndex + 1)}`);
        return true;
      }
      case REMOTE_ACTIONS.UP:
      case REMOTE_ACTIONS.DOWN: {
        // Let focus manager/rails handle actual vertical moves, but prevent page scroll
        e?.preventDefault?.();
        return false;
      }
      case REMOTE_ACTIONS.ENTER: {
        e?.preventDefault?.();
        const item = railItems[0]?.[focusedIndex];
        // Sample action: log selection; could navigate to detail page if desired
        // eslint-disable-next-line no-console
        console.log("select", { rail: 0, index: focusedIndex, item });
        return true;
      }
      case REMOTE_ACTIONS.BACK: {
        e?.preventDefault?.();
        // Navigate back if possible; otherwise to splash
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate("/", { replace: true });
        }
        return true;
      }
      case REMOTE_ACTIONS.EXIT: {
        e?.preventDefault?.();
        // Show a simple notification via console and navigate to splash
        // eslint-disable-next-line no-console
        console.log("Exit pressed");
        navigate("/", { replace: true });
        return true;
      }
      default:
        return false;
    }
  }, [focusedIndex, navigate, railItems, setFocus]);

  useRemoteKeys(handleRemote);

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

        {/* Debug overlay showing last key and focused index for the first rail */}
        {showDebug && (
          <div className="fixed bottom-4 left-4 z-[200] rounded-md bg-black/70 text-white text-xs px-3 py-2 ring-1 ring-white/10">
            <div className="font-semibold text-sm mb-1">Debug</div>
            <div>Last key: <span className="text-amber-300">{String(lastAction || "—")}</span></div>
            <div>Focused index (rail 0): <span className="text-amber-300">{focusedIndex}</span></div>
            <button
              type="button"
              className="mt-1 rounded bg-white/10 px-2 py-0.5 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400"
              onClick={() => setShowDebug(false)}
            >
              Hide
            </button>
          </div>
        )}

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
