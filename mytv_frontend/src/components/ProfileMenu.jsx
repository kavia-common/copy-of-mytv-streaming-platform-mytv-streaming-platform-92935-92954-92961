import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFocusable } from "../remote/focus/FocusContext";

/**
 * PUBLIC_INTERFACE
 * ProfileMenu
 * Avatar button with accessible dropdown menu:
 * - Options: Profile, Accounts, Help Center, Sign out
 * - Keyboard: Enter toggles, ArrowUp/Down cycle, Escape closes, Tab moves naturally
 * - Remote focus: integrates with useFocusable for TV navigation
 */
export default function ProfileMenu({ idBase = "profile" }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const listRef = useRef(null);

  // Focus integration for TV remote: avatar button focusable
  const { focusableProps: avatarFocus } = useFocusable({
    id: `${idBase}-avatar`,
    neighbors: { left: "navbar-login" }, // default left neighbor
    onSelect: () => setOpen((o) => !o),
  });

  const items = [
    { id: "profile", label: "Profile", action: () => navigate("/home#profile") },
    { id: "accounts", label: "Accounts", action: () => navigate("/home#accounts") },
    { id: "help", label: "Help Center", action: () => navigate("/home#help") },
    { id: "signout", label: "Sign out", action: () => navigate("/login") },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  // Close when clicking outside
  useEffect(() => {
    function onDocClick(e) {
      if (!open) return;
      const el = e.target;
      if (
        el &&
        btnRef.current &&
        listRef.current &&
        !btnRef.current.contains(el) &&
        !listRef.current.contains(el)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Keyboard interactions on the button
  function onAvatarKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((o) => !o);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(0);
      listRef.current?.querySelector('button[data-index="0"]')?.focus?.();
    }
  }

  // Keyboard interactions inside the menu
  function onMenuKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      btnRef.current?.focus?.();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (activeIndex + 1) % items.length;
      setActiveIndex(next);
      listRef.current?.querySelector(`button[data-index="${next}"]`)?.focus?.();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (activeIndex - 1 + items.length) % items.length;
      setActiveIndex(prev);
      listRef.current?.querySelector(`button[data-index="${prev}"]`)?.focus?.();
    }
  }

  return (
    <div className="relative">
      <button
        {...avatarFocus}
        ref={btnRef}
        aria-haspopup="menu"
        aria-expanded={open}
        onKeyDown={onAvatarKeyDown}
        onClick={() => setOpen((o) => !o)}
        className="h-8 w-8 rounded bg-white/10 ring-1 ring-white/10 text-sm text-white/90 flex items-center justify-center hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400"
      >
        <span className="sr-only">Open profile menu</span>
        A
      </button>

      {open && (
        <div
          ref={listRef}
          role="menu"
          aria-label="Profile menu"
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-[color:var(--ocean-surface)]/95 ring-1 ring-white/10 shadow-soft p-1 z-50"
        >
          {items.map((item, idx) => (
            <button
              key={item.id}
              data-index={idx}
              role="menuitem"
              tabIndex={0}
              onClick={() => {
                setOpen(false);
                item.action();
              }}
              onFocus={() => setActiveIndex(idx)}
              className={`w-full text-left rounded px-3 py-2 text-sm ${
                activeIndex === idx
                  ? "bg-white/10 text-white"
                  : "text-gray-200 hover:bg-white/10 hover:text-white"
              } focus:outline-none focus:ring-2 focus:ring-amber-400`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
