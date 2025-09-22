import { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { s } from "../theme/spacing";
import { useTheme } from "../theme/ThemeProvider";

export default function Screen({ children, padded = true }: { children: ReactNode; padded?: boolean }) {
  const { theme } = useTheme();
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={[{ flex: 1 }, padded && { paddingHorizontal: s.xl }]}>{children}</View>
    </SafeAreaView>
  );
}
