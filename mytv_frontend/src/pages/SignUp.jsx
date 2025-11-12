import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";
import Button from "../components/Button";
import { useFocusable, useFocusManager } from "../remote/focus/FocusContext";
import { findUser, upsertUser, generatePin, createSession } from "../store/userStore";

/**
 * PUBLIC_INTERFACE
 * SignUp
 * Username, Password, Confirm Password, and Mobile Number.
 * Generates a 4-digit PIN and saves alongside password and phone.
 * On success, auto logs in and redirects to /home.
 */
export default function SignUp() {
  const [username, setUsername] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const navigate = useNavigate();
  const { setFocus } = useFocusManager();

  const uRef = useRef(null);
  const pRef = useRef(null);
  const cRef = useRef(null);
  const phRef = useRef(null);

  const { focusableProps: uFocus } = useFocusable({
    id: "signup-username",
    neighbors: { down: "signup-password" },
    onSelect: () => uRef.current?.focus?.(),
    defaultFocused: true,
  });
  const { focusableProps: pFocus } = useFocusable({
    id: "signup-password",
    neighbors: { up: "signup-username", down: "signup-confirm" },
    onSelect: () => pRef.current?.focus?.(),
  });
  const { focusableProps: cFocus } = useFocusable({
    id: "signup-confirm",
    neighbors: { up: "signup-password", down: "signup-phone" },
    onSelect: () => cRef.current?.focus?.(),
  });
  const { focusableProps: phFocus } = useFocusable({
    id: "signup-phone",
    neighbors: { up: "signup-confirm", down: "signup-submit" },
    onSelect: () => phRef.current?.focus?.(),
  });
  const { focusableProps: sFocus } = useFocusable({
    id: "signup-submit",
    neighbors: { up: "signup-phone" },
    onSelect: () => onSubmit({ preventDefault: () => {} }),
  });

  useEffect(() => {
    const t = setTimeout(() => setFocus("signup-username"), 0);
    return () => clearTimeout(t);
  }, [setFocus]);

  function onSubmit(e) {
    e.preventDefault?.();
    setError("");
    setInfo("");

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }
    if (findUser(username)) {
      setError("Username already exists.");
      return;
    }
    if (!pwd || pwd.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (pwd !== confirmPwd) {
      setError("Passwords do not match.");
      return;
    }
    if (!phone || !/^\+?[0-9]{7,15}$/.test(phone.replace(/\s|-/g, ""))) {
      setError("Please enter a valid mobile number.");
      return;
    }

    const pin = generatePin();
    upsertUser({ username, password: pwd, phone, pin });
    setInfo(`Account created. Your PIN is ${pin}. You'll be signed in now.`);
    createSession(username);
    setTimeout(() => navigate("/home", { replace: true }), 600);
  }

  return (
    <div className="min-h-screen bg-[color:var(--ocean-bg)] flex flex-col">
      <TopNav />
      <main className="pt-20 md:pt-24 flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl bg-[color:var(--ocean-surface)]/80 p-6 md:p-8 ring-1 ring-white/10 shadow-soft">
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="mt-1 text-sm text-gray-300">Sign up for MyTV</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div {...uFocus}>
              <label htmlFor="su-username" className="block text-sm text-gray-300 mb-1">
                Username
              </label>
              <input
                ref={uRef}
                id="su-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="Choose a username"
                required
              />
            </div>
            <div {...pFocus}>
              <label htmlFor="su-password" className="block text-sm text-gray-300 mb-1">
                Password
              </label>
              <input
                ref={pRef}
                id="su-password"
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="••••••••"
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>
            <div {...cFocus}>
              <label htmlFor="su-confirm" className="block text-sm text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                ref={cRef}
                id="su-confirm"
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="••••••••"
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>
            <div {...phFocus}>
              <label htmlFor="su-phone" className="block text-sm text-gray-300 mb-1">
                Mobile Number
              </label>
              <input
                ref={phRef}
                id="su-phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="+1234567890"
                required
              />
            </div>

            {error && <div className="rounded-md bg-red-500/10 p-2 text-sm text-red-400">{error}</div>}
            {info && <div className="rounded-md bg-white/5 p-2 text-sm text-gray-200 ring-1 ring-white/10">{info}</div>}

            <div {...sFocus}>
              <Button type="submit" className="w-full">Create Account</Button>
            </div>
          </form>

          <div className="mt-4">
            <Button variant="ghost" className="w-full" onClick={() => navigate("/login")}>
              Back to Login
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
