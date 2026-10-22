"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  APPEARANCE_KEY,
  defaultAppearance,
  readAppearance,
  type Appearance,
} from "@/lib/appearance";
type AppearanceState = Appearance & {
  ready: boolean;
  setAppearance: (next: Partial<Appearance>) => void;
  welcomeVersion: number;
  showWelcome: () => void;
};
const AppearanceContext = createContext<AppearanceState | null>(null);
export function useAppearance() {
  const value = useContext(AppearanceContext);
  if (!value) throw new Error("AppearanceProvider missing");
  return value;
}
export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Appearance>(defaultAppearance);
  const [ready, setReady] = useState(false);
  const [welcomeVersion, setWelcomeVersion] = useState(0);
  useEffect(() => {
    try {
      setPreferences(readAppearance(localStorage.getItem(APPEARANCE_KEY)));
    } catch {
      /* Storage is optional. */
    }
    setReady(true);
    const sync = (event: StorageEvent) => {
      if (event.key === APPEARANCE_KEY)
        setPreferences(readAppearance(event.newValue));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.colorMode = preferences.colorMode;
    root.dataset.designMode = preferences.designMode;
    root.dataset.hero = preferences.hero;
    root.dataset.gallery = preferences.gallery;
    root.dataset.motion = preferences.motion ? "on" : "off";
    root.style.colorScheme = preferences.colorMode;
    if (ready) {
      try {
        localStorage.setItem(APPEARANCE_KEY, JSON.stringify(preferences));
      } catch {
        /* Keep in-session controls working. */
      }
    }
  }, [preferences, ready]);
  return (
    <AppearanceContext.Provider
      value={{
        ...preferences,
        ready,
        setAppearance: (next) =>
          setPreferences((current) => ({ ...current, ...next })),
        welcomeVersion,
        showWelcome: () => {
          setPreferences((current) => ({ ...current, offers: true }));
          setWelcomeVersion((value) => value + 1);
        },
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}
