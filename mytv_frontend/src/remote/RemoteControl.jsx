import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFocusManager } from "./focus/FocusContext";
import { getSession } from "../store/userStore";

/**
 * PUBLIC_INTERFACE
 * ACTIONS
 * All normalized remote actions supported by the app.
 */
export const ACTIONS = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
  ENTER: "enter",
  BACK: "back",
  EXIT: "exit",
  INFO: "info",
  MEDIA_PLAY: "mediaPlay",
  MEDIA_PAUSE: "mediaPause",
  MEDIA_STOP: "mediaStop",
  MEDIA_FF: "mediaFastForward",
  MEDIA_RW: "mediaRewind",
  TRACK_NEXT: "mediaTrackNext",
  TRACK_PREV: "mediaTrackPrev",
  COLOR_RED: "colorRed",
  COLOR_GREEN: "colorGreen",
  COLOR_YELLOW: "colorYellow",
  COLOR_BLUE: "colorBlue",
  CHANNEL_UP: "channelUp",
  CHANNEL_DOWN: "channelDown",
  VOLUME_UP: "volumeUp",
  VOLUME_DOWN: "volumeDown",
  VOLUME_MUTE: "volumeMute",
};

/**
 * Map various KeyboardEvent keys and Samsung keyCodes to actions.
 * Includes DOM key names and Tizen keyCodes.
 * PUBLIC_INTERFACE
 * mapEventToAction - export for reuse in tests or advanced consumers if needed.
 */
export function mapEventToAction(e) {
  const key = (e.key || "").toLowerCase();
  const code = e.keyCode || e.which;

  // DOM key names
  if (key === "arrowup") return ACTIONS.UP;
  if (key === "arrowdown") return ACTIONS.DOWN;
  if (key === "arrowleft") return ACTIONS.LEFT;
  if (key === "arrowright") return ACTIONS.RIGHT;
  if (key === "enter") return ACTIONS.ENTER;
  if (key === "escape" || key === "esc" || key === "backspace") return ACTIONS.BACK;

  // Samsung/Tizen numeric codes and media keys
  switch (code) {
    // Navigation
    case 37: return ACTIONS.LEFT;
    case 38: return ACTIONS.UP;
    case 39: return ACTIONS.RIGHT;
    case 40: return ACTIONS.DOWN;
    case 13: return ACTIONS.ENTER;

    // System
    case 10009: return ACTIONS.BACK; // Back
    case 10182: return ACTIONS.EXIT; // Exit

    // Media controls
    case 415: return ACTIONS.MEDIA_PLAY;        // MediaPlay
    case 19:  return ACTIONS.MEDIA_PAUSE;       // MediaPause
    case 413: return ACTIONS.MEDIA_STOP;        // MediaStop
    case 417: return ACTIONS.MEDIA_FF;          // MediaFastForward
    case 412: return ACTIONS.MEDIA_RW;          // MediaRewind

    // Track next/previous
    case 10233: return ACTIONS.TRACK_NEXT;      // MediaTrackNext
    case 10232: return ACTIONS.TRACK_PREV;      // MediaTrackPrevious

    // Color keys
    case 403: return ACTIONS.COLOR_RED;         // ColorF0Red
    case 404: return ACTIONS.COLOR_GREEN;       // ColorF1Green
    case 405: return ACTIONS.COLOR_YELLOW;      // ColorF2Yellow
    case 406: return ACTIONS.COLOR_BLUE;        // ColorF3Blue

    // Channel
    case 427: return ACTIONS.CHANNEL_UP;        // ChannelUp
    case 428: return ACTIONS.CHANNEL_DOWN;      // ChannelDown

    // Volume
    case 447: return ACTIONS.VOLUME_UP;         // VolumeUp
    case 448: return ACTIONS.VOLUME_DOWN;       // VolumeDown
    case 449: return ACTIONS.VOLUME_MUTE;       // VolumeMute

    // Info
    case 457: return ACTIONS.INFO;              // Info

    default:
      break;
  }
  return null;
}

/**
 * Determine if the target is a typing field (input/textarea/contenteditable).
 */
function isTypingTarget(target) {
  const tag = target?.tagName ? String(target.tagName).toLowerCase() : "";
  if (tag === "input" || tag === "textarea") return true;
  // ContentEditable
  const ce = target?.getAttribute?.("contenteditable");
  if (ce && ce !== "false") return true;
  return false;
}

const RemoteControlContext = createContext(null);

/**
 * PUBLIC_INTERFACE
 * RemoteControlProvider
 * Provides remote control action dispatching and a subscription hook for components.
 * Also renders a small Info overlay toggle when INFO key is hit.
 *
 * How to use on any screen:
 * - Call useRemoteControl((action, e) => { ...; return true if handled; });
 * - Prevent default on handled keys by returning true; provider will do e.preventDefault() for you.
 * - For Back key override (e.g., close a modal), intercept "__internal_back_intercept" and return true to consume.
 * - Media keys are passed through (no-op by default) unless your page handles them.
 */
export function RemoteControlProvider({ children }) {
  const handlersRef = useRef(new Set()); // set of handler functions (action, event) => boolean | void
  const [showInfo, setShowInfo] = useState(() => {
    // Optional debug overlay controlled via env feature flag
    try {
      return String(process.env.REACT_APP_FEATURE_FLAGS || "").split(",").includes("REMOTE_KEYS_DEBUG");
    } catch {
      return false;
    }
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { moveFocus, select, back } = useFocusManager();

  const isAuthenticated = !!getSession();

  const registerHandler = useCallback((fn) => {
    if (typeof fn !== "function") return () => {};
    handlersRef.current.add(fn);
    return () => {
      handlersRef.current.delete(fn);
    };
  }, []);

  const dispatchAction = useCallback((action, event) => {
    // Chain to subscribers; if any returns true, consider handled
    let handled = false;
    handlersRef.current.forEach((fn) => {
      try {
        const res = fn(action, event);
        if (res === true) handled = true;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Remote handler error:", e);
      }
    });
    return handled;
  }, []);

  // Default bindings
  const handleDefault = useCallback((action, e) => {
    let handled = false;

    if ([ACTIONS.UP, ACTIONS.DOWN, ACTIONS.LEFT, ACTIONS.RIGHT].includes(action)) {
      moveFocus(action);
      handled = true;
    } else if (action === ACTIONS.ENTER) {
      select();
      handled = true;
    } else if (action === ACTIONS.BACK) {
      const userHandled = dispatchAction("__internal_back_intercept", e) === true;
      if (userHandled) return true;

      if (!isAuthenticated) {
        if (location.pathname !== "/login") {
          navigate("/login", { replace: true });
          handled = true;
        } else {
          if (window.history.length > 1) {
            back();
          } else {
            navigate("/home", { replace: true });
          }
          handled = true;
        }
      } else {
        if (window.history.length > 1) {
          back();
        } else {
          navigate("/home", { replace: true });
        }
        handled = true;
      }
    } else if (action === ACTIONS.EXIT) {
      navigate("/", { replace: true });
      handled = true;
    } else if (action === ACTIONS.INFO) {
      setShowInfo((v) => !v);
      handled = true;
    } else if (
      action === ACTIONS.MEDIA_PLAY ||
      action === ACTIONS.MEDIA_PAUSE ||
      action === ACTIONS.MEDIA_STOP ||
      action === ACTIONS.MEDIA_FF ||
      action === ACTIONS.MEDIA_RW ||
      action === ACTIONS.TRACK_NEXT ||
      action === ACTIONS.TRACK_PREV ||
      action === ACTIONS.COLOR_RED ||
      action === ACTIONS.COLOR_GREEN ||
      action === ACTIONS.COLOR_YELLOW ||
      action === ACTIONS.COLOR_BLUE ||
      action === ACTIONS.CHANNEL_UP ||
      action === ACTIONS.CHANNEL_DOWN ||
      action === ACTIONS.VOLUME_UP ||
      action === ACTIONS.VOLUME_DOWN ||
      action === ACTIONS.VOLUME_MUTE
    ) {
      handled = false;
    }

    return handled;
  }, [moveFocus, select, back, navigate, location.pathname, isAuthenticated, dispatchAction]);

  // Keydown listener: normalize -> subscribers -> default
  useEffect(() => {
    function onKeyDown(e) {
      const action = mapEventToAction(e);
      if (!action) return;

      const typing = isTypingTarget(e.target);

      // When typing inside inputs/textareas/contenteditable, do not hijack typical editing keys:
      // - Arrow keys should move the caret
      // - Enter should submit or insert newline based on form semantics
      // - Backspace/Escape should not be remapped to BACK
      if (typing) {
        if (
          action === ACTIONS.UP ||
          action === ACTIONS.DOWN ||
          action === ACTIONS.LEFT ||
          action === ACTIONS.RIGHT ||
          action === ACTIONS.ENTER ||
          action === ACTIONS.BACK
        ) {
          // Let the browser/input handle these; do not propagate to remote handlers.
          return;
        }
      } else {
        // Not typing: prevent default page scroll for arrow navigation so remote navigation feels native
        if ([ACTIONS.UP, ACTIONS.DOWN, ACTIONS.LEFT, ACTIONS.RIGHT].includes(action)) {
          e.preventDefault?.();
        }
      }

      const subHandled = dispatchAction(action, e);
      if (subHandled) {
        e.preventDefault?.();
        e.stopPropagation?.();
        return;
      }

      const defHandled = handleDefault(action, e);
      if (defHandled) {
        e.preventDefault?.();
        e.stopPropagation?.();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatchAction, handleDefault]);

  const value = useMemo(() => ({
    registerHandler,
    dispatchAction,
  }), [registerHandler, dispatchAction]);

  return (
    <RemoteControlContext.Provider value={value}>
      {children}
      {showInfo && <RemoteInfoOverlay onClose={() => setShowInfo(false)} />}
    </RemoteControlContext.Provider>
  );
}

/**
 * PUBLIC_INTERFACE
 * useRemoteControl
 * Subscribe to remote actions. Return an unregister function on unmount automatically.
 * Example:
 *   useRemoteControl((action, e) => {
 *     if (action === ACTIONS.COLOR_RED) { ...; return true; }
 *   });
 */
export function useRemoteControl(callback) {
  const ctx = useContext(RemoteControlContext);
  useEffect(() => {
    if (!ctx || typeof callback !== "function") return;
    return ctx.registerHandler(callback);
  }, [ctx, callback]);
  return ctx;
}

/**
 * Small overlay that lists key mappings for help (toggle via Info key).
 * Appears only when REACT_APP_FEATURE_FLAGS includes REMOTE_KEYS_DEBUG or when toggled via Info key.
 */
function RemoteInfoOverlay({ onClose }) {
  return (
    <div
      role="dialog"
      aria-label="Remote key help"
      className="fixed bottom-4 right-4 z-[200] max-w-sm rounded-lg bg-black/80 text-white ring-1 ring-white/10 backdrop-blur px-3 py-2 text-xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-sm mb-1">Remote Key Help</div>
          <ul className="space-y-0.5">
            <li>Up/Down/Left/Right (38/40/37/39) — Navigate</li>
            <li>Enter (13) — Select / Click</li>
            <li>Back (10009/Escape/Backspace) — Back</li>
            <li>Exit (10182) — Go to Splash</li>
            <li>Info (457) — Toggle this help</li>
            <li>Media: Play(415), Pause(19), Stop(413), FF(417), RW(412)</li>
            <li>Track: Next(10233), Prev(10232)</li>
            <li>Color: Red(403), Green(404), Yellow(405), Blue(406)</li>
            <li>Channel: Up(427), Down(428)</li>
            <li>Volume: Up(447), Down(448), Mute(449)</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 rounded bg-white/10 px-2 py-1 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          Close
        </button>
      </div>
    </div>
  );
}
