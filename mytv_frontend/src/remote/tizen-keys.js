 /**
  * PUBLIC_INTERFACE
  * getKeyFromEvent
  * Normalizes KeyboardEvent into logical actions: up, down, left, right, enter, back.
  * Supports web keys and Tizen/Samsung TV key codes (e.g., 37-40, 13, 10009).
  */
export function getKeyFromEvent(e) {
  // Prefer standardized key first
  const key = (e.key || "").toLowerCase();

  // Map by key
  if (key === "arrowup") return "up";
  if (key === "arrowdown") return "down";
  if (key === "arrowleft") return "left";
  if (key === "arrowright") return "right";
  if (key === "enter") return "enter";
  if (key === "escape" || key === "esc") return "back";
  if (key === "backspace") return "back";

  // Fallback by keyCode (legacy + Tizen specific)
  const code = e.keyCode || e.which;

  switch (code) {
    case 37:
      return "left";
    case 38:
      return "up";
    case 39:
      return "right";
    case 40:
      return "down";
    case 13: // Enter/OK
      return "enter";
    case 10009: // Tizen back key code
      return "back";
    default:
      return null;
  }
}

/**
 * PUBLIC_INTERFACE
 * isTizen
 * Detects if running on Tizen environment.
 */
export function isTizen() {
  try {
    return typeof window !== "undefined" && typeof window.tizen !== "undefined";
  } catch {
    return false;
  }
}
