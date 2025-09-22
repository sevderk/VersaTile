import React, { useEffect, useMemo, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { s } from "../../theme/spacing";
import { type as ty } from "../../theme/typography";

/** ---------- types & helpers ---------- */

type Item = { id: string; title: string; iso: string };

// V1 ile uyumluluk: { title: string; iso: string }
type State = { title?: string; iso?: string; items?: Item[] };

function partsLeft(targetISO: string) {
  const t = new Date(targetISO).getTime();
  if (!Number.isFinite(t)) return { invalid: true as const };
  const ms = Math.max(0, t - Date.now());
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return { d, h, m, s, done: sec === 0, invalid: false as const };
}
const isIso = (v: string) => Number.isFinite(new Date(v).getTime());

/** ---------- component ---------- */

export default function CountdownTile({
  state,
  setState,
}: {
  state: State;
  setState: (v: State | ((p: State) => State)) => void;
}) {
  const { theme } = useTheme();

  // V1 -> V2 migrasyon (tekli -> çoklu)
  useEffect(() => {
    if (!Array.isArray(state?.items)) {
      const first: Item | null =
        (state?.title || state?.iso)
          ? { id: String(Date.now()), title: state?.title || "My deadline", iso: state?.iso || "" }
          : null;
      setState({ title: state?.title, iso: state?.iso, items: first ? [first] : [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = Array.isArray(state?.items) ? state.items : [];

  // Add form state
  const [title, setTitle] = useState("");
  const [iso, setIso] = useState("");

  // saniyelik tick
  const [, setTick] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    ref.current = setInterval(() => setTick((t) => t + 1), 1000);
    return () => { if (ref.current) clearInterval(ref.current); ref.current = null; };
  }, []);

  const pressedBg = theme.name === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  const add = () => {
    const t = title.trim();
    const i = iso.trim();
    if (!t || !isIso(i)) return;
    const next: Item = { id: String(Date.now()), title: t, iso: i };
    setState((p) => ({ ...(p || {}), items: [next, ...((p?.items as Item[]) || [])] }));
    setTitle("");
    setIso("");
  };
  const del = (id: string) =>
    setState((p) => ({ ...(p || {}), items: (p?.items || []).filter((x) => x.id !== id) }));

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const ta = new Date(a.iso).getTime();
      const tb = new Date(b.iso).getTime();
      return (ta || Infinity) - (tb || Infinity);
    });
  }, [items]);

  return (
    <View style={{ gap: s.sm }}>
      {/* Title tek satır (tam genişlik) */}
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor={theme.inputPlaceholder}
        style={{
          height: 44,
          paddingHorizontal: s.md,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.inputBorder,
          backgroundColor: theme.inputBg,
          color: theme.textPrimary,
          ...ty.body,
        }}
      />

      {/* ISO + Add (Add title'ın altında, SOLID/ACCENT) */}
      <View style={{ flexDirection: "row", gap: s.sm }}>
        <TextInput
          value={iso}
          onChangeText={setIso}
          placeholder="YYYY-MM-DDThh:mm"
          autoCapitalize="none"
          placeholderTextColor={theme.inputPlaceholder}
          style={{
            flex: 1,
            height: 44,
            paddingHorizontal: s.md,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.inputBorder,
            backgroundColor: theme.inputBg,
            color: theme.textPrimary,
            ...ty.body,
          }}
        />
        <Pressable
          onPress={add}
          style={{
            height: 44,
            paddingHorizontal: 14,
            borderRadius: 12,
            backgroundColor: theme.accent,   // ← solid accent
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", ...ty.label }}>Add</Text>
        </Pressable>
      </View>

      {/* List */}
      <View style={{ gap: 8 }}>
        {sorted.map((it) => {
          const left = partsLeft(it.iso);
          const invalid = left.invalid;
          const done = !invalid && left.done;
          return (
            <View
              key={it.id}
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.line,
                backgroundColor: theme.bgElevated,
                padding: s.md,
                gap: 6,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ color: theme.textPrimary, ...ty.h2 }} numberOfLines={1}>
                  {it.title || "—"}
                </Text>
                <Pressable
                  onPress={() => del(it.id)}
                  hitSlop={10}
                  style={({ pressed }) => ({
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: pressed ? pressedBg : "transparent",
                  })}
                >
                  <Ionicons name="trash-outline" size={18} color={theme.error} />
                </Pressable>
              </View>

              <Text style={{ color: theme.textSecondary, ...ty.small }}>{it.iso || "—"}</Text>

              {invalid ? (
                <Text style={{ color: theme.error, ...ty.small }}>Invalid date</Text>
              ) : done ? (
                <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                  <Ionicons name="checkmark-circle" size={18} color={theme.success} />
                  <Text style={{ color: theme.success, ...ty.label }}>Time’s up</Text>
                </View>
              ) : (
                <View style={{ flexDirection: "row", gap: 10, marginTop: 2 }}>
                  {[
                    { k: "d", label: "days", val: left.d },
                    { k: "h", label: "hrs", val: left.h },
                    { k: "m", label: "min", val: left.m },
                    { k: "s", label: "sec", val: left.s },
                  ].map(({ k, label, val }) => (
                    <View
                      key={`${it.id}-${k}`}
                      style={{
                        minWidth: 68,
                        paddingVertical: 8,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: theme.line,
                        backgroundColor:
                          theme.name === "dark" ? "rgba(255,255,255,0.06)" : theme.accentMuted,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: theme.textPrimary, fontSize: 22, fontWeight: "700" }}>
                        {String(val).padStart(2, "0")}
                      </Text>
                      <Text style={{ color: theme.textSecondary, ...ty.small }}>{label}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
        {sorted.length === 0 && (
          <Text style={{ color: theme.textSecondary, textAlign: "center", ...ty.small }}>
            No deadlines yet.
          </Text>
        )}
      </View>
    </View>
  );
}
