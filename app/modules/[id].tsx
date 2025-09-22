import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import Screen from "../../components/Screen";
import { useModules } from "../../modules/useModules";
import { useTheme } from "../../theme/ThemeProvider";
import { s } from "../../theme/spacing";
import { type as ty } from "../../theme/typography";

export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { modules, state, setModuleState } = useModules();
  const { theme } = useTheme();

  const mod = useMemo(() => modules.find(m => m.id === id), [modules, id]);

  return (
    <Screen>
      <Stack.Screen options={{ title: mod?.title ?? "Module" }} />
      {!mod ? (
        <View style={{ paddingTop: s.xl }}>
          <Text style={{ color: theme.error, ...ty.body }}>Module not found.</Text>
        </View>
      ) : (
        <View style={{ paddingVertical: s.lg, gap: s.md, paddingBottom: s.xl }}>
          <mod.Render
            state={state[mod.id]}
            setState={(next: any) => setModuleState(mod.id as any, next)}
          />
        </View>
      )}
    </Screen>
  );
}
