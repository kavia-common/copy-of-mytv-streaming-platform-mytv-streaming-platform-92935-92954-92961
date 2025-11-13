import React from "react";

/**
 * PUBLIC_INTERFACE
 * Button
 * A styled button with Ocean Professional accents and accessible label.
 */
export default function Button({ children, className = "", variant = "primary", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400",
    secondary:
      "bg-amber-500 text-slate-900 hover:bg-amber-400 focus:ring-amber-300",
    ghost:
      "bg-white/10 text-gray-100 hover:bg-white/20 focus:ring-white/30",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
