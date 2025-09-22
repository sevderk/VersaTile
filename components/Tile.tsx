import React, { ReactNode } from "react";
import { Pressable, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { s } from "../theme/spacing";
import { type as ty } from "../theme/typography";

type Props = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  children?: ReactNode;
  fixedHeight?: number;
};

export default function Tile({ title, icon, onPress, children, fixedHeight }: Props) {
  const { theme } = useTheme();
  const pressedBg = theme.name === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.line,
        backgroundColor: pressed ? pressedBg : theme.bgElevated,
        padding: s.lg,
        gap: s.md,
        height: fixedHeight,
        overflow: "hidden",
        justifyContent: "space-between",
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Ionicons name={icon} size={18} color={theme.accent} />
        <Text style={{ color: theme.textPrimary, ...ty.label }}>{title}</Text>
      </View>
      {children ? <View>{children}</View> : null}
    </Pressable>
  );
}
