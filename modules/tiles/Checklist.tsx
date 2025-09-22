import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeProvider";
import { s } from "../../theme/spacing";
import { type as ty } from "../../theme/typography";
import Button from "../../components/Button";

export type ChecklistItem = { id: string; text: string; done: boolean; cat?: string };

const DEFAULT_CATS = ["Personal","Work","Home","Other"] as const;

export default function ChecklistTile({
  state,
  setState,
}: {
  state: ChecklistItem[];
  setState: (v: ChecklistItem[] | ((prev: ChecklistItem[]) => ChecklistItem[])) => void;
}) {
  const { theme } = useTheme();
  const [text, setText] = useState("");
  const [cat, setCat] = useState<string>(DEFAULT_CATS[0]);
  const [hideDone, setHideDone] = useState(false);

  const [customCats, setCustomCats] = useState<string[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [collapsed, setCollapsed] = useState(true);

  const pressedBg = theme.name === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  const add = () => {
    const t = text.trim();
    if (!t) return;
    setState((cur) => [{ id: String(Date.now()), text: t, done: false, cat }, ...(cur ?? [])]);
    setText("");
  };
  const toggle = (id: string) => setState((cur) => cur.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  const del = (id: string) => setState((cur) => cur.filter((it) => it.id !== id));
  const clearDone = () => setState((cur) => cur.filter((it) => !it.done));

  const ordered = useMemo(() => {
    const all = state ?? [];
    const undone = all.filter(i => !i.done);
    const done = all.filter(i => i.done);
    const sortedUndone = [...undone].sort((a,b) => (a.cat||"").localeCompare(b.cat||""));
    const sortedDone = [...done].sort((a,b) => (a.cat||"").localeCompare(b.cat||""));
    return hideDone ? sortedUndone : [...sortedUndone, ...sortedDone];
  }, [state, hideDone]);

  const total = state?.length ?? 0;
  const doneCount = state?.filter((i) => i.done).length ?? 0;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const Pill = ({ label, active, onPress, onRemove }: { label: string; active: boolean; onPress: () => void; onRemove?: () => void }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: theme.line,
        backgroundColor: active
          ? (theme.name === "dark" ? "rgba(125,137,255,0.20)" : theme.accentMuted)
          : (pressed ? pressedBg : "transparent"),
        flexDirection: "row", alignItems: "center", gap: 6,
      })}
    >
      <Text style={{ color: theme.textPrimary, ...ty.small }}>{label}</Text>
      {onRemove && <Ionicons name="close" size={14} color={theme.textSecondary} onPress={onRemove} />}
    </Pressable>
  );

  const createCat = () => {
    const c = newCat.trim();
    if (!c) return;
    setCustomCats((prev) => (prev.includes(c) ? prev : [...prev, c]));
    setCat(c);
    setShowNew(false);
    setNewCat("");
  };
  const removeCat = (c: string) => setCustomCats((prev) => prev.filter((x) => x !== c));

  const allCats = [...DEFAULT_CATS, ...customCats];
  const visibleCats = collapsed ? allCats.slice(0, 6) : allCats;
  const hiddenCount = Math.max(0, allCats.length - visibleCats.length);

  return (
    <View style={{ gap: s.sm }}>
      <View style={{ flexDirection: "row", gap: s.sm, alignItems: "center" }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Add a task"
          placeholderTextColor={theme.inputPlaceholder}
          onSubmitEditing={add}
          style={{
            flex: 1, height: 44, paddingHorizontal: s.md, borderRadius: 12, borderWidth: 1,
            borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.textPrimary, ...ty.body,
          }}
        />
        <Button title="Add" onPress={add} variant="solid" />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, alignItems: "center" }}>
        {visibleCats.map((c) => (
          <Pill key={c} label={c} active={cat===c} onPress={() => setCat(c)} onRemove={customCats.includes(c) ? () => removeCat(c) : undefined} />
        ))}
        {hiddenCount > 0 && (
          <Pill label={`+${hiddenCount} more`} active={false} onPress={() => setCollapsed(false)} />
        )}
        {!showNew ? (
          <Pill label="+ New" active={false} onPress={() => setShowNew(true)} />
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <TextInput
              value={newCat}
              onChangeText={setNewCat}
              placeholder="Category"
              placeholderTextColor={theme.inputPlaceholder}
              onSubmitEditing={createCat}
              style={{
                height: 32, minWidth: 120, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1,
                borderColor: theme.line, backgroundColor: "transparent", color: theme.textPrimary, ...ty.small,
              }}
            />
            <Pill label="Set" active={false} onPress={createCat} />
          </View>
        )}
        <Pill label={hideDone ? "Show done" : "Hide done"} active={hideDone} onPress={() => setHideDone(!hideDone)} />
        {!!doneCount && <Pill label="Clear done" active={false} onPress={clearDone} />}
      </ScrollView>

      <View style={{ height: 8, borderRadius: 999, backgroundColor: theme.accentMuted, overflow: "hidden" }}>
        <View style={{ width: `${pct}%`, backgroundColor: theme.accent, height: "100%" }} />
      </View>
      <Text style={{ color: theme.textSecondary, ...ty.small }}>{doneCount}/{total} done</Text>

      <View style={{ gap: 8 }}>
        {ordered.map((it) => (
          <Pressable
            key={it.id}
            onPress={() => toggle(it.id)}
            style={{
              minHeight: 40, paddingHorizontal: s.md, paddingVertical: 8, borderRadius: 10, borderWidth: 1,
              borderColor: theme.line, backgroundColor: it.done ? (theme.name === "dark" ? "rgba(125,137,255,0.20)" : theme.accentMuted) : "transparent",
              flexDirection: "row", alignItems: "center", justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
              <Ionicons name={it.done ? "checkmark-circle" : "ellipse-outline"} size={18} color={it.done ? theme.accent : theme.textSecondary} />
              <Text style={{ color: it.done ? theme.textSecondary : theme.textPrimary, textDecorationLine: it.done ? "line-through" : "none", ...ty.body, flex: 1 }}>
                {it.text}
              </Text>
              {it.cat ? (
                <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: theme.line }}>
                  <Text style={{ color: theme.textSecondary, ...ty.small }}>{it.cat}</Text>
                </View>
              ) : null}
            </View>
            <Pressable onPress={() => del(it.id)} hitSlop={10}><Ionicons name="trash" size={18} color={theme.textSecondary} /></Pressable>
          </Pressable>
        ))}
        {ordered.length === 0 && <Text style={{ color: theme.textSecondary, textAlign: "center", ...ty.small }}>No tasks.</Text>}
      </View>
    </View>
  );
}
