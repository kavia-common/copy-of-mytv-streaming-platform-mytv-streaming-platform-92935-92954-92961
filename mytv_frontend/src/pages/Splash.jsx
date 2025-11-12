import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ACTIONS, useRemoteControl } from "../remote/RemoteControl";
import { useFocusable, useFocusManager } from "../remote/focus/FocusContext";

/**
 * PUBLIC_INTERFACE
 * Splash
 * Minimalist dark splash with animated brand fade-in. No buttons/CTAs are rendered.
 * Auto-redirects to /home shortly after mount, preserving existing navigation flow.
 * Remote handling:
 *  - Arrows: ensure focus anchor is set and prevent default.
 *  - Enter: navigate to /home (continue).
 *  - Back: defer to provider (history/back or route fallback).
 *  - Exit: go to root.
 */
export default function Splash() {
  const navigate = useNavigate();
  const { setFocus } = useFocusManager();

  // Provide a single hidden focusable for TV remotes so arrow keys have a target immediately.
  const { focusableProps } = useFocusable({
    id: "splash-root",
    onSelect: () => navigate("/home"),
    defaultFocused: true,
  });
  const focusRef = useRef(null);

  // Auto-redirect after short delay
  useEffect(() => {
    const t = setTimeout(() => navigate("/home"), 1600);
    return () => clearTimeout(t);
  }, [navigate]);

  // Subscribe to remote keys for explicit handling on splash
  useRemoteControl((action, e) => {
    switch (action) {
      case ACTIONS.ENTER:
        navigate("/home", { replace: true });
        return true; // provider will preventDefault/stopPropagation
      case ACTIONS.UP:
      case ACTIONS.DOWN:
      case ACTIONS.LEFT:
      case ACTIONS.RIGHT:
        // Ensure our root gets focus so arrows don't scroll the page
        setFocus("splash-root");
        return true; // provider prevents default for arrows
      case ACTIONS.BACK:
        // Let provider decide (it will route to login/home appropriately)
        return false;
      case ACTIONS.EXIT:
        navigate("/", { replace: true });
        return true;
      default:
        return false;
    }
  });

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-[color:var(--ocean-bg)]">
      {/* Hidden/transparent focus anchor for TV navigation */}
      <button
        {...focusableProps}
        ref={focusRef}
        aria-hidden="true"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-2 focus:py-1 focus:rounded focus:bg-black/60 focus:text-white"
      >
        Splash Focus Anchor
      </button>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.12),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(245,158,11,0.12),transparent_40%)]" />
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="text-center px-6 animate-[fadeIn_800ms_ease-out_forwards] opacity-0">
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: translateY(0);} }`}</style>
          <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-2xl text-white">
            📺
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold">
            <span className="text-white">My</span>
            <span className="text-ocean-secondary">TV</span>
          </h1>
          <p className="mt-3 text-gray-300">Stream a world of stories. Anywhere.</p>
          {/* Intentionally no CTAs/buttons to satisfy requirement. Layout remains centered and balanced. */}
        </div>
      </div>
    </div>
  );
}
