import React from "react";

/**
 * PUBLIC_INTERFACE
 * Footer
 * Global footer matching the dark Netflix-like theme with responsive layout and accessible links.
 * Compact variant: reduced vertical padding, smaller type, tighter gaps, and single-row on large screens.
 */
export default function Footer() {
  const linkBase =
    "text-[12px] leading-5 text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 rounded";

  return (
    <footer
      className="mt-6 border-t border-white/10 bg-[color:var(--ocean-surface)]/40"
      role="contentinfo"
      aria-label="Footer"
    >
      {/* Reduced vertical padding; keep comfortable touch area on mobile */}
      <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5">
        {/* On desktop, compress to a single line when space allows */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-3">
          {/* Brand - smaller icon and text */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="h-7 w-7 sm:h-7 sm:w-7 rounded-lg bg-white/10 ring-1 ring-white/10 flex items-center justify-center text-white"
              aria-hidden="true"
            >
              📺
            </div>
            <div className="text-lg font-extrabold leading-6">
              <span className="text-white">My</span>
              <span className="text-ocean-secondary">TV</span>
            </div>
          </div>

          {/* Links - more compact grid on small; wrap into single row on large */}
          <nav aria-label="Footer links" className="w-full lg:w-auto">
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-1 lg:flex lg:flex-wrap lg:items-center lg:gap-x-4 lg:gap-y-0">
              <li>
                <a href="#" className={linkBase}>
                  Audio & Subtitles
                </a>
              </li>
              <li>
                <a href="#" className={linkBase}>
                  Media Center
                </a>
              </li>
              <li>
                <a href="#" className={linkBase}>
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className={linkBase}>
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className={linkBase}>
                  Audio Description
                </a>
              </li>
              <li>
                <a href="#" className={linkBase}>
                  Investor Relations
                </a>
              </li>
              <li>
                <a href="#" className={linkBase}>
                  Legal Notices
                </a>
              </li>
              <li>
                <a href="#" className={linkBase}>
                  Help Center
                </a>
              </li>
            </ul>
          </nav>

          {/* Legal - condensed and aligns to right on large */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 lg:gap-4 text-[11px] leading-5 text-gray-400">
            <p className="order-2 sm:order-1">
              © {new Date().getFullYear()} MyTV. All rights reserved.
            </p>
            <div className="order-1 sm:order-2 flex items-center gap-3 whitespace-nowrap">
              <a href="#" className="hover:text-white">
                Terms
              </a>
              <span className="text-white/20" aria-hidden="true">
                •
              </span>
              <a href="#" className="hover:text-white">
                Privacy
              </a>
              <span className="text-white/20" aria-hidden="true">
                •
              </span>
              <a href="#" className="hover:text-white">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
