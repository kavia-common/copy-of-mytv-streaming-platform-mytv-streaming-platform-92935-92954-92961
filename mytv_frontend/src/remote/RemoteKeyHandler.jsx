import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getKeyFromEvent } from "./tizen-keys";
import { useFocusManager } from "./focus/FocusContext";

/**
 * PUBLIC_INTERFACE
 * RemoteKeyHandler
 * Global keydown handler mapping arrow/select/back to FocusManager.
 * - Arrow keys move focus
 * - Enter triggers select()
 * - Back triggers back() or navigation
 */
export default function RemoteKeyHandler() {
  const { moveFocus, select, back } = useFocusManager();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(e) {
      const logical = getKeyFromEvent(e);
      if (!logical) return;

      // Prevent default scrolling on arrow keys in TV UX
      if (["up", "down", "left", "right"].includes(logical)) {
        e.preventDefault?.();
      }

      switch (logical) {
        case "up":
          moveFocus("up");
          break;
        case "down":
          moveFocus("down");
          break;
        case "left":
          moveFocus("left");
          break;
        case "right":
          moveFocus("right");
          break;
        case "enter":
          select();
          break;
        case "back":
          // Special handling for splash & login
          if (location.pathname === "/login") {
            // Go back to home if possible
            if (window.history.length > 1) {
              back();
            } else {
              navigate("/home", { replace: true });
            }
          } else if (location.pathname === "/home") {
            // From home, back might return to splash if possible
            if (window.history.length > 1) {
              back();
            }
          } else {
            back();
          }
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [moveFocus, select, back, location.pathname, navigate]);

  return null;
}
