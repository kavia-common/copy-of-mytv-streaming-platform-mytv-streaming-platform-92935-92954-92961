import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * Splash
 * Minimalist dark splash with animated brand fade-in. No buttons/CTAs are rendered.
 * Auto-redirects to /home shortly after mount, preserving existing navigation flow.
 */
export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate("/home"), 1600);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-[color:var(--ocean-bg)]">
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
