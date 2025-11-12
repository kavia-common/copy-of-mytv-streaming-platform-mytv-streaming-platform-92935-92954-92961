import React, { useEffect, useMemo, useRef } from "react";
import { useFocusable, useFocusManager } from "../remote/focus/FocusContext";

/**
 * PUBLIC_INTERFACE
 * VirtualKeyboard
 * TV-friendly on-screen keyboard with D-pad focusable keys.
 * Props:
 * - idBase: base id for focusable keys (string)
 * - mode: 'alphanumeric' | 'numeric'
 * - onKey: (value: string | { action: 'backspace'|'clear'|'space'|'done' }) => void
 * - onDone: () => void
 * - rows: optional custom rows (array of arrays of key strings); when provided, overrides default rows
 * - defaultFocused: boolean, focus the keyboard container by default
 *
 * Special keys recognized (string values):
 *  - "⌫" => Backspace
 *  - "Clear"
 *  - "Space"
 *  - "Done"
 */
export default function VirtualKeyboard({
  idBase = "vk",
  mode = "alphanumeric",
  onKey,
  onDone,
  rows,
  defaultFocused = false,
}) {
  // Build default rows
  const defaultRows = useMemo(() => {
    if (mode === "numeric") {
      // Numeric keypad layout with Done row
      return [
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
        ["⌫", "0", "Clear"],
        ["Done"],
      ];
    }
    // Alphanumeric: QWERTY style + digits
    return [
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
      ["z", "x", "c", "v", "b", "n", "m"],
      ["Space", "⌫", "Clear", "Done"],
    ];
  }, [mode]);

  const keysRows = rows || defaultRows;

  // Generate stable key ids and neighbor map IDs for D-pad navigation
  const keyIds = useMemo(() => {
    return keysRows.map((row, rIdx) => row.map((_, cIdx) => `${idBase}-r${rIdx}-c${cIdx}`));
  }, [keysRows, idBase]);

  const { setFocus } = useFocusManager();
  const gridRef = useRef(null);

  useEffect(() => {
    if (defaultFocused && keyIds[0]?.[0]) {
      const t = setTimeout(() => setFocus(keyIds[0][0]), 0);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [defaultFocused, keyIds, setFocus]);

  function emitKey(label) {
    const lower = (label || "").toLowerCase();
    if (label === "⌫") {
      onKey?.({ action: "backspace" });
    } else if (lower === "clear") {
      onKey?.({ action: "clear" });
    } else if (lower === "space") {
      onKey?.({ action: "space" });
    } else if (lower === "done") {
      onKey?.({ action: "done" });
      onDone?.();
    } else {
      onKey?.(label);
    }
  }

  return (
    <div
      ref={gridRef}
      className="mt-4 select-none"
      role="group"
      aria-label="On-screen keyboard"
    >
      <div className="inline-flex flex-col gap-2 p-2 rounded-xl bg-black/40 ring-1 ring-white/10">
        {keysRows.map((row, rIdx) => (
          <div key={`row-${rIdx}`} className="flex gap-2 justify-center">
            {row.map((label, cIdx) => {
              const id = keyIds[rIdx][cIdx];
              const up = rIdx > 0 ? keyIds[rIdx - 1][Math.min(cIdx, keyIds[rIdx - 1].length - 1)] : null;
              const down =
                rIdx < keyIds.length - 1
                  ? keyIds[rIdx + 1][Math.min(cIdx, keyIds[rIdx + 1].length - 1)]
                  : null;
              const left = cIdx > 0 ? keyIds[rIdx][cIdx - 1] : null;
              const right = cIdx < keyIds[rIdx].length - 1 ? keyIds[rIdx][cIdx + 1] : null;

              return (
                <FocusableKey
                  key={id}
                  id={id}
                  label={label}
                  neighbors={{ up, down, left, right }}
                  onActivate={() => emitKey(label)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * FocusableKey
 * A single key button that registers with FocusContext and triggers onActivate on select/Enter.
 */
function FocusableKey({ id, label, neighbors, onActivate }) {
  const { focusableProps } = useFocusable({
    id,
    neighbors,
    onSelect: onActivate,
  });

  const isSpecial =
    label === "⌫" ||
    (label || "").toLowerCase() === "clear" ||
    (label || "").toLowerCase() === "space" ||
    (label || "").toLowerCase() === "done";

  const base =
    "min-w-[44px] min-h-[44px] px-3 py-2 rounded-md text-sm md:text-base font-semibold " +
    "bg-white/10 text-gray-100 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 " +
    "data-[focused=true]:ring-2 data-[focused=true]:ring-amber-400";
  const specialClass = isSpecial
    ? (label || "").toLowerCase() === "done"
      ? "bg-ocean-primary hover:bg-blue-600 focus:ring-blue-400"
      : "bg-white/10"
    : "bg-white/10";

  return (
    <button
      {...focusableProps}
      type="button"
      className={`${base} ${specialClass}`}
      aria-label={`Key ${label}`}
    >
      {label === "Space" ? "␣ Space" : label}
    </button>
  );
}
