import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}

export type SavedEmail = {
  id: string;
  createdAt: number;
  title: string;
  subject: string;
  body: string;
  tone: string;
  mode: string;
};

export type ChatSession = {
  id: string;
  createdAt: number;
  title: string;
  messages: unknown[];
};
