import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/Button";
import { useFocusable, useFocusManager } from "../remote/focus/FocusContext";

/**
 * PUBLIC_INTERFACE
 * Splash
 * Centered splash screen with branding and subtle animation, auto-navigation to /home
 */
export default function Splash() {
  const navigate = useNavigate();
  const { setFocus } = useFocusManager();

  useEffect(() => {
    const t = setTimeout(() => navigate("/home"), 1600);
    return () => clearTimeout(t);
  }, [navigate]);

  const { focusableProps: enterProps } = useFocusable({
    id: "splash-enter",
    onSelect: () => navigate("/home"),
    defaultFocused: true,
  });

  const { focusableProps: loginProps } = useFocusable({
    id: "splash-login",
    onSelect: () => navigate("/login"),
    neighbors: { left: "splash-enter", right: null, up: null, down: null },
  });

  return (
    <div className="min-h-screen bg-ocean-gradient flex items-center justify-center relative overflow-hidden">
      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl"></div>

      <div className="relative z-10 text-center px-6">
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-ocean-secondary/20 flex items-center justify-center text-2xl">
          📺
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
          <span className="text-ocean-primary">My</span>
          <span className="text-ocean-secondary">TV</span>
        </h1>
        <p className="mt-3 text-slate-700">
          Stream a world of stories with a clean, modern experience.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <span {...enterProps}>
            <Button onClick={() => navigate("/home")}>Enter</Button>
          </span>
          <Link to="/login" className="text-sm text-slate-700 underline hover:text-slate-900" {...loginProps}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
