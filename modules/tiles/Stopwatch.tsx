import React, { useMemo, useEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { s } from "../../theme/spacing";
import { type as ty } from "../../theme/typography";

export type StopwatchState = { seconds: number; running: boolean; laps: number[] };

export default function StopwatchTile({
  state,
  setState,
}: {
  state: StopwatchState;
  setState: (v: StopwatchState | ((p: StopwatchState) => StopwatchState)) => void;
}) {
  const { theme } = useTheme();
  const sec = state?.seconds ?? 0;
  const running = !!state?.running;
  const laps = state?.laps ?? [];

  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!running) return;
    if (ref.current) clearInterval(ref.current);
    ref.current = setInterval(() => {
      setState((p) => ({ ...(p ?? { seconds: 0, running: true, laps: [] }), seconds: (p?.seconds ?? 0) + 1, running: true }));
    }, 1000);
    return () => { if (ref.current) clearInterval(ref.current); ref.current = null; };
  }, [running, setState]);

  const fmt = (t: number) => {
    const h = Math.floor(t / 3600).toString().padStart(2, "0");
    const m = Math.floor((t % 3600) / 60).toString().padStart(2, "0");
    const sss = Math.floor(t % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sss}`;
  };

  const bestWorst = useMemo(() => {
    if (laps.length < 2) return { best: null as number | null, worst: null as number | null, deltas: [] as number[] };
    const deltas: number[] = [];
    for (let i = 0; i < laps.length; i++) {
      const cur = laps[i];
      const next = laps[i + 1];
      if (typeof next === "number") deltas.push(cur - next);
    }
    const best = Math.min(...deltas);
    const worst = Math.max(...deltas);
    return { best, worst, deltas };
  }, [laps]);

  const Primary = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 16, height: 40, borderRadius: 10,
        backgroundColor: theme.accent, alignItems: "center", justifyContent: "center",
      }}
    >
      <Text style={{ color: "#fff", ...ty.label }}>{label}</Text>
    </Pressable>
  );
  const Secondary = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 16, height: 40, borderRadius: 10,
        borderWidth: 1, borderColor: theme.line, alignItems: "center", justifyContent: "center",
      }}
    >
      <Text style={{ color: theme.textSecondary, ...ty.label }}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={{ gap: s.sm }}>
      <Text style={{ color: theme.textPrimary, ...ty.h1 }}>{fmt(sec)}</Text>

      <View style={{ flexDirection: "row", gap: s.sm, flexWrap: "wrap" }}>
        {!running
          ? <Primary label="Start" onPress={() => setState({ seconds: sec, running: true, laps })} />
          : <Primary label="Pause" onPress={() => setState({ seconds: sec, running: false, laps })} />
        }
        <Secondary label="Lap" onPress={() => setState({ seconds: sec, running, laps: [sec, ...laps].slice(0, 10) })} />
        <Secondary label="Reset" onPress={() => setState({ seconds: 0, running: false, laps: [] })} />
      </View>

      {laps.length > 0 && (
        <View style={{ gap: 6 }}>
          <Text style={{ color: theme.textSecondary, ...ty.small }}>Laps (with Δ intervals)</Text>
          {laps.map((l, i) => {
            const next = laps[i + 1];
            const delta = typeof next === "number" ? l - next : l;
            const isBest = bestWorst.best !== null && delta === bestWorst.best;
            const isWorst = bestWorst.worst !== null && delta === bestWorst.worst;
            return (
              <View key={i}
                style={{
                  minHeight: 36, paddingHorizontal: s.md, paddingVertical: 8, borderRadius: 10, borderWidth: 1,
                  borderColor: theme.line, backgroundColor: theme.bgElevated, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                }}
              >
                <Text style={{ color: theme.textPrimary, ...ty.body }}>{i + 1}</Text>
                <Text style={{ color: theme.textPrimary, ...ty.body }}>{fmt(l)}</Text>
                <Text style={{
                  color: isBest ? theme.accent : isWorst ? (theme.error ?? "#E54") : theme.textSecondary,
                  ...ty.small
                }}>
                  Δ {fmt(delta)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
