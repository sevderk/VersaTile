import React from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { type as ty } from "../theme/typography";

type Props = {
  title: string;
  onPress?: () => void;
  variant?: "solid" | "ghost";
  disabled?: boolean;
  loading?: boolean;  // ← şimdilik kullanılmıyor
};

export default function Button({ title, onPress, variant = "solid", disabled }: Props) {
  const { theme } = useTheme();

  const pressedBg =
    theme.name === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  const solidBg = theme.accent;
  const solidFg = theme.name === "dark" ? "#0F1325" : "#FFFFFF";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => {
        const isSolid = variant === "solid";
        return {
          height: 44,
          paddingHorizontal: 16,
          borderRadius: 12,
          borderWidth: isSolid ? 0 : 1,
          borderColor: isSolid ? "transparent" : theme.line,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isSolid
            ? solidBg
            : pressed
            ? pressedBg
            : "transparent",
          opacity: disabled ? 0.5 : 1,
        };
      }}
    >
      <Text
        style={{
          ...ty.label,
          color: variant === "solid" ? solidFg : theme.textPrimary,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
