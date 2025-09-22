import { Pressable, View, Text } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

const Tab = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => ({
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: active ? "rgba(0,0,0,0.06)" : "transparent",
      transform: [{ scale: pressed ? 0.98 : 1 }]
    })}
  >
    <Text style={{ fontSize: 12, fontWeight: "600", opacity: active ? 1 : 0.6 }}>{label}</Text>
  </Pressable>
);

export default function ThemeToggle() {
  const { mode, setMode, theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.line,
        backgroundColor: theme.bgElevated,
        overflow: "hidden"
      }}
    >
      <Tab label="Light" active={mode === "light"} onPress={() => setMode("light")} />
      <Tab label="Dark" active={mode === "dark"} onPress={() => setMode("dark")} />
      <Tab label="System" active={mode === "system"} onPress={() => setMode("system")} />
    </View>
  );
}
