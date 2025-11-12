import { useEffect, useRef } from "react";

/**
 * PUBLIC_INTERFACE
 * useRemoteKeys
 * README: Testing with a keyboard
 * - ArrowUp/Down/Left/Right -> navigate (maps keyCodes 38/40/37/39 and keys 'ArrowUp' etc.)
 * - Enter -> select (keyCode 13 or key 'Enter')
 * - Back -> navigate back (keyCode 10009 or key 'Back' or Escape/Backspace)
 * - Exit -> exit (keyCode 10182 or key 'Exit')
 * - Media keys: Play(415/'MediaPlay'), Pause(19/'MediaPause'), Stop(413/'MediaStop'),
 *               Fast Forward(417/'MediaFastForward'), Rewind(412/'MediaRewind'),
 *               Next(10233/'MediaTrackNext'), Previous(10232/'MediaTrackPrevious')
 *
 * Usage:
 *   const lastActionRef = useRef(null);
 *   useRemoteKeys((action, event) => {
 *     // action is one of: 'up','down','left','right','enter','back','exit',
 *     // 'play','pause','stop','ff','rewind','next','prev'
 *     // Return true if handled to prevent default scrolling.
 *   });
 *
 * The hook registers a window 'keydown' listener on mount and cleans up on unmount.
 * It prevents default scrolling for handled navigation keys.
 */

// Canonical action names
export const REMOTE_ACTIONS = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
  ENTER: "enter",
  BACK: "back",
  EXIT: "exit",
  PLAY: "play",
  PAUSE: "pause",
  STOP: "stop",
  FF: "ff",
  REWIND: "rewind",
  NEXT: "next",
  PREV: "prev",
};

// PUBLIC_INTERFACE
export function mapRemoteEventToAction(e) {
  const k = (e?.key || "").toLowerCase();
  const code = e?.keyCode ?? e?.which;

  // DOM key names
  if (k === "arrowup") return REMOTE_ACTIONS.UP;
  if (k === "arrowdown") return REMOTE_ACTIONS.DOWN;
  if (k === "arrowleft") return REMOTE_ACTIONS.LEFT;
  if (k === "arrowright") return REMOTE_ACTIONS.RIGHT;
  if (k === "enter") return REMOTE_ACTIONS.ENTER;

  // Some platforms may report these literal strings
  if (k === "back") return REMOTE_ACTIONS.BACK;
  if (k === "exit") return REMOTE_ACTIONS.EXIT;
  if (k === "mediaplay") return REMOTE_ACTIONS.PLAY;
  if (k === "mediapause") return REMOTE_ACTIONS.PAUSE;
  if (k === "mediastop") return REMOTE_ACTIONS.STOP;
  if (k === "mediafastforward") return REMOTE_ACTIONS.FF;
  if (k === "mediarewind") return REMOTE_ACTIONS.REWIND;
  if (k === "mediatracknext") return REMOTE_ACTIONS.NEXT;
  if (k === "mediatrackprevious") return REMOTE_ACTIONS.PREV;

  // Esc/Backspace behave like back for web fallback
  if (k === "escape" || k === "esc" || k === "backspace") return REMOTE_ACTIONS.BACK;

  // Numeric keyCode mapping (Samsung/Tizen + legacy web)
  switch (code) {
    // Arrows
    case 38: return REMOTE_ACTIONS.UP;
    case 40: return REMOTE_ACTIONS.DOWN;
    case 37: return REMOTE_ACTIONS.LEFT;
    case 39: return REMOTE_ACTIONS.RIGHT;
    // Enter/OK
    case 13: return REMOTE_ACTIONS.ENTER;
    // Return/Back (Tizen)
    case 10009: return REMOTE_ACTIONS.BACK;
    // Exit (Tizen)
    case 10182: return REMOTE_ACTIONS.EXIT;
    // Media
    case 415: return REMOTE_ACTIONS.PLAY;
    case 19:  return REMOTE_ACTIONS.PAUSE;
    case 413: return REMOTE_ACTIONS.STOP;
    case 417: return REMOTE_ACTIONS.FF;
    case 412: return REMOTE_ACTIONS.REWIND;
    // Track next/previous
    case 10233: return REMOTE_ACTIONS.NEXT;
    case 10232: return REMOTE_ACTIONS.PREV;
    default:
      return null;
  }
}

// PUBLIC_INTERFACE
export default function useRemoteKeys(callback) {
  /**
   * Registers a keydown listener and normalizes events to canonical action strings.
   * Returns nothing. Cleanup is handled automatically on unmount.
   */
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    function onKeyDown(e) {
      const action = mapRemoteEventToAction(e);
      if (!action) return;

      // Let consumer decide whether to claim handling.
      const handled = typeof cbRef.current === "function" ? cbRef.current(action, e) : false;
      if (handled) {
        // Prevent default browser actions (like page scroll) for handled keys.
        e.preventDefault?.();
        e.stopPropagation?.();
      } else {
        // Still prevent default scrolling for navigation keys to improve a11y UX.
        if (
          action === REMOTE_ACTIONS.UP ||
          action === REMOTE_ACTIONS.DOWN ||
          action === REMOTE_ACTIONS.LEFT ||
          action === REMOTE_ACTIONS.RIGHT
        ) {
          e.preventDefault?.();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
