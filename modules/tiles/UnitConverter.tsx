import React, { useMemo } from "react";
import { Text, TextInput, View, Pressable, ScrollView } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { s } from "../../theme/spacing";
import { type as ty } from "../../theme/typography";

type CategoryKey = "Length" | "Weight" | "Temperature" | "Volume" | "Speed" | "Time" | "Data";

type Unit = {
  key: string;
  label: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
};

type State = { cat: CategoryKey; from: string; to: string; value: string };
type Props = { state: State; setState: (next: State | ((p: State) => State)) => void };

const UNITS: Record<CategoryKey, Unit[]> = {
  Length: [
    { key: "mm", label: "mm", toBase: v => v / 1000, fromBase: v => v * 1000 },
    { key: "cm", label: "cm", toBase: v => v / 100, fromBase: v => v * 100 },
    { key: "m", label: "m", toBase: v => v, fromBase: v => v },
    { key: "km", label: "km", toBase: v => v * 1000, fromBase: v => v / 1000 },
    { key: "in", label: "in", toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
    { key: "ft", label: "ft", toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
    { key: "yd", label: "yd", toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
    { key: "mi", label: "mi", toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
  ],
  Weight: [
    { key: "g", label: "g", toBase: v => v / 1000, fromBase: v => v * 1000 },
    { key: "kg", label: "kg", toBase: v => v, fromBase: v => v },
    { key: "lb", label: "lb", toBase: v => v * 0.45359237, fromBase: v => v / 0.45359237 },
    { key: "oz", label: "oz", toBase: v => v * 0.0283495231, fromBase: v => v / 0.0283495231 },
  ],
  Temperature: [
    { key: "C", label: "°C", toBase: v => v, fromBase: v => v },
    { key: "F", label: "°F", toBase: v => (v - 32) * (5 / 9), fromBase: v => v * (9 / 5) + 32 },
    { key: "K", label: "K", toBase: v => v - 273.15, fromBase: v => v + 273.15 },
  ],
  Volume: [
    { key: "ml", label: "mL", toBase: v => v / 1000, fromBase: v => v * 1000 },
    { key: "l", label: "L", toBase: v => v, fromBase: v => v },
    { key: "gal", label: "gal", toBase: v => v * 3.785411784, fromBase: v => v / 3.785411784 },
  ],
  Speed: [
    { key: "mps", label: "m/s", toBase: v => v, fromBase: v => v },
    { key: "kmh", label: "km/h", toBase: v => v / 3.6, fromBase: v => v * 3.6 },
    { key: "mph", label: "mph", toBase: v => v * 0.44704, fromBase: v => v / 0.44704 },
  ],
  Time: [
    { key: "s", label: "s", toBase: v => v, fromBase: v => v },
    { key: "min", label: "min", toBase: v => v * 60, fromBase: v => v / 60 },
    { key: "h", label: "h", toBase: v => v * 3600, fromBase: v => v / 3600 },
  ],
  Data: [
    { key: "B", label: "B", toBase: v => v, fromBase: v => v },
    { key: "KB", label: "KB", toBase: v => v * 1e3, fromBase: v => v / 1e3 },
    { key: "MB", label: "MB", toBase: v => v * 1e6, fromBase: v => v / 1e6 },
    { key: "GB", label: "GB", toBase: v => v * 1e9, fromBase: v => v / 1e9 },
  ],
};

export default function UnitConverterTile({ state, setState }: Props) {
  const { theme } = useTheme();
  const units = UNITS[state.cat];

  const fromIdx = Math.max(0, units.findIndex(u => u.key === state.from));
  const toIdx = Math.max(0, units.findIndex(u => u.key === state.to));
  const fromU = units[fromIdx] || units[0];
  const toU = units[toIdx] || units[Math.min(1, units.length - 1)];

  const result = useMemo(() => {
    const n = Number(String(state.value ?? "").replace(",", "."));
    if (!isFinite(n)) return "";
    const base = fromU.toBase(n);
    const out = toU.fromBase(base);
    return String(Math.round(out * 1_000_000) / 1_000_000);
  }, [state.value, fromU, toU]);

  const Chip = ({
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
        backgroundColor: active ? theme.accentMuted : theme.bgElevated,
        color: theme.textPrimary,
        marginRight: s.sm,
        ...ty.label,
      }}
    >
      {label}
    </Text>
  );

  const cycle = (kind: "from" | "to", dir: 1 | -1) =>
    setState(p => {
      const arr = UNITS[p.cat];
      const idx = arr.findIndex(u => u.key === (kind === "from" ? p.from : p.to));
      const next = arr[(idx + dir + arr.length) % arr.length].key;
      return { ...p, [kind]: next } as State;
    });

  const swap = () => setState(p => ({ ...p, from: p.to, to: p.from }));

  return (
    <View style={{ gap: s.md }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: s.sm }}>
        {(Object.keys(UNITS) as CategoryKey[]).map(k => (
          <Chip
            key={k}
            label={k}
            active={state.cat === k}
            onPress={() => {
              const first = UNITS[k][0].key;
              const second = UNITS[k][1]?.key || first;
              setState(p => ({ ...p, cat: k, from: first, to: second }));
            }}
          />
        ))}
      </ScrollView>

      <TextInput
        placeholder="Value"
        placeholderTextColor={theme.inputPlaceholder}
        keyboardType="numeric"
        value={String(state.value ?? "")}
        onChangeText={t => setState(p => ({ ...p, value: t }))}
        style={{
          borderRadius: 10,
          borderWidth: 1,
          borderColor: theme.line,
          backgroundColor: theme.inputBg,
          paddingHorizontal: s.md,
          paddingVertical: 10,
          color: theme.textPrimary,
          ...ty.body,
        }}
      />

      <View style={{ flexDirection: "row", gap: s.sm }}>
        <Pressable
          onPress={() => cycle("from", 1)}
          style={{
            flex: 1,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.line,
            backgroundColor: theme.bgElevated,
            padding: s.md,
          }}
        >
          <Text style={{ color: theme.textSecondary, ...ty.small }}>From</Text>
          <Text style={{ color: theme.textPrimary, ...ty.h2 }}>{fromU.label}</Text>
        </Pressable>

        <Pressable
          onPress={() => cycle("to", 1)}
          style={{
            flex: 1,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.line,
            backgroundColor: theme.bgElevated,
            padding: s.md,
          }}
        >
          <Text style={{ color: theme.textSecondary, ...ty.small }}>To</Text>
          <Text style={{ color: theme.textPrimary, ...ty.h2 }}>{toU.label}</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", gap: s.sm, alignItems: "center" }}>
        <Pressable
          onPress={swap}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 10,
            backgroundColor: theme.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", ...ty.label }}>Swap</Text>
        </Pressable>

        <View
          style={{
            flex: 1,
            padding: s.md,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.line,
            backgroundColor: theme.bgElevated,
          }}
        >
          <Text style={{ color: theme.textPrimary, ...ty.h2 }}>{result || "—"}</Text>
          <Text style={{ color: theme.textSecondary, ...ty.small }}>
            {String(state.value || "0")} {fromU.label} → {result || "…"} {toU.label}
          </Text>
        </View>
      </View>
    </View>
  );
}
