import { useState, useCallback, useEffect } from "react";

const GUEST_NAME_KEY = "guestName";

export function useGuestName(): [string, (name: string) => void] {
  const [name, setNameState] = useState<string>(
    () => localStorage.getItem(GUEST_NAME_KEY) ?? ""
  );

  const setName = useCallback((newName: string) => {
    const trimmed = newName.trim();
    setNameState(trimmed);
    if (trimmed) {
      localStorage.setItem(GUEST_NAME_KEY, trimmed);
    } else {
      localStorage.removeItem(GUEST_NAME_KEY);
    }
  }, []);

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === GUEST_NAME_KEY) {
        setNameState(e.newValue ?? "");
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return [name, setName];
}
