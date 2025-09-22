import React, { useEffect, useRef } from "react";
import { Text, TextInput, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../theme/ThemeProvider";
import { s } from "../../theme/spacing";
import { type as ty } from "../../theme/typography";
import Button from "../../components/Button";

type Mode = "box" | "478";
type Phase = "inhale" | "hold" | "exhale";

export type BreathingState = {
  running: boolean;
  phase: Phase;
  seconds: number;
  mode: Mode;
  cycles: number;
  target?: number;
  completed?: boolean;
};

const DUR: Record<Mode, Record<Phase, number>> = {
  box: { inhale: 4, hold: 4, exhale: 4 },
  "478": { inhale: 4, hold: 7, exhale: 8 },
};

function nextPhase(p: Phase): Phase {
  if (p === "inhale") return "hold";
  if (p === "hold") return "exhale";
  return "inhale";
}

export default function BreathingTile({
  state,
  setState,
}: {
  state: BreathingState;
  setState: (v: BreathingState | ((p: BreathingState) => BreathingState)) => void;
}) {
  const { theme } = useTheme();

  const mode = state?.mode ?? "box";
  const running = !!state?.running;
  const phase = state?.phase ?? "inhale";
  const secs = state?.seconds ?? DUR[mode][phase];
  const cycles = state?.cycles ?? 0;
  const target = state?.target ?? 0;
  const completed = !!state?.completed;

  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running || completed) return;
    if (ref.current) clearInterval(ref.current);
    ref.current = setInterval(() => {
      setState((prev) => {
        const m = prev?.mode ?? "box";
        const ph = prev?.phase ?? "inhale";
        const left = prev?.seconds ?? DUR[m][ph];
        if (left <= 1) {
          const nxt = nextPhase(ph);
          const finishedCycle = ph === "exhale" && nxt === "inhale";
          const newCycles = (prev?.cycles ?? 0) + (finishedCycle ? 1 : 0);
          const reach = (prev?.target ?? 0) > 0 && newCycles >= (prev?.target ?? 0);
          if (reach) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          return {
            running: reach ? false : true,
            completed: reach,
            mode: m,
            phase: nxt,
            seconds: DUR[m][nxt],
            cycles: newCycles,
            target: prev?.target ?? 0,
          };
        }
        return { ...(prev ?? {}), seconds: left - 1 };
      });
    }, 1000);
    return () => {
      if (ref.current) clearInterval(ref.current);
      ref.current = null;
    };
  }, [running, completed, setState]);

  const percent = Math.max(0, Math.min(100, Math.round(((DUR[mode][phase] - secs) / DUR[mode][phase]) * 100)));
  const prog = target > 0 ? Math.min(100, Math.round((cycles / target) * 100)) : 0;

  const boxBg = theme.name === "dark" ? "rgba(255,255,255,0.06)" : theme.accentMuted;

  return (
    <View style={{ gap: s.sm }}>
      <Text style={{ color: theme.textSecondary, ...ty.small }}>
        Mode: {mode === "box" ? "Box 4-4-4" : "4-7-8"} • Cycle {cycles}
        {target > 0 ? ` / ${target}` : ""}
      </Text>

      {target > 0 && (
        <View style={{ height: 8, borderRadius: 999, backgroundColor: theme.accentMuted, overflow: "hidden" }}>
          <View style={{ width: `${prog}%`, height: "100%", backgroundColor: theme.accent }} />
        </View>
      )}

      <Text style={{ color: theme.textPrimary, ...ty.h1 }}>
        {phase.toUpperCase()} {String(secs).padStart(2, "0")}
      </Text>

      <View style={{ height: 10, borderRadius: 999, backgroundColor: theme.accentMuted, overflow: "hidden" }}>
        <View style={{ width: `${percent}%`, height: "100%", backgroundColor: theme.accent }} />
      </View>

      <View style={{ flexDirection: "row", gap: s.sm, flexWrap: "wrap" }}>
        {!running ? (
          <Button
            title={completed ? "Restart" : "Start"}
            onPress={() =>
              setState({
                running: true,
                completed: false,
                mode,
                phase,
                seconds: secs,
                cycles,
                target,
              })
            }
            variant="solid"
          />
        ) : (
          <Button
            title="Pause"
            onPress={() =>
              setState({
                running: false,
                completed,
                mode,
                phase,
                seconds: secs,
                cycles,
                target,
              })
            }
            variant="solid"
          />
        )}
        <Button
          title="Reset"
          onPress={() =>
            setState({
              running: false,
              completed: false,
              mode,
              phase: "inhale",
              seconds: DUR[mode]["inhale"],
              cycles: 0,
              target,
            })
          }
          variant="ghost"
        />
        <Button
          title={mode === "box" ? "Switch 4-7-8" : "Switch Box"}
          onPress={() => {
            const next = mode === "box" ? "478" : "box";
            setState({
              running: false,
              completed: false,
              mode: next,
              phase: "inhale",
              seconds: DUR[next]["inhale"],
              cycles: 0,
              target,
            });
          }}
          variant="ghost"
        />
      </View>

      <View style={{ flexDirection: "row", gap: s.sm, alignItems: "center" }}>
        <Text style={{ color: theme.textSecondary, ...ty.small }}>Target cycles</Text>
        <TextInput
          defaultValue={String(target || 0)}
          onEndEditing={(e) => {
            const v = parseInt(e.nativeEvent.text.replace(/[^\d]/g, ""), 10);
            const valid = Number.isFinite(v) ? v : 0;
            setState({
              running: false,
              completed: false,
              mode,
              phase: "inhale",
              seconds: DUR[mode]["inhale"],
              cycles: 0,
              target: valid,
            });
          }}
          keyboardType="number-pad"
          style={{
            width: 80,
            height: 36,
            paddingHorizontal: s.md,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.inputBorder,
            backgroundColor: theme.inputBg,
            color: theme.textPrimary,
            ...ty.small,
          }}
        />
        {[5, 10, 20].map((n) => (
          <Button
            key={n}
            title={String(n)}
            onPress={() =>
              setState({
                running: false,
                completed: false,
                mode,
                phase: "inhale",
                seconds: DUR[mode]["inhale"],
                cycles: 0,
                target: n,
              })
            }
            variant="ghost"
          />
        ))}
      </View>
    </View>
  );
}
