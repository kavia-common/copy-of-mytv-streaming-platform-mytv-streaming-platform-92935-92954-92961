import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useFocusable } from "../remote/focus/FocusContext";

/**
 * PUBLIC_INTERFACE
 * Login
 * Email/password form with basic inline validation. No real auth yet.
 * TV remote support: up/down to switch between fields and button, enter to activate.
 * Netflix-like dark centered card with Ocean Professional accents.
 */
export default function Login() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function validate() {
    if (!email || !/^[^\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!pwd || pwd.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    setError("");
    return true;
  }

  function onSubmit(e) {
    e.preventDefault?.();
    if (validate()) {
      navigate("/home");
    }
  }

  const emailRef = useRef(null);
  const pwdRef = useRef(null);

  // Focusable wrappers around inputs and button for TV remote navigation
  const { focusableProps: emailFocus } = useFocusable({
    id: "login-email",
    neighbors: { down: "login-password" },
    onSelect: () => {
      emailRef.current?.focus?.();
    },
    defaultFocused: true,
  });

  const { focusableProps: pwdFocus } = useFocusable({
    id: "login-password",
    neighbors: { up: "login-email", down: "login-submit" },
    onSelect: () => {
      pwdRef.current?.focus?.();
    },
  });

  const { focusableProps: submitFocus } = useFocusable({
    id: "login-submit",
    neighbors: { up: "login-password" },
    onSelect: () => {
      onSubmit({ preventDefault: () => {} });
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--ocean-bg)]">
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-xl bg-[color:var(--ocean-surface)]/80 p-8 shadow-soft backdrop-blur">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white">
              Sign In to <span className="text-ocean-secondary">MyTV</span>
            </h1>
            <p className="mt-1 text-sm text-gray-300">Continue watching your favorites</p>
          </div>
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div {...emailFocus}>
              <label htmlFor="email" className="block text-sm text-gray-300 mb-1">
                Email
              </label>
              <input
                ref={emailRef}
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
            <div {...pwdFocus}>
              <label htmlFor="password" className="block text-sm text-gray-300 mb-1">
                Password
              </label>
              <input
                ref={pwdRef}
                id="password"
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            {error && <div className="rounded-md bg-red-500/10 p-2 text-sm text-red-300">{error}</div>}
            <div {...submitFocus}>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm text-gray-300">
            New to MyTV?{" "}
            <a href="#" className="text-white hover:underline">
              Sign up now
            </a>
          </div>
          <div className="mt-3 text-center">
            <Link to="/home" className="text-xs text-gray-400 hover:text-gray-200">
              Continue as guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
