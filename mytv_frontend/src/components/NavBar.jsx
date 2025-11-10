import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFocusable } from "../remote/focus/FocusContext";
import ProfileMenu from "./ProfileMenu";

/**
 * PUBLIC_INTERFACE
 * NavBar
 * Sticky top navigation with brand, section links, search icon and profile/avatar dropdown.
 * - Semi-transparent on top; becomes solid on scroll with blur for a translucent effect.
 * - Active section state highlights current anchor.
 * - Accessible keyboard and TV-remote friendly focusable items.
 */
export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sections = useMemo(
    () => [
      { label: "Home", to: "/home" },
      { label: "TV Shows", to: "/home#tv" },
      { label: "Movies", to: "/home#movies" },
      { label: "New & Popular", to: "/home#new" },
      { label: "My List", to: "/home#list" },
    ],
    []
  );

  const currentHash = location.hash?.replace("#", "") || "";

  const { focusableProps: loginFocus } = useFocusable({
    id: "navbar-login",
    neighbors: { right: "profile-avatar" },
    onSelect: () => navigate("/login"),
  });

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        solid ? "bg-black/70 navbackdrop" : "bg-gradient-to-b from-black/60 to-transparent"
      }`}
      role="navigation"
      aria-label="Top Navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8 py-2.5 md:py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/home" className="text-2xl font-extrabold tracking-tight">
            <span className="text-white">My</span>
            <span className="text-ocean-secondary">TV</span>
          </Link>
          <ul className="hidden md:flex items-center gap-5 text-sm text-gray-200">
            {sections.map((s) => {
              const targetHash = s.to.includes("#") ? s.to.split("#")[1] : "";
              const active = targetHash ? currentHash === targetHash : location.pathname === s.to;
              return (
                <li key={s.label}>
                  <Link
                    to={s.to}
                    className={`px-1 py-0.5 rounded transition-colors ${active ? "text-white" : "text-gray-300 hover:text-white"}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {s.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center gap-4">
          <button aria-label="Search" className="text-gray-200 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-5.2-5.2M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <div className="hidden sm:flex items-center gap-3">
            {location.pathname !== "/login" && (
              <Link
                to="/login"
                className="text-sm text-gray-200 hover:text-white rounded-md px-2 py-1 focus:outline-none data-[focused=true]:ring-2 data-[focused=true]:ring-amber-400"
                {...loginFocus}
              >
                Login
              </Link>
            )}
            <ProfileMenu idBase="profile" />
          </div>
        </div>
      </div>
    </nav>
  );
}
