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
 * - Movie name at the top, description immediately below the heading
 * - Four control actions rendered as icon-only buttons in a single horizontal row beneath the description:
 *   Play from start, Play from current, Back, Language settings
 * - Handles missing/invalid ids gracefully with a friendly message and link back to Home
 * - TV remote focus support with focusable pill icon buttons; responsive layout and keyboard focus
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
    neighbors: { right: "detail-play-current" },
    onSelect: () => window.alert?.("Play from the start"),
    defaultFocused: true,
  });
  const { focusableProps: playCurrentFocus } = useFocusable({
    id: "detail-play-current",
    neighbors: { left: "detail-play-start", right: "detail-back" },
    onSelect: () => window.alert?.("Play from the current position"),
  });
  const { focusableProps: backFocus } = useFocusable({
    id: "detail-back",
    neighbors: { left: "detail-play-current", right: "detail-lang" },
    onSelect: () => navigate(-1),
    onBack: () => navigate(-1),
  });
  const { focusableProps: langFocus } = useFocusable({
    id: "detail-lang",
    neighbors: { left: "detail-back" },
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
        {/* Hero section with only backdrop and title/meta; description relocated below heading in content card */}
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

        {/* Content area: description directly below heading context, then horizontal row of icon-only controls */}
        <section className="relative -mt-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8">
            <div className="rounded-xl bg-[color:var(--ocean-surface)]/80 ring-1 ring-white/10 shadow-soft p-4 sm:p-6 md:p-8">
              {/* Description placed immediately under the heading context */}
              <p className="text-gray-200/90 text-base md:text-lg max-w-3xl">
                {movie.description ||
                  "An immersive story set against a vast, mysterious ocean. Follow the journey through breathtaking landscapes and unforgettable characters."}
              </p>

              {/* Controls: single horizontal row of icon-only buttons directly under description */}
              <div
                className="mt-6 flex items-center gap-3 sm:gap-4 flex-wrap"
                role="group"
                aria-label="Player controls"
              >
                <div
                  {...playStartFocus}
                  className="outline-none rounded-full"
                  aria-label="Play from start container"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.keyCode === 13) {
                      e.preventDefault();
                      window.alert?.("Play from the start");
                    }
                  }}
                >
                  <IconPillButton
                    variant="primary"
                    ariaLabel={`Play ${movie.title} from the start`}
                    tooltip="Play from start"
                    onClick={() => window.alert?.("Play from the start")}
                  >
                    <span aria-hidden="true">▶</span>
                  </IconPillButton>
                </div>

                <div
                  {...playCurrentFocus}
                  className="outline-none rounded-full"
                  aria-label="Resume container"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.keyCode === 13) {
                      e.preventDefault();
                      window.alert?.("Play from the current position");
                    }
                  }}
                >
                  <IconPillButton
                    variant="secondary"
                    ariaLabel={`Play ${movie.title} from the current position`}
                    tooltip="Resume"
                    onClick={() => window.alert?.("Play from the current position")}
                  >
                    <span aria-hidden="true">⏯</span>
                  </IconPillButton>
                </div>

                <div
                  {...backFocus}
                  className="outline-none rounded-full"
                  aria-label="Back container"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.keyCode === 13) {
                      e.preventDefault();
                      navigate(-1);
                    }
                  }}
                >
                  <IconPillButton
                    variant="ghost"
                    ariaLabel="Go back"
                    tooltip="Back"
                    onClick={() => navigate(-1)}
                  >
                    <span aria-hidden="true">←</span>
                  </IconPillButton>
                </div>

                <div
                  {...langFocus}
                  className="outline-none rounded-full"
                  aria-label="Language settings container"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.keyCode === 13) {
                      e.preventDefault();
                      navigate("/settings");
                    }
                  }}
                >
                  <IconPillButton
                    variant="secondary"
                    ariaLabel="Language settings"
                    tooltip="Language"
                    onClick={() => navigate("/settings")}
                  >
                    <span aria-hidden="true">🌐</span>
                  </IconPillButton>
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
 * IconPillButton
 * Ocean Professional pill-like icon-only button with hover/focus styles and variants.
 * Accessible via aria-label; optionally shows a title tooltip on hover-capable devices.
 */
function IconPillButton({ children, variant = "primary", ariaLabel, onClick, tooltip }) {
  const base =
    "inline-flex items-center justify-center rounded-full h-10 w-10 md:h-11 md:w-11 text-base md:text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0";
  const styles = {
    primary: "bg-ocean-primary text-white hover:bg-blue-600 focus:ring-blue-400",
    secondary: "bg-ocean-secondary text-slate-900 hover:bg-amber-400 focus:ring-amber-300",
    ghost: "bg-white/10 text-gray-100 hover:bg-white/20 focus:ring-white/30",
  };
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={tooltip || undefined}
      onClick={onClick}
      className={`${base} ${styles[variant]}`}
    >
      {children}
    </button>
  );
}
