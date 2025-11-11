import React, { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import { movies } from "../data/movies";
import { useFocusable } from "../remote/focus/FocusContext";

/**
 * PUBLIC_INTERFACE
 * TitleDetail
 * Title detail page at /title/:id displaying:
 * - Full-bleed hero background using the clicked card's image
 * - Movie name at the top, a concise description
 * - Four pill-shaped controls: Play from the start, Play from the current, Stop, Language settings
 * - Handles missing/invalid ids gracefully with a friendly message and link back to Home
 * - TV remote focus support with pill buttons focusable; responsive layout
 */
export default function TitleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Resolve the movie by id; accept both numeric and string ids
  const movie = useMemo(() => {
    const targetId = isNaN(Number(id)) ? id : Number(id);
    return movies.find((m) => m.id === targetId) || null;
  }, [id]);

  // Declare focusable hooks unconditionally to satisfy React hook rules
  const { focusableProps: playStartFocus } = useFocusable({
    id: "detail-play-start",
    neighbors: { right: "detail-play-current", down: "detail-lang" },
    onSelect: () => window.alert?.("Play from the start"),
    defaultFocused: true,
  });
  const { focusableProps: playCurrentFocus } = useFocusable({
    id: "detail-play-current",
    neighbors: { left: "detail-play-start", right: "detail-stop", down: "detail-lang" },
    onSelect: () => window.alert?.("Play from the current position"),
  });
  const { focusableProps: stopFocus } = useFocusable({
    id: "detail-stop",
    neighbors: { left: "detail-play-current", down: "detail-lang" },
    onSelect: () => window.alert?.("Stop playback"),
  });
  const { focusableProps: langFocus } = useFocusable({
    id: "detail-lang",
    neighbors: { up: "detail-play-start" },
    onSelect: () => navigate("/settings"),
  });

  // Default focus no-op; first control has defaultFocused
  useEffect(() => {}, []);

  // Helper UI when not found
  const NotFound = () => (
    <div className="min-h-screen bg-[color:var(--ocean-bg)] flex flex-col">
      <NavBar />
      <main className="pt-20 md:pt-24 flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-5 md:px-6 lg:px-8">
          <div className="rounded-xl bg-[color:var(--ocean-surface)]/80 ring-1 ring-white/10 shadow-soft p-6">
            <h1 className="text-2xl font-bold text-white">Title not found</h1>
            <p className="mt-2 text-gray-300">
              The movie you're looking for couldn't be found. It may have been removed or the link is invalid.
            </p>
            <div className="mt-4">
              <Link to="/home" className="text-ocean-secondary hover:underline">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  if (!movie) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-[color:var(--ocean-bg)] flex flex-col">
      <NavBar />
      <main className="flex-1">
        {/* Hero section */}
        <section className="relative w-full h-[62vh] min-h-[420px] overflow-hidden">
          <img
            src={movie.backdrop}
            alt={`${movie.title} backdrop`}
            className="absolute inset-0 h-full w-full object-cover object-center"
            draggable="false"
            loading="eager"
          />
          <div className="absolute inset-0 bg-hero-fade pointer-events-none" aria-hidden="true" />
          <div
            className="absolute inset-0 bg-[radial-gradient(120%_100%_at_10%_50%,rgba(0,0,0,0.65),transparent_60%)] pointer-events-none"
            aria-hidden="true"
          />

          {/* Title and meta on hero */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 pt-24 md:pt-28">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow">
              {movie.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-200/90">
              <span className="text-amber-300 font-semibold">
                {movie.rating ? `${movie.rating} Match` : "90% Match"}
              </span>
              <span className="text-gray-300/90">{movie.year || "2024"}</span>
              <span className="rounded border border-white/30 px-1.5 py-0.5 text-[10px] leading-none text-gray-100">
                HD
              </span>
              <span className="text-gray-300/90">{movie.genre}</span>
            </div>
          </div>
        </section>

        {/* Content area */}
        <section className="relative -mt-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8">
            <div className="rounded-xl bg-[color:var(--ocean-surface)]/80 ring-1 ring-white/10 shadow-soft p-4 sm:p-6 md:p-8">
              <p className="text-gray-200/90 text-base md:text-lg max-w-3xl">
                {movie.description ||
                  "An immersive story set against a vast, mysterious ocean. Follow the journey through breathtaking landscapes and unforgettable characters."}
              </p>

              {/* Controls */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div {...playStartFocus} className="outline-none rounded-full">
                  <PillButton
                    variant="primary"
                    ariaLabel={`Play ${movie.title} from the start`}
                    onClick={() => window.alert?.("Play from the start")}
                  >
                    ▶ Play from the start
                  </PillButton>
                </div>

                <div {...playCurrentFocus} className="outline-none rounded-full">
                  <PillButton
                    variant="secondary"
                    ariaLabel={`Play ${movie.title} from the current position`}
                    onClick={() => window.alert?.("Play from the current position")}
                  >
                    ⏯ Play from the current
                  </PillButton>
                </div>

                <div {...stopFocus} className="outline-none rounded-full">
                  <PillButton
                    variant="ghost"
                    ariaLabel={`Stop ${movie.title}`}
                    onClick={() => window.alert?.("Stop")}
                  >
                    ⏹ Stop
                  </PillButton>
                </div>

                <div {...langFocus} className="outline-none rounded-full">
                  <PillButton
                    variant="secondary"
                    ariaLabel="Language settings"
                    onClick={() => navigate("/settings")}
                  >
                    🌐 Language settings
                  </PillButton>
                </div>
              </div>
            </div>

            {/* Back link (mobile-friendly) */}
            <div className="mt-4">
              <Link to="/home" className="text-sm text-gray-300 hover:text-white">
                ← Back to Home
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * PillButton
 * Ocean Professional pill-like button with hover/focus styles and variants.
 */
function PillButton({ children, variant = "primary", ariaLabel, onClick }) {
  const base =
    "w-full inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0";
  const styles = {
    primary: "bg-ocean-primary text-white hover:bg-blue-600 focus:ring-blue-400",
    secondary: "bg-ocean-secondary text-slate-900 hover:bg-amber-400 focus:ring-amber-300",
    ghost: "bg-white/10 text-gray-100 hover:bg-white/20 focus:ring-white/30",
  };
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`${base} ${styles[variant]}`}
    >
      {children}
    </button>
  );
}
