import { Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { s } from "../theme/spacing";
import { type as ty } from "../theme/typography";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color?: string;
  onPress?: () => void;
};

export default function SocialIconButton({ icon, label, color, onPress }: Props) {
  const { theme } = useTheme();
  const tint = color ?? theme.textPrimary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flex: 1,
        height: 52,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.line,
        backgroundColor: theme.bgElevated,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingHorizontal: s.md,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <Ionicons name={icon} size={20} color={tint} />
      <Text style={{ color: theme.textPrimary, ...ty.label }}>{label}</Text>
    </Pressable>
  );
}
