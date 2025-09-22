import { useForm, Controller } from "react-hook-form";
import type { ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text, View } from "react-native";
import { Link, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import Screen from "../../components/Screen";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import SocialIconButton from "../../components/SocialIconButton";
import { useTheme } from "../../theme/ThemeProvider";
import { s } from "../../theme/spacing";
import { type as ty } from "../../theme/typography";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const { theme } = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 700));
    router.replace("/");
  };

  return (
    <Screen>
      <LinearGradient
        colors={theme.name === "light" ? ["#FFFFFF", theme.accentMuted] : [theme.bgElevated, "#1B2442"]}
        style={{
          borderRadius: 20,
          marginTop: s.xl,
          borderWidth: 1,
          borderColor: theme.line,
          padding: s.xl,
        }}
      >
        <Text style={{ color: theme.textPrimary, ...ty.h1 }}>Welcome back</Text>
        <Text style={{ color: theme.textSecondary, marginTop: 6, ...ty.body }}>
          Log in to keep exploring.
        </Text>
      </LinearGradient>

      <View
        style={{
          borderRadius: 16,
          marginTop: s.lg,
          padding: s.xl,
          borderWidth: 1,
          borderColor: theme.line,
          backgroundColor: theme.bgElevated,
        }}
      >
        <Controller
          control={control}
          name="email"
          render={({ field }: { field: ControllerRenderProps<FormData, "email"> }) => (
            <TextField
              label="Email"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field }: { field: ControllerRenderProps<FormData, "password"> }) => (
            <TextField
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              secureToggle
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.password?.message}
            />
          )}
        />

        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: theme.accent, ...ty.label }}>Forgot password?</Text>
        </View>

        <View style={{ height: s.lg }} />
        <Button title="Log In" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />

        <View style={{ height: s.lg }} />

        <View style={{ flexDirection: "row", gap: s.sm }}>
          <SocialIconButton icon="logo-google" label="" color="#4285F4" />
          <SocialIconButton icon="logo-apple"  label="" />
        </View>

        <View style={{ marginTop: s.lg }}>
          <Text style={{ color: theme.textSecondary, textAlign: "center", ...ty.small }}>
            New here?{" "}
            <Link href="/(auth)/signup" style={{ color: theme.accent, fontWeight: "700" }}>
              Create an account
            </Link>
          </Text>
        </View>
      </View>
    </Screen>
  );
}
