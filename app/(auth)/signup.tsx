import React from "react";
import { Text, View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import type { ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import TextField from "../../components/TextField";
import Button from "../../components/Button";
import SocialIconButton from "../../components/SocialIconButton";
import { useTheme } from "../../theme/ThemeProvider";
import { s } from "../../theme/spacing";
import { type as ty } from "../../theme/typography";

const schema = z.object({
  name: z.string().min(2, "Tell us your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});
type FormData = z.infer<typeof schema>;

export default function Signup() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 800));
    router.replace("/");
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: theme.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: s.xl, paddingTop: s.xl, paddingBottom: s.xl }}
        >
          <LinearGradient
            colors={theme.name === "light" ? ["#FFFFFF", theme.accentMuted] : [theme.bgElevated, "#1B2442"]}
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.line,
              padding: s.xl,
            }}
          >
            <Text style={{ color: theme.textPrimary, ...ty.h1 }}>Create your space</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 6, ...ty.body }}>
              Quick sign up. No fuss.
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
              name="name"
              render={({ field }: { field: ControllerRenderProps<FormData, "name"> }) => (
                <TextField
                  label="Name"
                  placeholder="Full Name"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.name?.message}
                />
              )}
            />

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

            <View style={{ height: s.lg }} />
            <Button title="Sign Up" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />

            <View style={{ height: s.lg }} />

            <View style={{ flexDirection: "row", gap: s.sm }}>
              <SocialIconButton icon="logo-google" label="" color="#4285F4" />
              <SocialIconButton icon="logo-apple"  label="" />
            </View>

            <View style={{ marginTop: s.lg }}>
              <Text style={{ color: theme.textSecondary, textAlign: "center", ...ty.small }}>
                By signing up, you agree to our Terms & Privacy.
              </Text>
            </View>

            <View style={{ marginTop: s.sm }}>
              <Text style={{ color: theme.textSecondary, textAlign: "center", ...ty.small }}>
                Already have an account?{" "}
                <Link href="/(auth)/login" style={{ color: theme.accent, fontWeight: "700" }}>
                  Log in
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
