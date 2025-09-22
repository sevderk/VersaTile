import React from "react";
import type { ModuleDef } from "./types";
import QuickNoteTile from "./tiles/QuickNote";
import ChecklistTile, { type ChecklistItem } from "./tiles/Checklist";
import LinkSaverTile, { type LinkItem } from "./tiles/LinkSaver";
import PomodoroTile from "./tiles/Pomodoro";
import HabitStreakTile from "./tiles/HabitStreak";
import WaterTrackerTile, { type WaterState } from "./tiles/WaterTracker";
import CounterTile from "./tiles/Counter";
import StopwatchTile, { type StopwatchState } from "./tiles/Stopwatch";
import UnitConverterTile from "./tiles/UnitConverter";
import ExpenseMiniTile, { type Txn } from "./tiles/ExpenseMini";
import PasswordGenTile from "./tiles/PasswordGen";
import MoodTrackerTile from "./tiles/MoodTracker";
import BreathingTile, { type BreathingState } from "./tiles/Breathing";
import CountdownTile from "./tiles/Countdown";
import RandomPickerTile from "./tiles/RandomPicker";
import RoutineBuilderTile from "./tiles/RoutineBuilder";

const todayISO = () => new Date().toISOString().slice(0, 10);

export const registry: ModuleDef[] = [
  {
    id: "quickNote",
    title: "Quick Note",
    icon: "pencil",
    Render: (p: any) => <QuickNoteTile {...p} />,
    initial: {
      notes: [] as { id: string; text: string; pinned?: boolean; createdAt: string; updatedAt?: string }[],
      draft: "",
      search: "",
    },
  },
  {
    id: "checklist",
    title: "Checklist",
    icon: "checkbox",
    Render: (p: any) => <ChecklistTile {...p} />,
    initial: [] as ChecklistItem[],
  },
  {
    id: "pomodoro",
    title: "Pomodoro",
    icon: "timer",
    Render: (p: any) => <PomodoroTile {...p} />,
    // ✅ Modül ile uyumlu başlangıç
    initial: {
      seconds: 25 * 60,
      running: false,
      mode: "focus",
      preset: "25/5",
      durations: { focus: 25 * 60, break: 5 * 60 },
      cycles: 0,
    },
  },
  {
    id: "habitStreak",
    title: "Habit Streak",
    icon: "flame",
    Render: (p: any) => <HabitStreakTile {...p} />,
    initial: { activeId: undefined as string | undefined, habits: [] as { id: string; name: string; marks: string[] }[] },
  },
  {
    id: "linkSaver",
    title: "Link Saver",
    icon: "bookmark",
    Render: (p: any) => <LinkSaverTile {...p} />,
    initial: [] as LinkItem[],
  },
  {
    id: "waterTracker",
    title: "Water",
    icon: "water",
    Render: (p: any) => <WaterTrackerTile {...p} />,
    initial: { date: todayISO(), ml: 0, target: 2000 } as WaterState,
  },
  {
    id: "counter",
    title: "Counter",
    icon: "stats-chart",
    Render: (p: any) => <CounterTile {...p} />,
    initial: 0,
  },
  {
    id: "stopwatch",
    title: "Stopwatch",
    icon: "time",
    Render: (p: any) => <StopwatchTile {...p} />,
    initial: { seconds: 0, running: false, laps: [] } as StopwatchState,
  },
  {
    id: "unitConverter",
    title: "Unit Converter",
    icon: "swap-horizontal",
    Render: (p: any) => <UnitConverterTile {...p} />,
    initial: { cat: "Length", from: "m", to: "km", value: "" },
  },
  {
    id: "expenseMini",
    title: "Expenses",
    icon: "wallet",
    Render: (p: any) => <ExpenseMiniTile {...p} />,
    initial: [] as Txn[],
  },
  {
    id: "passwordGen",
    title: "Password Gen",
    icon: "key",
    Render: (p: any) => <PasswordGenTile {...p} />,
    initial: { value: "", opt: { length: 12, upper: true, lower: true, digits: true, symbols: false } },
  },
  {
    id: "mood",
    title: "Mood",
    icon: "happy",
    Render: (p: any) => <MoodTrackerTile {...p} />,
    initial: { today: undefined as string | undefined, history: [] as { date: string; mood: string; note?: string }[] },
  },
  {
    id: "breathing",
    title: "Breathing",
    icon: "medkit",
    Render: (p: any) => <BreathingTile {...p} />,
    initial: { running: false, phase: "inhale", seconds: 4, mode: "box", cycles: 0 } as BreathingState,
  },
  {
    id: "countdown",
    title: "Countdown",
    icon: "hourglass",
    Render: (p: any) => <CountdownTile {...p} />,
    initial: { title: "My deadline", iso: "" },
  },
  {
    id: "randomPicker",
    title: "Random Picker",
    icon: "shuffle",
    Render: (p: any) => <RandomPickerTile {...p} />,
    initial: { input: "", last: undefined as string | undefined },
  },
  {
    id: "routineBuilder",
    title: "Routine Builder",
    icon: "list",
    Render: (p: any) => <RoutineBuilderTile {...p} />,
    // Tekli state başlangıcı — Tile içi kendi yapısını oluşturuyorsa da sorun olmaz
    initial: {
      name: "My Routine",
      steps: [] as { id: string; title: string; minutes: number }[],
      history: [] as { id: string; at: string; totalMinutes: number }[],
    },
  },
];
