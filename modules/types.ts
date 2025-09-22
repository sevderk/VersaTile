import React from "react";
import type { Ionicons } from "@expo/vector-icons";

export type ModuleId =
  | "quickNote" | "checklist" | "linkSaver" | "pomodoro" | "habitStreak"
  | "waterTracker" | "counter" | "stopwatch" | "unitConverter" | "expenseMini"
  | "passwordGen" | "mood" | "breathing" | "countdown" | "randomPicker" | "routineBuilder";

export type ModuleDef<S = any> = {
  id: ModuleId;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  initial: S;
  Render: (p: { state: S; setState: (next: S | ((prev: S) => S)) => void }) => React.ReactElement;
};

export type StateMap = { [K in ModuleId]?: any };

export const STORAGE_KEY = "versaboard.modules.v3";

export const DEFAULT_ORDER: ModuleId[] = [
  "quickNote","checklist","pomodoro","habitStreak","routineBuilder", "linkSaver","waterTracker",
  "counter","stopwatch","unitConverter","expenseMini","passwordGen","mood",
  "breathing","countdown","randomPicker"
];
