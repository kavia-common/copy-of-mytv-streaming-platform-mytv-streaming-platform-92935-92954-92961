import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFocusable } from "../remote/focus/FocusContext";

/**
 * PUBLIC_INTERFACE
 * NavBar
 * Sticky top navigation with brand, section links, search icon and profile/avatar placeholder.
 * - Semi-transparent on top; becomes solid on scroll.
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

  const sections = [
    { label: "Home", to: "/home" },
    { label: "TV Shows", to: "/home#tv" },
    { label: "Movies", to: "/home#movies" },
    { label: "New & Popular", to: "/home#new" },
    { label: "My List", to: "/home#list" },
  ];

  const { focusableProps: loginFocus } = useFocusable({
    id: "navbar-login",
    onSelect: () => navigate("/login"),
  });

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
        solid ? "bg-black/80 navbackdrop" : "bg-gradient-to-b from-black/50 to-transparent"
      }`}
      role="navigation"
      aria-label="Top Navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/home" className="text-2xl font-extrabold tracking-tight">
            <span className="text-white">My</span>
            <span className="text-ocean-secondary">TV</span>
          </Link>
          <ul className="hidden md:flex items-center gap-4 text-sm text-gray-200">
            {sections.map((s) => (
              <li key={s.label}>
                <Link
                  to={s.to}
                  className={`hover:text-white transition-colors ${
                    location.hash === s.to.split("#")[1] ? "text-white" : ""
                  }`}
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-4">
          <button aria-label="Search" className="text-gray-200 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="h-8 w-8 rounded bg-white/10 flex items-center justify-center text-sm text-white/80">A</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
