import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { s } from "../../theme/spacing";
import { type as ty } from "../../theme/typography";
import Button from "../../components/Button";

export default function CounterTile({
  state,
  setState,
}: {
  state: number;
  setState: (v: number | ((p: number) => number)) => void;
}) {
  const { theme } = useTheme();
  const n = typeof state === "number" ? state : 0;
  const [step, setStep] = useState<1 | 5 | 10>(1);

  const pressedBg = theme.name === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  const Pill = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: theme.line,
        backgroundColor: active
          ? (theme.name === "dark" ? "rgba(125,137,255,0.20)" : theme.accentMuted)
          : (pressed ? pressedBg : "transparent"),
      })}
    >
      <Text style={{ color: theme.textPrimary, ...ty.small }}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={{ gap: s.sm }}>
      <Text style={{ color: theme.textPrimary, ...ty.h1 }}>{n}</Text>

      <View style={{ flexDirection: "row", gap: s.sm }}>
        <Button title={`+${step}`} onPress={() => setState((p) => (typeof p === "number" ? p + step : step))} variant="solid" />
        <Button title={`−${step}`} onPress={() => setState((p) => (typeof p === "number" ? p - step : -step))} variant="solid" />
        <Button title="Reset" onPress={() => setState(0)} variant="ghost" />
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pill label="×1" active={step===1} onPress={() => setStep(1)} />
        <Pill label="×5" active={step===5} onPress={() => setStep(5)} />
        <Pill label="×10" active={step===10} onPress={() => setStep(10)} />
      </View>
    </View>
  );
}
