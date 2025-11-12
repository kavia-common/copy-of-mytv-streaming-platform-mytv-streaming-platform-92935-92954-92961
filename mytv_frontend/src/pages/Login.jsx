import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useFocusable, useFocusManager } from "../remote/focus/FocusContext";
import TopNav from "../components/TopNav";
import { validateCredentials, createSession, getSession } from "../store/userStore";
import VirtualKeyboard from "../components/VirtualKeyboard";

/**
 * PUBLIC_INTERFACE
 * Login
 * Username + 4-digit PIN primary login. TV remote friendly with on-screen keyboard for username and PIN.
 * Shows error messages for invalid combinations and links to Forgot Pin and Sign Up.
 */
export default function Login() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [mode, setMode] = useState("pin"); // kept to preserve password toggle UI, but we'll default to pin
  const [error, setError] = useState("");
  const [activeField, setActiveField] = useState("username"); // 'username' | 'pin'
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
    // enforce pin as 4 digits when using PIN mode
    if (activeField === "pin" && pin.length !== 4) {
      setError("PIN must be 4 digits.");
      return;
    }
    const creds = { username, pin };
    const valid = validateCredentials(creds);
    if (!valid) {
      setError("Incorrect username or PIN");
      return;
    }
    setError("");
    createSession(valid.username);
    navigate("/home", { replace: true });
  }

  const userRef = useRef(null);
  const pinRef = useRef(null);
  const submitRef = useRef(null);

  const { focusableProps: userFocus } = useFocusable({
    id: "login-username",
    neighbors: { down: "login-pin", right: "vk-username-r0-c0" },
    onSelect: () => {
      setActiveField("username");
      userRef.current?.focus?.();
    },
    defaultFocused: true,
  });
  const { focusableProps: pinFocus } = useFocusable({
    id: "login-pin",
    neighbors: { up: "login-username", down: "login-submit", right: "vk-pin-r0-c0" },
    onSelect: () => {
      setActiveField("pin");
      pinRef.current?.focus?.();
    },
  });
  const { focusableProps: submitFocus } = useFocusable({
    id: "login-submit",
    neighbors: { up: "login-pin" },
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

  // Keep focus chain consistent
  useEffect(() => {
    const t = setTimeout(() => setFocus("login-username"), 0);
    return () => clearTimeout(t);
  }, [setFocus]);

  // Keyboard handlers
  const handleUsernameKey = (k) => {
    if (typeof k === "string") {
      setUsername((prev) => (prev + k).slice(0, 64));
      return;
    }
    const action = k?.action;
    if (action === "backspace") setUsername((prev) => prev.slice(0, -1));
    else if (action === "clear") setUsername("");
    else if (action === "space") setUsername((prev) => (prev + " ").slice(0, 64));
    else if (action === "done") {
      // move to PIN
      setActiveField("pin");
      setFocus("login-pin");
      pinRef.current?.focus?.();
    }
  };
  const handlePinKey = (k) => {
    if (typeof k === "string") {
      if (!/^\d$/.test(k)) return;
      setPin((prev) => (prev + k).slice(0, 4));
      return;
    }
    const action = k?.action;
    if (action === "backspace") setPin((prev) => prev.slice(0, -1));
    else if (action === "clear") setPin("");
    else if (action === "done") {
      onSubmit({ preventDefault: () => {} });
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--ocean-bg)] flex flex-col">
      <TopNav />
      <main className="pt-20 md:pt-24 flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl rounded-xl bg-[color:var(--ocean-surface)]/80 p-6 md:p-8 ring-1 ring-white/10 shadow-soft">
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
                onFocus={() => setActiveField("username")}
                className={`w-full rounded-md border ${activeField === "username" ? "border-blue-500" : "border-white/10"} bg-black/50 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none`}
                placeholder="Your username"
                autoComplete="username"
                required
              />
            </div>

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
                onFocus={() => setActiveField("pin")}
                className={`w-full tracking-widest rounded-md border ${activeField === "pin" ? "border-blue-500" : "border-white/10"} bg-black/50 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none`}
                placeholder="••••"
                autoComplete="one-time-code"
                required
              />
            </div>

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
                Forgot PIN
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

          {/* Virtual keyboard area: shows alpha for username active, numeric for pin active */}
          <div className="mt-6">
            {activeField === "username" ? (
              <VirtualKeyboard
                idBase="vk-username"
                mode="alphanumeric"
                onKey={handleUsernameKey}
                onDone={() => {
                  setActiveField("pin");
                  setFocus("login-pin");
                  pinRef.current?.focus?.();
                }}
                defaultFocused={false}
              />
            ) : (
              <VirtualKeyboard
                idBase="vk-pin"
                mode="numeric"
                onKey={handlePinKey}
                onDone={() => onSubmit({ preventDefault: () => {} })}
                defaultFocused={false}
              />
            )}
          </div>

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
