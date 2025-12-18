import { useState, useEffect, useCallback, useRef } from "react";
import { useBlocker } from "react-router-dom";

export interface UseUnsavedChangesOptions {
  enabled?: boolean;
}

export function useUnsavedChanges<T>(
  initialData: T | null,
  options: UseUnsavedChangesOptions = {}
) {
  const { enabled = true } = options;
  const [currentData, setCurrentData] = useState<T | null>(null);
  const initialDataRef = useRef<T | null>(null);
  const isInitialized = useRef(false);

  // Deep compare to check if data has changed
  const isDirty = enabled &&
    isInitialized.current &&
    currentData !== null &&
    JSON.stringify(currentData) !== JSON.stringify(initialDataRef.current);

  // Set initial data reference when data is first loaded
  const setInitialData = useCallback((data: T) => {
    try {
      initialDataRef.current = JSON.parse(JSON.stringify(data));
      setCurrentData(JSON.parse(JSON.stringify(data)));
      isInitialized.current = true;
    } catch {
      initialDataRef.current = data;
      setCurrentData(data);
      isInitialized.current = true;
    }
  }, []);

  // Reset dirty state (after save) - updates initial ref to match current
  const resetDirty = useCallback(() => {
    if (currentData !== null) {
      try {
        initialDataRef.current = JSON.parse(JSON.stringify(currentData));
      } catch {
        initialDataRef.current = currentData;
      }
    }
  }, [currentData]);

  // Update current data
  const updateData = useCallback((updater: T | ((prev: T | null) => T)) => {
    setCurrentData((prev) => {
      if (typeof updater === "function") {
        return (updater as (prev: T | null) => T)(prev);
      }
      return updater;
    });
  }, []);

  // Browser unload warning
  useEffect(() => {
    if (!isDirty || !enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, enabled]);

  // React Router navigation blocking
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      enabled && isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  return {
    currentData,
    setCurrentData: updateData,
    setInitialData,
    isDirty,
    resetDirty,
    blocker,
  };
}
