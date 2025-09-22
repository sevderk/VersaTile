import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "../../theme/ThemeProvider";
import { s } from "../../theme/spacing";
import { type as ty } from "../../theme/typography";

type Options = {
  length: number;
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
  excludeSimilar?: boolean; // i l 1 I O 0 vs.
};

const chars = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>/?",
};
const SIMILAR = new Set("il1IoO0".split(""));

function buildPool(opt: Options) {
  let pool = "";
  if (opt.upper) pool += chars.upper;
  if (opt.lower) pool += chars.lower;
  if (opt.digits) pool += chars.digits;
  if (opt.symbols) pool += chars.symbols;
  if (!pool) pool = chars.lower;
  if (opt.excludeSimilar) {
    pool = pool.split("").filter((c) => !SIMILAR.has(c)).join("");
  }
  return pool;
}

function generatePassword(opt: Options) {
  const pool = buildPool(opt);
  let out = "";
  for (let i = 0; i < opt.length; i++) out += pool[Math.floor(Math.random() * pool.length)];
  return out;
}

function entropyBits(pw: string, opt: Options) {
  const pool = buildPool(opt).length || 1;
  return Math.round(Math.log2(pool) * (pw.length || 0));
}

function strengthLabel(bits: number) {
  if (bits < 40) return "Weak";
  if (bits < 60) return "Fair";
  if (bits < 80) return "Good";
  return "Strong";
}

export default function PasswordGenTile({
  state,
  setState,
}: {
  state: { value: string; opt: Options };
  setState: (v: any) => void;
}) {
  const { theme } = useTheme();
  const opt: Options = state?.opt || { length: 12, upper: true, lower: true, digits: true, symbols: false, excludeSimilar: false };
  const value = useMemo(() => state?.value || generatePassword(opt), [state?.value, opt]);

  const bits = entropyBits(value, opt);
  const label = strengthLabel(bits);
  const percent = Math.min(100, Math.round((bits / 100) * 100));

  const Toggle = ({ k, label }: { k: keyof Options; label: string }) => (
    <Pressable
      onPress={() => setState((p: any) => ({ ...p, opt: { ...opt, [k]: !opt[k] } }))}
      style={({ pressed }) => ({
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: theme.line,
        backgroundColor: opt[k]
          ? (theme.name === "dark" ? "rgba(125,137,255,0.20)" : theme.accentMuted)
          : (pressed ? (theme.name === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)") : "transparent"),
      })}
    >
      <Text style={{ color: theme.textPrimary, ...ty.label }}>{label}</Text>
    </Pressable>
  );

  const Step = ({ d, label }: { d: number; label: string }) => (
    <Pressable
      onPress={() => setState((p: any) => ({ ...p, opt: { ...opt, length: Math.max(4, Math.min(64, opt.length + d)) } }))}
      style={({ pressed }) => ({
        paddingHorizontal: 14, height: 40, borderRadius: 12, borderWidth: 1, borderColor: theme.line,
        backgroundColor: pressed ? (theme.name === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)") : "transparent",
        alignItems: "center", justifyContent: "center",
      })}
    >
      <Text style={{ color: theme.textPrimary, ...ty.label }}>{label}</Text>
    </Pressable>
  );

  const copy = () => Clipboard.setStringAsync(value).catch(()=>{});

  return (
    <View style={{ gap: s.sm }}>
      {/* Output row */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: s.sm, justifyContent: "space-between" }}>
        <Text selectable style={{ color: theme.textPrimary, ...ty.h2, flex: 1 }} numberOfLines={1}>{value}</Text>
        <Pressable onPress={copy}
          style={({ pressed }) => ({
            paddingHorizontal: 12, height: 40, borderRadius: 12, borderWidth: 1, borderColor: theme.line,
            backgroundColor: pressed ? (theme.name === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)") : "transparent",
            alignItems: "center", justifyContent: "center",
          })}
        >
            <Text style={{ color: theme.textPrimary, ...ty.label }}>Copy</Text>
        </Pressable>
      </View>

      {/* Strength */}
      <View style={{ height: 10, borderRadius: 999, backgroundColor: theme.accentMuted, overflow: "hidden" }}>
        <View style={{ width: `${percent}%`, backgroundColor: theme.accent, height: "100%" }} />
      </View>
      <Text style={{ color: theme.textSecondary, ...ty.small }}>Entropy ≈ {bits} bits • {label}</Text>

      {/* Length & toggles */}
      <View style={{ flexDirection: "row", gap: s.sm, alignItems: "center" }}>
        <Step d={-1} label="−" />
        <Text style={{ color: theme.textSecondary, ...ty.label }}>Length {opt.length}</Text>
        <Step d={+1} label="+" />
      </View>

      <View style={{ flexDirection: "row", gap: s.sm, flexWrap: "wrap" }}>
        <Toggle k="upper" label="A-Z" />
        <Toggle k="lower" label="a-z" />
        <Toggle k="digits" label="0-9" />
        <Toggle k="symbols" label="!@#" />
        <Toggle k="excludeSimilar" label="No similar" />
      </View>

      <Pressable
        onPress={() => setState({ value: generatePassword(opt), opt })}
        style={({ pressed }) => ({
          paddingHorizontal: 16, height: 44, borderRadius: 12, borderWidth: 1, borderColor: theme.line,
          backgroundColor: pressed ? (theme.name === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)") : "transparent",
          alignItems: "center", justifyContent: "center",
        })}
      >
        <Text style={{ color: theme.textPrimary, ...ty.label }}>Generate</Text>
      </Pressable>
    </View>
  );
}
