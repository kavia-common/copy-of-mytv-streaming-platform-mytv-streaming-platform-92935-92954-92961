import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import TopNav from "../components/TopNav";
import { createSession, getSession } from "../store/userStore";
import { useFocusable, useFocusManager } from "../remote/focus/FocusContext";
import { ACTIONS, useRemoteControl } from "../remote/RemoteControl";

/**
 * PUBLIC_INTERFACE
 * Login
 * Email + password login form styled with Ocean Professional.
 * Client-side validation, loading state, and navigation on success.
 */
export default function Login() {
  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { setFocus } = useFocusManager();

  // Redirect if already logged in
  useEffect(() => {
    const sess = getSession();
    if (sess?.username) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Simple email format check
  const isValidEmail = (val) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val).toLowerCase());

  const validate = () => {
    const next = { email: "", password: "" };
    if (!email || !isValidEmail(email)) {
      next.email = "Please enter a valid email address.";
    }
    if (!password) {
      next.password = "Password cannot be empty.";
    }
    setErrors(next);
    return !next.email && !next.password;
  };

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Mock a short delay and success; map email to username for session
      await new Promise((r) => setTimeout(r, 700));
      const usernameFromEmail = email.split("@")[0] || "user";
      createSession(usernameFromEmail);
      navigate("/", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  // Focus management for TV/keyboard users
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const submitRef = useRef(null);

  const { focusableProps: emailFocus } = useFocusable({
    id: "login-email",
    neighbors: { down: "login-password" },
    onSelect: () => emailRef.current?.focus?.(),
    defaultFocused: true,
  });
  const { focusableProps: passwordFocus } = useFocusable({
    id: "login-password",
    neighbors: { up: "login-email", down: "login-submit" },
    onSelect: () => passwordRef.current?.focus?.(),
  });
  const { focusableProps: submitFocus } = useFocusable({
    id: "login-submit",
    neighbors: { up: "login-password" },
    onSelect: onSubmit,
  });

  useEffect(() => {
    const t = setTimeout(() => setFocus("login-email"), 50);
    return () => clearTimeout(t);
  }, [setFocus]);

  // Remote: Enter submits; Exit goes to splash
  useRemoteControl((action) => {
    if (action === ACTIONS.ENTER) {
      onSubmit({ preventDefault: () => {} });
      return true;
    }
    if (action === ACTIONS.EXIT) {
      navigate("/", { replace: true });
      return true;
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-[color:var(--ocean-bg)] flex flex-col">
      <TopNav />
      <main className="pt-20 md:pt-24 flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl bg-white shadow-xl ring-1 ring-black/5 p-6 md:p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-blue-100">
              📺
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Sign in to MyTV</h1>
            <p className="mt-1 text-sm text-gray-600">
              Welcome back. Please enter your details.
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
            <div {...emailFocus}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((er) => ({ ...er, email: "" }));
                }}
                className={`w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.email ? "border-red-400" : "border-gray-300"
                }`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div {...passwordFocus}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                ref={passwordRef}
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="********"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((er) => ({ ...er, password: "" }));
                }}
                className={`w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.password ? "border-red-400" : "border-gray-300"
                }`}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            <div {...submitFocus}>
              <Button
                ref={submitRef}
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2"
              >
                {submitting && (
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                <span>Sign In</span>
              </Button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link
                to="/forgot-pin"
                className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded px-1"
              >
                Forgot PIN
              </Link>
              <Link
                to="/signup"
                className="text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded px-1"
              >
                Create account
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link to="/home" className="text-xs text-gray-500 hover:text-gray-700">
              Continue as guest
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
