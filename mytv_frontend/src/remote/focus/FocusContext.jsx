import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * FocusManagerProvider
 * Provides a context for managing directional focus (TV remote style) across focusable
 * components/pages. Components can register themselves with directional neighbors and
 * an onSelect callback to receive Enter/OK actions.
 */
const FocusContext = createContext(null);

// Track a map of focusable nodes: id -> { id, ref, meta, neighbors, onSelect, onBack }
function useFocusRegistry() {
  const registryRef = useRef(new Map());
  const [currentId, setCurrentId] = useState(null);

  const register = useCallback((node) => {
    if (!node || !node.id) return () => {};
    registryRef.current.set(node.id, node);
    return () => {
      registryRef.current.delete(node.id);
    };
  }, []);

  const getNode = useCallback((id) => {
    if (!id) return null;
    return registryRef.current.get(id) || null;
  }, []);

  const setFocus = useCallback((id) => {
    if (!id) return;
    const node = getNode(id);
    if (!node) return;
    setCurrentId(id);
    // Visual focus effect: add a 'data-focused' attribute so components can style
    // Also shift DOM focus if node.ref exists
    if (node.ref && node.ref.current) {
      try {
        node.ref.current.setAttribute("data-focused", "true");
        node.ref.current.focus?.();
        // ensure scroll into view for horizontal rails
        node.ref.current.scrollIntoView?.({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      } catch (e) {
        // swallow errors safely
      }
    }
  }, [getNode]);

  // whenever focus changes, remove focus attribute on others
  useEffect(() => {
    registryRef.current.forEach((node, id) => {
      if (!node?.ref?.current) return;
      if (id !== currentId) {
        node.ref.current.removeAttribute?.("data-focused");
      } else {
        node.ref.current.setAttribute?.("data-focused", "true");
      }
    });
  }, [currentId]);

  const moveFocus = useCallback((dir) => {
    const node = getNode(currentId);
    if (!node) return;
    const targetId =
      (dir === "left" && node.neighbors?.left) ||
      (dir === "right" && node.neighbors?.right) ||
      (dir === "up" && node.neighbors?.up) ||
      (dir === "down" && node.neighbors?.down) ||
      null;
    if (targetId) {
      setFocus(targetId);
    }
  }, [currentId, getNode, setFocus]);

  const select = useCallback(() => {
    const node = getNode(currentId);
    if (node?.onSelect) {
      node.onSelect();
    } else if (node?.ref?.current) {
      node.ref.current.click?.();
    }
  }, [currentId, getNode]);

  const back = useCallback(() => {
    const node = getNode(currentId);
    if (node?.onBack) {
      node.onBack();
    } else {
      // fallback: history back
      try {
        window.history.back();
      } catch (e) {
        // ignore
      }
    }
  }, [currentId, getNode]);

  return { register, getNode, setFocus, moveFocus, select, back, currentId };
}

// PUBLIC_INTERFACE
export function FocusManagerProvider({ children }) {
  /** Provides Focus API + registry **/
  const registry = useFocusRegistry();

  const value = useMemo(
    () => ({
      register: registry.register,
      setFocus: registry.setFocus,
      moveFocus: registry.moveFocus,
      select: registry.select,
      back: registry.back,
      currentId: registry.currentId,
    }),
    [registry.register, registry.setFocus, registry.moveFocus, registry.select, registry.back, registry.currentId]
  );

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

// PUBLIC_INTERFACE
export function useFocusManager() {
  /** Access focus manager API from components */
  const ctx = useContext(FocusContext);
  if (!ctx) {
    throw new Error("useFocusManager must be used inside FocusManagerProvider");
  }
  return ctx;
}

// PUBLIC_INTERFACE
export function useFocusable({ id, neighbors = {}, onSelect, onBack, defaultFocused = false } = {}) {
  /**
   * Hook for components to register themselves as directionally focusable.
   * Returns a ref and props to spread on the root focusable element.
   */
  const ref = useRef(null);
  const { register, setFocus, currentId } = useFocusManager();

  useEffect(() => {
    if (!id) return;
    const unregister = register({ id, ref, neighbors, onSelect, onBack });
    if (defaultFocused) {
      // Delay to next tick so DOM exists
      const t = setTimeout(() => setFocus(id), 0);
      return () => {
        clearTimeout(t);
        unregister?.();
      };
    }
    return unregister;
  }, [id, neighbors?.left, neighbors?.right, neighbors?.up, neighbors?.down, onSelect, onBack, defaultFocused, register, setFocus]);

  const focused = currentId === id;

  // Roving tabindex: keep only focused item tabbable (tabIndex=0), others -1.
  const focusableProps = {
    ref,
    tabIndex: focused ? 0 : -1,
    "data-focus-id": id || undefined,
    "data-focused": focused ? "true" : undefined,
    className: focused ? "ring-2 ring-amber-400 ring-offset-0 outline-none" : undefined,
    onFocus: () => {
      if (id) setFocus(id);
    },
  };

  return { ref, focused, focusableProps, setFocus };
}
