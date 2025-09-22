import React, { useMemo, useState } from "react";
import { Linking, Pressable, Text, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeProvider";
import { s } from "../../theme/spacing";
import { type as ty } from "../../theme/typography";

export type LinkItem = { id: string; url: string; title?: string; fav?: boolean; tags?: string[]; createdAt?: number };

function valid(v: string) {
  try { const u = new URL(v.startsWith("http") ? v : `https://${v}`); return !!u.host; } catch { return false; }
}
function normalize(v: string) {
  const clean = v.trim();
  return clean.startsWith("http") ? clean : `https://${clean}`;
}
function host(url: string) { try { return new URL(url).host; } catch { return ""; } }

function migrateArr(arr: any): LinkItem[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((it: any) => ({
    id: String(it?.id ?? Date.now() + Math.random()),
    url: String(it?.url ?? ""),
    title: it?.title ?? (it?.url ? host(String(it.url)) : ""),
    fav: !!it?.fav,
    tags: Array.isArray(it?.tags) ? it.tags : [],
    createdAt: Number.isFinite(it?.createdAt) ? it.createdAt : Date.now(),
  })).filter(x => x.url);
}

export default function LinkSaverTile({
  state,
  setState,
}: {
  state: LinkItem[];
  setState: (v: LinkItem[] | ((prev: LinkItem[]) => LinkItem[])) => void;
}) {
  const { theme } = useTheme();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tagText, setTagText] = useState("");
  const [q, setQ] = useState("");
  const [onlyFav, setOnlyFav] = useState(false);

  const list = useMemo(() => {
    const migrated = migrateArr(state);
    return migrated.length ? migrated : (state ?? []);
  }, [state]);

  const add = () => {
    if (!valid(url)) return;
    const n = normalize(url);
    const exists = (list ?? []).some((it) => it.url === n);
    if (exists) { setUrl(""); setTitle(""); return; }
    const now = Date.now();
    setState((cur) => [
      { id: String(now), url: n, title: title.trim() || host(n), fav: false, tags: [], createdAt: now },
      ...(cur ?? []),
    ]);
    setUrl(""); setTitle("");
  };

  const toggleFav = (id: string) =>
    setState((cur) => (cur ?? []).map((it) => (it.id === id ? { ...it, fav: !it.fav } : it)));

  const addTag = (id: string, tag: string) =>
    setState((cur) => (cur ?? []).map((it) => (it.id === id ? { ...it, tags: Array.from(new Set([...(it.tags ?? []), tag])) } : it)));

  const delTag = (id: string, tag: string) =>
    setState((cur) => (cur ?? []).map((it) => (it.id === id ? { ...it, tags: (it.tags ?? []).filter((t) => t !== tag) } : it)));

  const open = (u: string) => Linking.openURL(u).catch(() => {});
  const del = (id: string) => setState((cur) => (cur ?? []).filter((it) => it.id !== id));
  const copy = (u: string) => Clipboard.setStringAsync(u).catch(()=>{});

  const filtered = useMemo(() => {
    const arr = (list ?? []).slice().sort((a, b) => {
      if ((b.fav ? 1 : 0) !== (a.fav ? 1 : 0)) return (b.fav ? 1 : 0) - (a.fav ? 1 : 0);
      return (b.createdAt ?? 0) - (a.createdAt ?? 0);
    });
    const qq = q.toLowerCase();
    const base = qq
      ? arr.filter((i) =>
          (i.title || "").toLowerCase().includes(qq) ||
          (i.url || "").toLowerCase().includes(qq) ||
          (i.tags || []).some((t) => t.toLowerCase().includes(qq))
        )
      : arr;
    return onlyFav ? base.filter((i) => i.fav) : base;
  }, [list, q, onlyFav]);

  const TagChip = ({ label, onRemove }: { label: string; onRemove?: () => void }) => (
    <Pressable
      style={{
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: theme.line,
        backgroundColor: "transparent", flexDirection: "row", alignItems: "center", gap: 6,
      }}
    >
      <Text style={{ color: theme.textSecondary, ...ty.small }}>#{label}</Text>
      {onRemove && <Ionicons name="close" size={14} color={theme.textSecondary} onPress={onRemove} />}
    </Pressable>
  );

  const iconBtnStyle = {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: "transparent",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  };

  return (
    <View style={{ gap: s.sm }}>
      <View style={{ gap: s.sm }}>
        <TextInput
          value={url}
          onChangeText={setUrl}
          placeholder="Save a link (figma.com/file/..)"
          placeholderTextColor={theme.inputPlaceholder}
          autoCapitalize="none"
          onSubmitEditing={add}
          style={{
            height: 44, paddingHorizontal: s.md, borderRadius: 12, borderWidth: 1,
            borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.textPrimary, ...ty.body,
          }}
        />
        <View style={{ flexDirection: "row", gap: s.sm }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Optional title"
            placeholderTextColor={theme.inputPlaceholder}
            onSubmitEditing={add}
            style={{
              flex: 1, height: 44, paddingHorizontal: s.md, borderRadius: 12, borderWidth: 1,
              borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.textPrimary, ...ty.body,
            }}
          />
          <Pressable
            onPress={add}
            style={{
              height: 44, paddingHorizontal: 14, borderRadius: 10,
              backgroundColor: theme.accent,
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", ...ty.label }}>Add</Text>
          </Pressable>
        </View>
      </View>

      {/* Search & fav filter */}
      <View style={{ flexDirection: "row", gap: s.sm }}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search title/url/tag"
          placeholderTextColor={theme.inputPlaceholder}
          style={{
            flex: 1, height: 40, paddingHorizontal: s.md, borderRadius: 10, borderWidth: 1,
            borderColor: theme.inputBorder, backgroundColor: theme.inputBg, color: theme.textPrimary, ...ty.small,
          }}
        />
        <Pressable
          onPress={() => setOnlyFav((v) => !v)}
          style={{
            paddingHorizontal: 12, height: 40, borderRadius: 10, borderWidth: 1, borderColor: theme.line,
            backgroundColor: onlyFav ? theme.accentMuted : "transparent",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Text style={{ color: theme.textPrimary, ...ty.small }}>Favorites</Text>
        </Pressable>
      </View>

      <View style={{ gap: 8 }}>
        {filtered.map((it) => (
          <View
            key={String(it.id)}
            style={{
              minHeight: 48, paddingHorizontal: s.md, paddingVertical: 8, borderRadius: 10, borderWidth: 1,
              borderColor: theme.line, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: s.sm,
            }}
          >
            <Pressable onPress={() => open(it.url)} style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ color: theme.textPrimary, ...ty.body }}>
                {(it.title || host(it.url) || "Untitled").toString()}
              </Text>
              <Text numberOfLines={1} style={{ color: theme.textSecondary, ...ty.small }}>
                {it.url.replace(/^https?:\/\//, "")}
              </Text>
            </Pressable>

            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <Pressable onPress={() => copy(it.url)} hitSlop={10} style={iconBtnStyle}>
                <Ionicons name="copy-outline" size={18} color={theme.textPrimary} />
              </Pressable>
              <Pressable onPress={() => toggleFav(it.id)} hitSlop={10} style={iconBtnStyle}>
                <Ionicons name={it.fav ? "star" : "star-outline"} size={18} color={it.fav ? theme.accent : theme.textSecondary} />
              </Pressable>
              <Pressable onPress={() => del(it.id)} hitSlop={10} style={iconBtnStyle}>
                <Ionicons name="trash-outline" size={18} color={theme.textSecondary} />
              </Pressable>
            </View>
          </View>
        ))}
        {filtered.length === 0 && <Text style={{ color: theme.textSecondary, textAlign: "center", ...ty.small }}>No links.</Text>}
      </View>
    </View>
  );
}
