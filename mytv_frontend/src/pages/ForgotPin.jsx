import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";
import Button from "../components/Button";
import { useFocusable, useFocusManager } from "../remote/focus/FocusContext";
import { findUser } from "../store/userStore";
import { ACTIONS, useRemoteControl } from "../remote/RemoteControl";

/**
 * PUBLIC_INTERFACE
 * ForgotPin
 * Validates username + phone and shows the stored 4-digit PIN on a successful match.
 * Includes Back to Login to return to /login.
 */
export default function ForgotPin() {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [resultPin, setResultPin] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setFocus } = useFocusManager();

  const userRef = useRef(null);
  const phoneRef = useRef(null);

  useRemoteControl((action) => {
    if (action === ACTIONS.BACK) {
      // allow any intercept handler to run first via provider; if it reaches here, go to login
      navigate("/login", { replace: true });
      return true;
    }
    return false;
  });

  const { focusableProps: userFocus } = useFocusable({
    id: "forgot-username",
    neighbors: { down: "forgot-phone" },
    onSelect: () => userRef.current?.focus?.(),
    defaultFocused: true,
  });
  const { focusableProps: phoneFocus } = useFocusable({
    id: "forgot-phone",
    neighbors: { up: "forgot-username", down: "forgot-submit" },
    onSelect: () => phoneRef.current?.focus?.(),
  });
  const { focusableProps: submitFocus } = useFocusable({
    id: "forgot-submit",
    neighbors: { up: "forgot-phone", down: "forgot-back" },
    onSelect: () => onSubmit({ preventDefault: () => {} }),
  });
  const { focusableProps: backFocus } = useFocusable({
    id: "forgot-back",
    neighbors: { up: "forgot-submit" },
    onSelect: () => navigate("/login"),
  });

  useEffect(() => {
    const t = setTimeout(() => setFocus("forgot-username"), 0);
    return () => clearTimeout(t);
  }, [setFocus]);

  // Also prevent default page scroll on arrows; allow provider defaults otherwise.
  useRemoteControl((action, e) => {
    if ([ACTIONS.UP, ACTIONS.DOWN, ACTIONS.LEFT, ACTIONS.RIGHT].includes(action)) {
      e?.preventDefault?.();
      return false;
    }
    if (action === ACTIONS.EXIT) {
      navigate("/", { replace: true });
      e?.preventDefault?.();
      return true;
    }
    return false;
  });

  function onSubmit(e) {
    e.preventDefault?.();
    setResultPin("");
    setError("");

    if (!username) {
      setError("Please enter your username.");
      return;
    }
    if (!phone || !/^\+?[0-9]{7,15}$/.test(phone.replace(/\s|-/g, ""))) {
      setError("Please enter a valid phone number.");
      return;
    }

    const u = findUser(username);
    if (!u || String(u.phone).replace(/\s|-/g, "") !== String(phone).replace(/\s|-/g, "")) {
      setError("No matching user and phone found.");
      return;
    }
    setResultPin(String(u.pin));
  }

  return (
    <div className="min-h-screen bg-[color:var(--ocean-bg)] flex flex-col">
      <TopNav />
      <main className="pt-20 md:pt-24 flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl bg-[color:var(--ocean-surface)]/80 p-6 md:p-8 ring-1 ring-white/10 shadow-soft">
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-bold text-white">Forgot PIN</h1>
            <p className="mt-1 text-sm text-gray-300">Enter your username and phone number</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div {...userFocus}>
              <label htmlFor="f-username" className="block text-sm text-gray-300 mb-1">
                Username
              </label>
              <input
                ref={userRef}
                id="f-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                placeholder="Your username"
                required
              />
            </div>
            <div {...phoneFocus}>
              <label htmlFor="f-phone" className="block text-sm text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                ref={phoneRef}
                id="f-phone"
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

            {resultPin && (
              <div className="rounded-md bg-white/5 ring-1 ring-white/10 p-3 text-center">
                <div className="text-gray-300 text-sm">Your PIN</div>
                <div className="mt-1 text-3xl font-extrabold tracking-widest text-ocean-secondary">{resultPin}</div>
              </div>
            )}

            <div {...submitFocus}>
              <Button type="submit" className="w-full">Show PIN</Button>
            </div>
          </form>

          <div className="mt-4" {...backFocus}>
            <Button variant="ghost" className="w-full" onClick={() => navigate("/login")}>
              Back to Login
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
