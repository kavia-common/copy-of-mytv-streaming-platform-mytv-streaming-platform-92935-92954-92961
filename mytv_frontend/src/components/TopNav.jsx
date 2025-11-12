import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getSession, findUser, clearSession } from "../store/userStore";
import { useFocusable } from "../remote/focus/FocusContext";
import { useRemoteControl } from "../remote/RemoteControl";

/**
 * PUBLIC_INTERFACE
 * TopNav
 * Simplified top bar showing brand and a right-side avatar when logged in.
 * Avatar shows the initial of the username and opens a small dropdown with Logout.
 * Integrates with TV remote focus via useFocusable.
 */
export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  // Example subscription placeholder; reserved for future color/info actions scoped to TopNav if needed
  useRemoteControl(() => false);

  useEffect(() => {
    const sess = getSession();
    if (sess?.username) {
      setUsername(sess.username);
    } else {
      setUsername("");
    }
  }, [location.pathname]);

  const initial = useMemo(() => (username ? username.charAt(0).toUpperCase() : "U"), [username]);
  const isLoggedIn = !!username;
  const sessionUser = isLoggedIn ? findUser(username) : null;

  // Always declare hooks at top-level to satisfy rules-of-hooks
  const { focusableProps: avatarFocus } = useFocusable({
    id: "topnav-avatar",
    neighbors: { left: "topnav-login" },
    onSelect: () => setOpen((o) => !o),
  });
  const { focusableProps: loginFocus } = useFocusable({
    id: "topnav-login",
    neighbors: { right: "topnav-avatar" },
    onSelect: () => navigate("/login"),
  });

  useEffect(() => {
    function onDocClick(e) {
      if (!open) return;
      const t = e.target;
      if (t && btnRef.current && menuRef.current && !btnRef.current.contains(t) && !menuRef.current.contains(t)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link to="/home" className="text-2xl font-extrabold tracking-tight">
          <span className="text-white">My</span>
          <span className="text-ocean-secondary">TV</span>
        </Link>
        <div className="flex items-center gap-3">
          {!isLoggedIn && location.pathname !== "/login" && (
            <Link
              to="/login"
              className="text-sm text-gray-200 hover:text-white rounded-md px-3 py-1.5 focus:outline-none data-[focused=true]:ring-2 data-[focused=true]:ring-amber-400"
              {...loginFocus}
            >
              Login
            </Link>
          )}
          {isLoggedIn && (
            <div className="relative">
              <button
                {...avatarFocus}
                ref={btnRef}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className="h-9 w-9 rounded-full bg-white/15 ring-1 ring-white/10 text-sm text-white/90 flex items-center justify-center hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-amber-400"
                title={sessionUser?.username || "User"}
              >
                {initial}
              </button>
              {open && (
                <div
                  ref={menuRef}
                  role="menu"
                  className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-[color:var(--ocean-surface)]/95 ring-1 ring-white/10 shadow-soft p-1 z-[60]"
                >
                  <div className="px-3 py-2 text-xs text-gray-300 border-b border-white/10">
                    Signed in as <span className="text-white">{sessionUser?.username}</span>
                  </div>
                  <button
                    role="menuitem"
                    className="w-full text-left rounded px-3 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    onClick={() => {
                      clearSession();
                      setOpen(false);
                      navigate("/login", { replace: true });
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
