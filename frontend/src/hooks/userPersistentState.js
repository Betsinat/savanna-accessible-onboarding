import { useCallback, useEffect, useRef, useState } from 'react';

export function usePersistentState(key, initialValue, persistenceEnabled = true) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) return JSON.parse(saved);
    } catch (err) {
      console.error(`Error loading local state for ${key}:`, err);
    }

    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
    if (!persistenceEnabled) return;

    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.error(`Error saving local state for ${key}:`, err);
    }
  }, [key, persistenceEnabled, state]);

  const setPersistentState = useCallback((nextState) => {
    const resolvedState =
      typeof nextState === 'function' ? nextState(stateRef.current) : nextState;

    stateRef.current = resolvedState;
    if (persistenceEnabled) {
      try {
        localStorage.setItem(key, JSON.stringify(resolvedState));
      } catch (err) {
        console.error(`Error saving local state for ${key}:`, err);
      }
    }

    setState(() => resolvedState);
  }, [key, persistenceEnabled]);

  return [state, setPersistentState];
}