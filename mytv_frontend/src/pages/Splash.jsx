import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ACTIONS, useRemoteControl } from "../remote/RemoteControl";
import { useFocusable, useFocusManager } from "../remote/focus/FocusContext";

/**
 * PUBLIC_INTERFACE
 * Splash
 * Centered splash with safe viewport sizing and non-stretch media. Auto-redirects to /home.
 */
export default function Splash() {
  const navigate = useNavigate();
  const { setFocus } = useFocusManager();

  const { focusableProps } = useFocusable({
    id: "splash-root",
    onSelect: () => navigate("/home"),
    defaultFocused: true,
  });
  const focusRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => navigate("/home"), 1600);
    return () => clearTimeout(t);
  }, [navigate]);

  useRemoteControl((action, e) => {
    switch (action) {
      case ACTIONS.ENTER:
        navigate("/home", { replace: true });
        e?.preventDefault?.();
        return true;
      case ACTIONS.UP:
      case ACTIONS.DOWN:
      case ACTIONS.LEFT:
      case ACTIONS.RIGHT:
        setFocus("splash-root");
        e?.preventDefault?.();
        return true;
      default:
        return false;
    }
  });

  return (
    <div className="splash bg-black text-white">
      <button
        {...focusableProps}
        ref={focusRef}
        aria-hidden="true"
        className="sr-only"
      >
        Splash Focus Anchor
      </button>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.12),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(245,158,11,0.12),transparent_40%)]" />
      <div className="relative z-10 flex items-center justify-center">
        <div className="text-center px-6 md:px-10">
          <div className="mx-auto mb-clamp h-16 w-16 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-2xl text-white">
            📺
          </div>
          <div className="text-5xl font-extrabold">
            <span className="text-white">My</span>
            <span className="text-ocean-secondary">TV</span>
          </div>
          <div className="mt-3 text-gray-300">
            Loading your entertainment...
          </div>
        </div>
      </div>
    </div>
  );
}
