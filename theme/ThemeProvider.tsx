import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkTheme, LightTheme, type Theme } from "./palette";

type Mode = "light" | "dark" | "system";
type Ctx = { theme: Theme; setMode: (m: Mode) => void; mode: Mode; ready: boolean };

const ThemeCtx = createContext<Ctx | null>(null);
const KEY = "ui-theme-mode"; // light | dark | system

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>("light"); // default light
  const [ready, setReady] = useState(false);
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  // stored mode
  useEffect(() => {
    (async () => {
      try {
        const saved = (await AsyncStorage.getItem(KEY)) as Mode | null;
        if (saved) setModeState(saved);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // system theme changes -> reflect immediately when mode === 'system'
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setSystemScheme(colorScheme));
    return () => sub.remove();
  }, []);

  const theme = useMemo<Theme>(() => {
    const effective = mode === "system" ? (systemScheme ?? "light") : mode;
    return effective === "dark" ? DarkTheme : LightTheme;
  }, [mode, systemScheme]);

  const setMode: Ctx["setMode"] = (next) => {
    setModeState(next);
    AsyncStorage.setItem(KEY, next).catch(() => {});
  };

  const value = useMemo(() => ({ theme, setMode, mode, ready }), [theme, mode, ready]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
