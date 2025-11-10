import React from "react";

/**
 * PUBLIC_INTERFACE
 * Footer
 * Global footer matching the dark Netflix-like theme with responsive layout and accessible links.
 */
export default function Footer() {
  const linkBase =
    "text-sm text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 rounded";

  return (
    <footer
      className="mt-10 border-t border-white/10 bg-[color:var(--ocean-surface)]/40"
      role="contentinfo"
      aria-label="Footer"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/10 ring-1 ring-white/10 flex items-center justify-center text-white">
              📺
            </div>
            <div className="text-xl font-extrabold">
              <span className="text-white">My</span>
              <span className="text-ocean-secondary">TV</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-3">
            <a href="#" className={linkBase}>
              Audio and Subtitles
            </a>
            <a href="#" className={linkBase}>
              Media Center
            </a>
            <a href="#" className={linkBase}>
              Privacy
            </a>
            <a href="#" className={linkBase}>
              Contact Us
            </a>
            <a href="#" className={linkBase}>
              Audio Description
            </a>
            <a href="#" className={linkBase}>
              Investor Relations
            </a>
            <a href="#" className={linkBase}>
              Legal Notices
            </a>
            <a href="#" className={linkBase}>
              Help Center
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} MyTV. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <a href="#" className="hover:text-white">
              Terms of Use
            </a>
            <span className="text-white/20">•</span>
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>
            <span className="text-white/20">•</span>
            <a href="#" className="hover:text-white">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
