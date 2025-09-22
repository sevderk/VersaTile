import { View, Text, Pressable } from "react-native";
import Screen from "../components/Screen";
import { useTheme } from "../theme/ThemeProvider";
import { s } from "../theme/spacing";
import { type as ty } from "../theme/typography";

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const pressedBg =
    theme.name === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? theme.accent : theme.line,
        backgroundColor: active ? theme.accentMuted : (pressed ? pressedBg : "transparent"),
      })}
    >
      <Text style={{ ...ty.label, color: theme.textPrimary }}>{label}</Text>
    </Pressable>
  );
}

export default function Settings() {
  const { theme, mode, setMode } = useTheme();

  return (
    <Screen>
      <View
        style={{
          marginTop: s.xl,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.line,
          backgroundColor: theme.bgElevated,
          padding: s.xl,
          gap: s.sm,
        }}
      >
        <Text style={{ color: theme.textPrimary, ...ty.h2 }}>Appearance</Text>
        <Text style={{ color: theme.textSecondary, ...ty.body }}>
          Choose how the app looks.
        </Text>

        <View
          style={{
            marginTop: s.lg,
            flexDirection: "row",
            gap: s.sm,
            borderWidth: 1,
            borderColor: theme.line,
            borderRadius: 999,
            padding: 4,
            alignSelf: "flex-start",
          }}
        >
          <Pill label="Light"  active={mode === "light"}  onPress={() => setMode("light")} />
          <Pill label="Dark"   active={mode === "dark"}   onPress={() => setMode("dark")} />
          <Pill label="System" active={mode === "system"} onPress={() => setMode("system")} />
        </View>
      </View>
    </Screen>
  );
}
