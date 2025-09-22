import React, { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeProvider";
import { s } from "../../theme/spacing";
import { type as ty } from "../../theme/typography";

type Note = { id: string; text: string; pinned?: boolean; createdAt: string; updatedAt?: string };
type State = { notes: Note[]; draft: string; search?: string };
type Props = { state: State; setState: (next: State | ((p: State) => State)) => void };

export default function QuickNoteTile({ state, setState }: Props) {
  const { theme } = useTheme();
  const [editingId, setEditingId] = useState<string | null>(null);

  const notes = Array.isArray(state?.notes) ? state.notes : [];

  const filtered = useMemo(() => {
    const q = (state?.search || "").trim().toLowerCase();
    const list = [...notes].sort(
      (a, b) =>
        Number(!!b.pinned) - Number(!!a.pinned) ||
        (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt)
    );
    if (!q) return list;
    return list.filter((n) => n.text.toLowerCase().includes(q));
  }, [notes, state?.search]);

  const addOrUpdate = () => {
    const text = (state?.draft || "").trim();
    if (!text) return;
    if (editingId) {
      setState((prev) => ({
        ...prev,
        notes: (prev.notes || []).map((n) =>
          n.id === editingId ? { ...n, text, updatedAt: new Date().toISOString() } : n
        ),
        draft: "",
      }));
      setEditingId(null);
    } else {
      const n: Note = {
        id: String(Date.now()),
        text,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pinned: false,
      };
      setState((p) => ({ ...p, notes: [n, ...(p.notes || [])], draft: "" }));
    }
  };

  const edit = (id: string) => {
    const n = notes.find((x) => x.id === id);
    if (!n) return;
    setEditingId(id);
    setState((p) => ({ ...p, draft: n.text }));
  };

  const del = (id: string) =>
    setState((p) => ({ ...p, notes: (p.notes || []).filter((n) => n.id !== id) }));
  const togglePin = (id: string) =>
    setState((p) => ({
      ...p,
      notes: (p.notes || []).map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    }));

  const pressedBg = theme.name === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  return (
    <View style={{ gap: s.md }}>
      {/* search */}
      <View style={{ flexDirection: "row", gap: s.sm }}>
        <TextInput
          placeholder="Search"
          placeholderTextColor={theme.inputPlaceholder}
          value={state?.search || ""}
          onChangeText={(t) => setState((p) => ({ ...p, search: t }))}
          style={{
            flex: 1,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.line,
            backgroundColor: theme.bgElevated,
            paddingHorizontal: s.md,
            paddingVertical: 10,
            color: theme.textPrimary,
            ...ty.small,
          }}
        />
      </View>

      {/* draft */}
      <TextInput
        value={state?.draft || ""}
        placeholder={editingId ? "Edit note…" : "Write a quick note…"}
        placeholderTextColor={theme.inputPlaceholder}
        onChangeText={(t) => setState((p) => ({ ...p, draft: t }))}
        multiline
        textAlignVertical="top"
        style={{
          minHeight: 90,
          borderRadius: 12,
          padding: s.md,
          borderWidth: 1,
          borderColor: theme.line,
          backgroundColor: theme.bgElevated,
          color: theme.textPrimary,
          ...ty.body,
        }}
      />

      <View style={{ flexDirection: "row", gap: s.sm }}>
        <Pressable
          onPress={addOrUpdate}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 10,
            backgroundColor: theme.accent,
          }}
        >
          <Text style={{ color: "#fff", ...ty.label }}>
            {editingId ? "Update" : "Save"}
          </Text>
        </Pressable>

        {editingId ? (
          <Pressable
            onPress={() => {
              setEditingId(null);
              setState((p) => ({ ...p, draft: "" }));
            }}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.line,
            }}
          >
            <Text style={{ color: theme.textSecondary, ...ty.label }}>Cancel</Text>
          </Pressable>
        ) : null}
      </View>

      {/* list */}
      <FlatList
        data={filtered}
        keyExtractor={(n) => n.id}
        ItemSeparatorComponent={() => <View style={{ height: s.sm }} />}
        renderItem={({ item }) => (
          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.line,
              backgroundColor: theme.bgElevated,
              padding: s.md,
              gap: 8,
            }}
          >
            <Text numberOfLines={3} style={{ color: theme.textPrimary, ...ty.body }}>
              {item.text}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                {item.pinned ? (
                  <Ionicons name="pin" size={14} color={theme.accent} />
                ) : null}
                <Text style={{ color: theme.textSecondary, ...ty.small }}>
                  {new Date(item.updatedAt || item.createdAt).toLocaleString()}
                </Text>
              </View>

              <View style={{ flexDirection: "row", gap: s.sm }}>
                <Pressable onPress={() => togglePin(item.id)} style={({ pressed }) => ({ paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8, backgroundColor: pressed ? pressedBg : "transparent" })}>
                  <Text style={{ color: theme.accent, ...ty.label }}>
                    {item.pinned ? "Unpin" : "Pin"}
                  </Text>
                </Pressable>
                <Pressable onPress={() => edit(item.id)} style={({ pressed }) => ({ paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8, backgroundColor: pressed ? pressedBg : "transparent" })}>
                  <Text style={{ color: theme.textSecondary, ...ty.label }}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => del(item.id)} style={({ pressed }) => ({ paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8, backgroundColor: pressed ? pressedBg : "transparent" })}>
                  <Text style={{ color: theme.error, ...ty.label }}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}
