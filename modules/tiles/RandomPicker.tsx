import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { s } from "../../theme/spacing";
import { type as ty } from "../../theme/typography";

type PickerState = { input: string; last?: string };

export default function RandomPickerTile({
  state,
  setState,
}: {
  state: PickerState;
  setState: (v: PickerState | ((p: PickerState) => PickerState)) => void;
}) {
  const { theme } = useTheme();
  const [input, setInput] = useState(state?.input ?? "");

  const pick = () => {
    const items = input.split(",").map((t) => t.trim()).filter(Boolean);
    if (items.length === 0) return;
    const choice = items[Math.floor(Math.random() * items.length)];
    setState({ input, last: choice });
  };

  return (
    <View style={{ gap: s.sm }}>
      <TextInput
        value={input}
        onChangeText={(t) => { setInput(t); setState((p) => ({ ...(p ?? {}), input: t })); }}
        placeholder="e.g., pizza, sushi, burger"
        placeholderTextColor={theme.inputPlaceholder}
        style={{
          minHeight: 44, paddingHorizontal: s.md, paddingVertical: 10, borderRadius: 12, borderWidth: 1,
          borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.textPrimary, ...ty.body,
        }}
      />

      <Pressable
        onPress={pick}
        style={{
          height: 44, borderRadius: 10,
          backgroundColor: theme.accent,
          alignItems: "center", justifyContent: "center",
        }}
      >
        <Text style={{ color: "#fff", ...ty.label }}>Pick Random</Text>
      </Pressable>

      <Text style={{ color: theme.textSecondary, ...ty.small }}>
        {state?.last ? `Last pick: ${state.last}` : "No pick yet."}
      </Text>
    </View>
  );
}
