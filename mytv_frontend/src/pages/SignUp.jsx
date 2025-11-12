import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav";
import Button from "../components/Button";
import { useFocusable, useFocusManager } from "../remote/focus/FocusContext";
import { findUser, upsertUser, createSession } from "../store/userStore";
import VirtualKeyboard from "../components/VirtualKeyboard";
import { ACTIONS, useRemoteControl } from "../remote/RemoteControl";

/**
 * PUBLIC_INTERFACE
 * SignUp
 * Username, 4-digit PIN, Confirm PIN, and Mobile Number.
 * Validates PIN format and match; persists to localStorage. Auto logs in.
 */
export default function SignUp() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [activeField, setActiveField] = useState("username"); // 'username' | 'pin' | 'confirm' | 'phone'
  const navigate = useNavigate();
  const { setFocus } = useFocusManager();

  // Intercept Back to jump from keyboard to the active input before leaving page
  useRemoteControl((action) => {
    if (action === "__internal_back_intercept") {
      const id =
        activeField === "username"
          ? "signup-username"
          : activeField === "pin"
          ? "signup-pin"
          : activeField === "confirm"
          ? "signup-confirm"
          : "signup-phone";
      setFocus(id);
      return true;
    }
    return false;
  });

  const uRef = useRef(null);
  const pRef = useRef(null);
  const cRef = useRef(null);
  const phRef = useRef(null);

  const { focusableProps: uFocus } = useFocusable({
    id: "signup-username",
    neighbors: { down: "signup-pin", right: "vk-username-r0-c0" },
    onSelect: () => {
      setActiveField("username");
      uRef.current?.focus?.();
    },
    defaultFocused: true,
  });
  const { focusableProps: pFocus } = useFocusable({
    id: "signup-pin",
    neighbors: { up: "signup-username", down: "signup-confirm", right: "vk-pin-r0-c0" },
    onSelect: () => {
      setActiveField("pin");
      pRef.current?.focus?.();
    },
  });
  const { focusableProps: cFocus } = useFocusable({
    id: "signup-confirm",
    neighbors: { up: "signup-pin", down: "signup-phone", right: "vk-confirm-r0-c0" },
    onSelect: () => {
      setActiveField("confirm");
      cRef.current?.focus?.();
    },
  });
  const { focusableProps: phFocus } = useFocusable({
    id: "signup-phone",
    neighbors: { up: "signup-confirm", down: "signup-submit" },
    onSelect: () => {
      setActiveField("phone");
      phRef.current?.focus?.();
    },
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

  // Prevent page scroll on arrows, Exit -> root; other keys use provider defaults
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
    if (!/^\d{4}$/.test(pin)) {
      setError("PIN must be exactly 4 digits.");
      return;
    }
    if (pin !== confirmPin) {
      setError("PIN and Confirm PIN do not match.");
      return;
    }
    if (!phone || !/^\+?[0-9]{7,15}$/.test(phone.replace(/\s|-/g, ""))) {
      setError("Please enter a valid mobile number.");
      return;
    }

    upsertUser({ username, pin, phone });
    setInfo("Account created successfully. Signing you in…");
    createSession(username);
    setTimeout(() => navigate("/home", { replace: true }), 600);
  }

  // Virtual keyboard handlers using new onKeyPress API
  const handleUsernameKey = (valOrMeta) => {
    const isMeta = typeof valOrMeta === "object" && valOrMeta && valOrMeta.action;
    if (!isMeta) {
      const ch = String(valOrMeta || "");
      setUsername((prev) => (prev + ch).slice(0, 64));
      return;
    }
    const action = valOrMeta.action;
    if (action === "backspace") setUsername((prev) => prev.slice(0, -1));
    else if (action === "clear") setUsername("");
    else if (action === "space") setUsername((prev) => (prev + " ").slice(0, 64));
    else if (action === "done") {
      setActiveField("pin");
      setFocus("signup-pin");
      pRef.current?.focus?.();
    }
  };

  const handlePinKey = (valOrMeta) => {
    const isMeta = typeof valOrMeta === "object" && valOrMeta && valOrMeta.action;
    if (!isMeta) {
      const k = String(valOrMeta || "");
      if (!/^\d$/.test(k)) return;

      const next = (pin + k).slice(0, 4);
      if (pin.length >= 4) {
        if (!error) setError("PIN must be exactly 4 digits.");
        return;
      }
      setPin(next);
      if (error && next.length <= 4) setError("");

      // If becomes 4, move to Confirm
      if (next.length === 4) {
        setActiveField("confirm");
        setFocus("signup-confirm");
        cRef.current?.focus?.();
      }
      return;
    }
    const action = valOrMeta.action;
    if (action === "backspace") {
      const next = pin.slice(0, -1);
      setPin(next);
      if (next.length <= 4) setError("");
    } else if (action === "clear") {
      setPin("");
      setError("");
    } else if (action === "done") {
      // Move on only if 4 digits
      if (pin.length === 4) {
        setActiveField("confirm");
        setFocus("signup-confirm");
        cRef.current?.focus?.();
      } else {
        setError("PIN must be exactly 4 digits.");
      }
    } else if (action === "space") {
      // ignore
    }
  };

  const handleConfirmKey = (valOrMeta) => {
    const isMeta = typeof valOrMeta === "object" && valOrMeta && valOrMeta.action;
    if (!isMeta) {
      const k = String(valOrMeta || "");
      if (!/^\d$/.test(k)) return;

      const next = (confirmPin + k).slice(0, 4);
      if (confirmPin.length >= 4) {
        if (!error) setError("PIN must be exactly 4 digits.");
        return;
      }
      setConfirmPin(next);
      if (error && next.length <= 4) setError("");

      // If reaches 4 and matches PIN, proceed to phone; otherwise show mismatch
      if (next.length === 4) {
        if (next !== pin) {
          setError("PIN and Confirm PIN do not match.");
        } else {
          setError("");
          setActiveField("phone");
          setFocus("signup-phone");
          phRef.current?.focus?.();
        }
      }
      return;
    }

    const action = valOrMeta.action;
    if (action === "backspace") {
      const next = confirmPin.slice(0, -1);
      setConfirmPin(next);
      if (next.length <= 4) setError("");
    } else if (action === "clear") {
      setConfirmPin("");
      setError("");
    } else if (action === "done") {
      if (confirmPin.length === 4 && confirmPin === pin) {
        setActiveField("phone");
        setFocus("signup-phone");
        phRef.current?.focus?.();
      } else if (confirmPin.length !== 4) {
        setError("PIN must be exactly 4 digits.");
      } else {
        setError("PIN and Confirm PIN do not match.");
      }
    } else if (action === "space") {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--ocean-bg)] flex flex-col">
      <TopNav />
      <main className="pt-20 md:pt-24 flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl rounded-xl bg-[color:var(--ocean-surface)]/80 p-6 md:p-8 ring-1 ring-white/10 shadow-soft">
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
                onFocus={() => setActiveField("username")}
                className={`w-full rounded-md border ${activeField === "username" ? "border-blue-500" : "border-white/10"} bg-black/50 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none`}
                placeholder="Choose a username"
                required
              />
            </div>
            <div {...pFocus}>
              <label htmlFor="su-pin" className="block text-sm text-gray-300 mb-1">
                4-digit PIN
              </label>
              <input
                ref={pRef}
                id="su-pin"
                type="password"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                onFocus={() => setActiveField("pin")}
                className={`w-full tracking-widest rounded-md border ${activeField === "pin" ? "border-blue-500" : "border-white/10"} bg-black/50 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none`}
                placeholder="••••"
                required
              />
            </div>
            <div {...cFocus}>
              <label htmlFor="su-confirm" className="block text-sm text-gray-300 mb-1">
                Confirm PIN
              </label>
              <input
                ref={cRef}
                id="su-confirm"
                type="password"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                onFocus={() => setActiveField("confirm")}
                className={`w-full tracking-widest rounded-md border ${activeField === "confirm" ? "border-blue-500" : "border-white/10"} bg-black/50 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none`}
                placeholder="••••"
                required
              />
              {confirmPin && pin && confirmPin !== pin && (
                <div className="mt-1 text-xs text-red-400">PINs do not match.</div>
              )}
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
                onFocus={() => setActiveField("phone")}
                className={`w-full rounded-md border ${activeField === "phone" ? "border-blue-500" : "border-white/10"} bg-black/50 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none`}
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

          {/* Virtual keyboards: keep target input sticky while navigating the keyboard rows */}
          <div className="mt-6">
            {activeField === "username" && (
              <VirtualKeyboard
                idBase="vk-username"
                mode="alphanumeric"
                onKeyPress={handleUsernameKey}
                onDone={() => {
                  setActiveField("pin");
                  setFocus("signup-pin");
                  pRef.current?.focus?.();
                }}
              />
            )}
            {activeField === "pin" && (
              <VirtualKeyboard
                idBase="vk-pin"
                mode="numeric"
                onKeyPress={handlePinKey}
                onDone={() => {
                  setActiveField("confirm");
                  setFocus("signup-confirm");
                  cRef.current?.focus?.();
                }}
              />
            )}
            {activeField === "confirm" && (
              <VirtualKeyboard
                idBase="vk-confirm"
                mode="numeric"
                onKeyPress={handleConfirmKey}
                onDone={() => {
                  setActiveField("phone");
                  setFocus("signup-phone");
                  phRef.current?.focus?.();
                }}
              />
            )}
          </div>

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
