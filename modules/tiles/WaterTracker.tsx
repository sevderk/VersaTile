import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { s } from "../../theme/spacing";
import { type as ty } from "../../theme/typography";

export type WaterState = { date: string; ml: number; target: number };

const todayISO = () => new Date().toISOString().slice(0,10);

export default function WaterTrackerTile({
  state,
  setState,
}: {
  state: WaterState;
  setState: (v: WaterState | ((p: WaterState) => WaterState)) => void;
}) {
  const { theme } = useTheme();
  const today = todayISO();

  const base: WaterState = state && state.date ? state : { date: today, ml: 0, target: 2000 };
  const sameDay = base.date === today;
  const ml = sameDay ? base.ml : 0;
  const target = base.target ?? 2000;
  const pct = Math.max(0, Math.min(100, Math.round((ml/target)*100)));

  const update = (patch: Partial<WaterState>) => setState({ ...base, ...patch, date: today });

  const inc = (d: number) => update({ ml: Math.max(0, ml + d) });

  const Secondary = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12, height: 36, borderRadius: 10, borderWidth: 1, borderColor: theme.line,
        backgroundColor: "transparent", alignItems: "center", justifyContent: "center",
      }}
    >
      <Text style={{ color: theme.textSecondary, ...ty.label }}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={{ gap: s.sm }}>
      <Text style={{ color: theme.textPrimary, ...ty.h2 }}>{ml} / {target} ml</Text>
      <View style={{ height: 10, borderRadius: 999, backgroundColor: theme.accentMuted, overflow: "hidden" }}>
        <View style={{ width: `${pct}%`, backgroundColor: theme.accent, height: "100%" }} />
      </View>

      <View style={{ flexDirection: "row", gap: s.sm, flexWrap: "wrap" }}>
        <Secondary label="+100" onPress={() => inc(100)} />
        <Secondary label="+250" onPress={() => inc(250)} />
        <Secondary label="+500" onPress={() => inc(500)} />
        <Secondary label="−100" onPress={() => inc(-100)} />
        <Secondary label="Reset" onPress={() => update({ ml: 0 })} />
      </View>

      <View style={{ flexDirection: "row", gap: s.sm, alignItems: "center" }}>
        <Text style={{ color: theme.textSecondary, ...ty.small }}>Daily target (ml)</Text>
        <TextInput
          defaultValue={String(target)}
          onEndEditing={(e) => {
            const v = parseInt(e.nativeEvent.text.replace(/[^\d]/g, ""), 10);
            if (Number.isFinite(v) && v > 0) update({ target: v });
          }}
          keyboardType="number-pad"
          style={{
            width: 100, height: 40, paddingHorizontal: s.md, borderRadius: 10, borderWidth: 1,
            borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.textPrimary, ...ty.small,
          }}
        />
      </View>
    </View>
  );
}
