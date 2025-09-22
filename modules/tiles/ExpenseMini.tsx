import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeProvider";
import { s } from "../../theme/spacing";
import { type as ty } from "../../theme/typography";
import Button from "../../components/Button";

export type Txn = { id: string; name: string; amount: number; cat: string; date: string };

const CATS = ["Food", "Transport", "Bills", "Shopping", "Fun", "Other"] as const;

export default function ExpenseMiniTile({
  state,
  setState,
}: {
  state: Txn[];
  setState: (v: Txn[] | ((p: Txn[]) => Txn[])) => void;
}) {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState<(typeof CATS)[number]>("Food");
  const [q, setQ] = useState("");

  // Düzenleme modu (varsa düzenlenen öğenin id’si)
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setAmount("");
    setCat("Food");
    setEditingId(null);
  };

  const addOrUpdate = () => {
    const n = name.trim();
    const a = parseFloat(amount);
    if (!n || !isFinite(a)) return;

    if (editingId) {
      // Güncelle
      setState((cur) =>
        (cur ?? []).map((t) => (t.id === editingId ? { ...t, name: n, amount: a, cat } : t))
      );
      resetForm();
    } else {
      // Ekle
      setState((cur) => [
        { id: String(Date.now()), name: n, amount: a, cat, date: new Date().toISOString() },
        ...(cur ?? []),
      ]);
      setName("");
      setAmount("");
    }
  };

  const onEdit = (t: Txn) => {
    setEditingId(t.id);
    setName(t.name);
    setAmount(String(t.amount));
    // @ts-expect-error güvenli atama
    setCat(t.cat);
  };

  const onDelete = (id: string) => {
    setState((cur) => (cur ?? []).filter((t) => t.id !== id));
    if (editingId === id) resetForm();
  };

  const list = useMemo(
    () =>
      (state ?? []).filter(
        (t) =>
          t.name.toLowerCase().includes(q.toLowerCase()) ||
          t.cat.toLowerCase().includes(q.toLowerCase())
      ),
    [state, q]
  );

  const total = list.reduce((s, t) => s + t.amount, 0);
  const byCat = useMemo(() => {
    const o: Record<string, number> = {};
    list.forEach((t) => {
      o[t.cat] = (o[t.cat] || 0) + t.amount;
    });
    return o;
  }, [list]);

  const csv =
    "name,amount,cat,date\n" +
    list.map((t) => `${t.name},${t.amount},${t.cat},${t.date}`).join("\n");
  const copyCSV = () => Clipboard.setStringAsync(csv).catch(() => {});

  const Pill = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.line,
        backgroundColor: active
          ? theme.accentMuted
          : pressed
          ? theme.name === "dark"
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.04)"
          : "transparent",
      })}
    >
      <Text style={{ ...ty.small, color: theme.textPrimary }}>{label}</Text>
    </Pressable>
  );

  const iconBtnStyle = ({ pressed }: { pressed: boolean }) => ({
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: pressed
      ? theme.name === "dark"
        ? "rgba(255,255,255,0.06)"
        : "rgba(0,0,0,0.04)"
      : "transparent",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  });

  return (
    <View style={{ gap: s.sm }}>
      <View style={{ flexDirection: "row", gap: s.sm }}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Item"
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
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="₺0.00"
          keyboardType="decimal-pad"
          placeholderTextColor={theme.inputPlaceholder}
          style={{
            width: 110,
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
      </View>

      <View style={{ flexDirection: "row", gap: s.sm, flexWrap: "wrap" }}>
        {CATS.map((c) => (
          <Pill key={c} label={c} active={cat === c} onPress={() => setCat(c)} />
        ))}
      </View>

      <View style={{ flexDirection: "row", gap: s.sm, alignItems: "center" }}>
        <Button title={editingId ? "Update" : "Add"} onPress={addOrUpdate} variant="solid" />
        {editingId ? <Button title="Cancel" onPress={resetForm} variant="ghost" /> : null}

        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search"
          placeholderTextColor={theme.inputPlaceholder}
          style={{
            flex: 1,
            height: 40,
            paddingHorizontal: s.md,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.inputBorder,
            backgroundColor: theme.inputBg,
            color: theme.textPrimary,
            ...ty.small,
          }}
        />

        <Button title="Copy" onPress={copyCSV} variant="ghost" />
      </View>

      <View
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.line,
          padding: s.md,
          backgroundColor: theme.bgElevated,
          gap: s.sm,
        }}
      >
        <Text style={{ color: theme.textPrimary, ...ty.h2 }}>₺{total.toFixed(2)}</Text>

        <View style={{ gap: 6 }}>
          {Object.entries(byCat).map(([k, v]) => (
            <View key={k} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ width: 90, color: theme.textSecondary, ...ty.small }}>{k}</Text>
              <View
                style={{
                  flex: 1,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: theme.accentMuted,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${total ? (v / total) * 100 : 0}%`,
                    backgroundColor: theme.accent,
                    height: "100%",
                  }}
                />
              </View>
              <Text
                style={{
                  width: 72,
                  textAlign: "right",
                  color: theme.textPrimary,
                  ...ty.small,
                }}
              >
                ₺{v.toFixed(0)}
              </Text>
            </View>
          ))}
          {Object.keys(byCat).length === 0 && (
            <Text style={{ color: theme.textSecondary, ...ty.small }}>No data.</Text>
          )}
        </View>

        {list.length > 0 && (
          <View style={{ marginTop: 8, gap: 6 }}>
            <Text style={{ color: theme.textSecondary, ...ty.small }}>Recent</Text>
            {list.slice(0, 6).map((t) => (
              <View
                key={t.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Text style={{ flex: 1, color: theme.textPrimary, ...ty.small }} numberOfLines={1}>
                  {t.name} <Text style={{ color: theme.textSecondary }}>• {t.cat}</Text>
                </Text>

                <Text style={{ color: theme.textPrimary, ...ty.small, width: 84, textAlign: "right" }}>
                  ₺{t.amount.toFixed(2)}
                </Text>

                <Pressable
                  accessibilityLabel="Edit"
                  onPress={() => onEdit(t)}
                  hitSlop={10}
                  style={({ pressed }) => ({
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: pressed
                      ? theme.name === "dark"
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.06)"
                      : "transparent",
                  })}
                >
                  <Ionicons name="create-outline" size={18} color={theme.textPrimary} />
                </Pressable>

                <Pressable
                  accessibilityLabel="Delete"
                  onPress={() => onDelete(t.id)}
                  hitSlop={10}
                  style={({ pressed }) => ({
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: pressed
                      ? theme.name === "dark"
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.06)"
                      : "transparent",
                  })}
                >
                  <Ionicons name="trash-outline" size={18} color={theme.error} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
