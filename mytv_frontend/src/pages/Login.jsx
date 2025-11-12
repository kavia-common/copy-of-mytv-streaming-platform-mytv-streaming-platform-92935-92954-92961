import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useFocusable, useFocusManager } from "../remote/focus/FocusContext";
import TopNav from "../components/TopNav";
import { validateCredentials, createSession, getSession } from "../store/userStore";

/**
 * PUBLIC_INTERFACE
 * Login
 * Username + 4-digit PIN primary login (also supports password). TV remote friendly.
 * Shows error messages for invalid combinations and links to Forgot Pin and Sign Up.
 */
export default function Login() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("pin"); // 'pin' | 'password'
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setFocus } = useFocusManager();

  // Redirect to /home if already logged in
  useEffect(() => {
    const sess = getSession();
    if (sess?.username) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  function onSubmit(e) {
    e.preventDefault?.();
    const creds = { username };
    if (mode === "pin") creds.pin = pin;
    else creds.password = password;

    const valid = validateCredentials(creds);
    if (!valid) {
      setError(mode === "pin" ? "Incorrect username or PIN" : "Incorrect username or password");
      return;
    }
    setError("");
    createSession(valid.username);
    navigate("/home", { replace: true });
  }

  const userRef = useRef(null);
  const pinRef = useRef(null);
  const pwdRef = useRef(null);
  const submitRef = useRef(null);

  const { focusableProps: userFocus } = useFocusable({
    id: "login-username",
    neighbors: { down: mode === "pin" ? "login-pin" : "login-password" },
    onSelect: () => userRef.current?.focus?.(),
    defaultFocused: true,
  });
  const { focusableProps: pinFocus } = useFocusable({
    id: "login-pin",
    neighbors: { up: "login-username", down: "login-submit" },
    onSelect: () => pinRef.current?.focus?.(),
  });
  const { focusableProps: pwdFocus } = useFocusable({
    id: "login-password",
    neighbors: { up: "login-username", down: "login-submit" },
    onSelect: () => pwdRef.current?.focus?.(),
  });
  const { focusableProps: submitFocus } = useFocusable({
    id: "login-submit",
    neighbors: { up: mode === "pin" ? "login-pin" : "login-password" },
    onSelect: () => onSubmit({ preventDefault: () => {} }),
  });
  const { focusableProps: forgotFocus } = useFocusable({
    id: "login-forgot",
    neighbors: { up: "login-submit", right: "login-signup" },
    onSelect: () => navigate("/forgot-pin"),
  });
  const { focusableProps: signupFocus } = useFocusable({
    id: "login-signup",
    neighbors: { up: "login-submit", left: "login-forgot" },
    onSelect: () => navigate("/signup"),
  });

  // Keep focus chain consistent when switching mode
  useEffect(() => {
    const t = setTimeout(() => setFocus("login-username"), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div className="min-h-screen bg-[color:var(--ocean-bg)] flex flex-col">
      <TopNav />
      <main className="pt-20 md:pt-24 flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl bg-[color:var(--ocean-surface)]/80 p-6 md:p-8 ring-1 ring-white/10 shadow-soft">
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-300">Sign in with your username and 4-digit PIN</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div {...userFocus}>
              <label htmlFor="username" className="block text-sm text-gray-300 mb-1">
                Username
              </label>
              <input
                ref={userRef}
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="Your username"
                autoComplete="username"
                required
              />
            </div>

            {/* Toggle between PIN and Password input for flexibility */}
            <div className="flex items-center gap-3 text-xs text-gray-300">
              <span>Use:</span>
              <button
                type="button"
                className={`rounded px-2 py-1 ${mode === "pin" ? "bg-ocean-primary text-white" : "bg-white/10 text-gray-200 hover:bg-white/20"}`}
                onClick={() => setMode("pin")}
              >
                PIN
              </button>
              <button
                type="button"
                className={`rounded px-2 py-1 ${mode === "password" ? "bg-ocean-primary text-white" : "bg-white/10 text-gray-200 hover:bg-white/20"}`}
                onClick={() => setMode("password")}
              >
                Password
              </button>
            </div>

            {mode === "pin" ? (
              <div {...pinFocus}>
                <label htmlFor="pin" className="block text-sm text-gray-300 mb-1">
                  4-digit PIN
                </label>
                <input
                  ref={pinRef}
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setPin(v);
                  }}
                  className="w-full tracking-widest rounded-md border border-white/10 bg-black/50 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="••••"
                  autoComplete="one-time-code"
                  required
                />
              </div>
            ) : (
              <div {...pwdFocus}>
                <label htmlFor="password" className="block text-sm text-gray-300 mb-1">
                  Password
                </label>
                <input
                  ref={pwdRef}
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  placeholder="••••••••"
                  minLength={6}
                  autoComplete="current-password"
                  required
                />
              </div>
            )}

            {error && <div className="rounded-md bg-red-500/10 p-2 text-sm text-red-400">{error}</div>}

            <div {...submitFocus}>
              <Button ref={submitRef} type="submit" className="w-full">
                Sign In
              </Button>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-300">
              <Link
                to="/forgot-pin"
                className="text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 rounded px-1"
                {...forgotFocus}
              >
                Forgot Pin
              </Link>
              <Link
                to="/signup"
                className="text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 rounded px-1"
                {...signupFocus}
              >
                Sign Up
              </Link>
            </div>
          </form>

          <div className="mt-4 text-center">
            <Link to="/home" className="text-xs text-gray-400 hover:text-gray-200">
              Continue as guest
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
