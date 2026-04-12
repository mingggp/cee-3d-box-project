import { useState, useCallback } from 'react';

export function useHistory(initialState) {
  const [history, setHistory] = useState([initialState]);
  const [pointer, setPointer] = useState(0);

  const setWithHistory = useCallback((newStateOrUpdater) => {
    setHistory((prev) => {
      const currentState = prev[pointer];
      // Resolve the new state
      const newState = typeof newStateOrUpdater === 'function' ? newStateOrUpdater(currentState) : newStateOrUpdater;
      
      // If no change, do nothing (shallow check)
      if (currentState === newState) return prev;
      
      // Cut off future history if we're branching
      const newHistory = prev.slice(0, pointer + 1);
      newHistory.push(newState);
      
      // Limit history size to prevent memory leaks (e.g. max 50 states)
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
         setPointer(newHistory.length - 1);
      }
      return newHistory;
    });
  }, [pointer]);

  const undo = useCallback(() => {
    setPointer((prev) => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      setPointer((p) => Math.min(prev.length - 1, p + 1));
      return prev;
    });
  }, []);

  return [history[pointer], setWithHistory, undo, redo, pointer > 0, pointer < history.length - 1];
}
