import React, { useEffect, useMemo, useRef } from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { s } from "../../theme/spacing";
import { type as ty } from "../../theme/typography";

export type PomodoroState = {
  seconds: number;
  running: boolean;
  mode: "focus" | "short" | "long";
  durations: { focus: number; short: number; long: number };
  preset: "25_5" | "52_17" | "112_26";
};

type Props = {
  state: PomodoroState;
  setState: (next: PomodoroState | ((p: PomodoroState) => PomodoroState)) => void;
};

const PRESETS: Record<PomodoroState["preset"], { focus: number; short: number; long: number }> = {
  "25_5": { focus: 25 * 60, short: 5 * 60, long: 15 * 60 },
  "52_17": { focus: 52 * 60, short: 17 * 60, long: 25 * 60 },
  "112_26": { focus: 112 * 60, short: 26 * 60, long: 40 * 60 },
};

function format(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const sss = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${sss}`;
}

export default function PomodoroTile({ state, setState }: Props) {
  const { theme } = useTheme();
  const tRef = useRef<NodeJS.Timeout | null>(null);

  // tick
  useEffect(() => {
    if (!state.running) return;
    tRef.current = setInterval(() => {
      setState((p) => ({ ...p, seconds: Math.max(0, p.seconds - 1) }));
    }, 1000);
    return () => {
      if (tRef.current) clearInterval(tRef.current);
      tRef.current = null;
    };
  }, [state.running, setState]);

  // stop at zero
  useEffect(() => {
    if (state.seconds === 0 && state.running) {
      setState((p) => ({ ...p, running: false }));
    }
  }, [state.seconds, state.running, setState]);

  const title = useMemo(() => {
    if (state.mode === "focus") return "Focus";
    if (state.mode === "short") return "Short Break";
    return "Long Break";
  }, [state.mode]);

  const switchMode = (m: PomodoroState["mode"]) =>
    setState((p) => ({ ...p, mode: m, seconds: p.durations[m], running: false }));

  const setPreset = (key: NonNullable<PomodoroState["preset"]>) =>
    setState((p) => {
      const d = PRESETS[key];
      return { ...p, preset: key, durations: d, seconds: d[p.mode], running: false };
    });

  const Pill = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <Text
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? theme.accent : theme.line,
        backgroundColor: active ? theme.accentMuted : "transparent",
        color: theme.textPrimary,
        marginRight: s.sm,
        ...ty.label,
      }}
    >
      {label}
    </Text>
  );

  return (
    <View style={{ gap: s.md }}>
      <Text style={{ color: theme.textPrimary, ...ty.h2 }}>{title}</Text>

      <Text style={{ color: theme.textPrimary, fontSize: 42, fontWeight: "800" }}>
        {format(state.seconds)}
      </Text>

      <View style={{ flexDirection: "row", gap: s.sm }}>
        <Pill label="Focus" active={state.mode === "focus"} onPress={() => switchMode("focus")} />
        <Pill label="Short Break" active={state.mode === "short"} onPress={() => switchMode("short")} />
        <Pill label="Long Break" active={state.mode === "long"} onPress={() => switchMode("long")} />
      </View>

      <View style={{ flexDirection: "row", gap: s.sm }}>
        <Pill label="25/5" active={state.preset === "25_5"} onPress={() => setPreset("25_5")} />
        <Pill label="52/17" active={state.preset === "52_17"} onPress={() => setPreset("52_17")} />
        <Pill label="112/26" active={state.preset === "112_26"} onPress={() => setPreset("112_26")} />
      </View>

      <View style={{ flexDirection: "row", gap: s.sm }}>
        <Text
          onPress={() => setState((p) => ({ ...p, running: !p.running }))}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 10,
            backgroundColor: theme.accent,
            color: "#fff",
            ...ty.label,
          }}
        >
          {state.running ? "Pause" : "Start"}
        </Text>
        <Text
          onPress={() =>
            setState((p) => ({ ...p, seconds: p.durations[p.mode], running: false }))
          }
          style={{
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.line,
            color: theme.textPrimary,
            ...ty.label,
          }}
        >
          Reset
        </Text>
      </View>
    </View>
  );
}
