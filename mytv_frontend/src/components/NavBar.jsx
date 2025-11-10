import React from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * NavBar
 * Fixed top navigation with brand, search, and login link.
 */
export default function NavBar() {
  const location = useLocation();
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/60 to-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link to="/home" className="text-2xl font-extrabold tracking-tight">
          <span className="text-white">My</span>
          <span className="text-ocean-secondary">TV</span>
        </Link>
        <div className="flex items-center gap-4">
          <button aria-label="Search" className="text-gray-200 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-5.2-5.2M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          {location.pathname !== "/login" && (
            <Link to="/login" className="text-sm text-gray-200 hover:text-white">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
