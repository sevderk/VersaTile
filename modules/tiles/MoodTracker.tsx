import React, { useMemo, useRef, useState } from "react";
import { PanResponder, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeProvider";
import { s } from "../../theme/spacing";
import { type as ty } from "../../theme/typography";

/** ---------- Ortak takvim yardımcıları ---------- **/

const MONDAY_START = true;

const WEEKDAYS = MONDAY_START
  ? ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
  : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const mapDayIndex = (d: number) => (MONDAY_START ? (d + 6) % 7 : d);

const todayISO = () => new Date().toISOString().slice(0, 10);
const iso = (d: Date) => d.toISOString().slice(0, 10);

type Entry = { date: string; mood?: string; note?: string };
type State = { today?: string; history: Entry[] };
type Props = { state: State; setState: (next: State | ((p: State) => State)) => void };

// 7’lik satırlara bölünmüş ay matrisi
function buildMonthRows(y: number, m0: number): (string | null)[][] {
  const first = new Date(y, m0, 1);
  const days = new Date(y, m0 + 1, 0).getDate();
  const firstCol = mapDayIndex(first.getDay()); // 0..6

  const cells: (string | null)[] = [];
  for (let i = 0; i < firstCol; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(iso(new Date(y, m0, d)));
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

/** ------------------------------------------------ **/

const MOODS: { key: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { key: "Great",       icon: "happy",            color: "#CFF4D8" },
  { key: "Good",        icon: "thumbs-up",        color: "#D5E3FF" },
  { key: "Okay",        icon: "checkmark-circle", color: "#E7EEFF" },
  { key: "Calm",        icon: "leaf",             color: "#DFF7EF" },
  { key: "Focused",     icon: "bulb",             color: "#FFF2B8" },
  { key: "Productive",  icon: "briefcase",        color: "#E4E7FF" },
  { key: "Energetic",   icon: "flash",            color: "#FFE29A" },
  { key: "Excited",     icon: "trophy",           color: "#FFD8C2" },
  { key: "Grateful",    icon: "heart",            color: "#FFD6E5" },
  { key: "Social",      icon: "people",           color: "#D9F0FF" },
  { key: "Tired",       icon: "battery-half",     color: "#EEF1F6" },
  { key: "Sleepy",      icon: "moon",             color: "#E6DEFF" },
  { key: "Stressed",    icon: "warning",          color: "#FFD2C9" },
  { key: "Sad",         icon: "sad",              color: "#D8E2FF" },
  { key: "Sick",        icon: "medkit",           color: "#E7F5EA" },
];

export default function MoodTrackerTile({ state, setState }: Props) {
  const { theme } = useTheme();
  const [selected, setSelected] = useState<string>(todayISO());

  const now = new Date();
  const [y, setY] = useState(now.getFullYear());
  const [m, setM] = useState(now.getMonth());

  const map = useMemo(() => {
    const m: Record<string, Entry> = {};
    for (const e of state?.history || []) m[e.date] = e;
    return m;
  }, [state?.history]);

  const colorFor = (mood?: string) => MOODS.find((x) => x.key === mood)?.color;

  const setMoodForSelected = (mood: string) => {
    const d = selected;
    const today = todayISO();
    setState((prev) => {
      const prevList = prev.history || [];
      const prevEntry = prevList.find((x) => x.date === d);
      const others = prevList.filter((x) => x.date !== d);

      const currentMood = prevEntry?.mood ?? (d === today ? prev.today : undefined);
      const isSame = currentMood === mood;

      if (isSame) {
        if (prevEntry?.note) {
          const entry: Entry = { date: d, note: prevEntry.note };
          const next: State = { ...prev, history: [...others, entry] };
          if (d === today) delete next.today;
          return next;
        } else {
          const next: State = { ...prev, history: others };
          if (d === today) delete next.today;
          return next;
        }
      } else {
        const entry: Entry = { date: d, mood, note: prevEntry?.note || "" };
        const next: State = { ...prev, history: [...others, entry] };
        if (d === today) next.today = mood;
        return next;
      }
    });
  };

  const setNote = (t: string) => {
    const d = selected;
    setState((prev) => {
      const others = (prev.history || []).filter((x) => x.date !== d);
      const current = (prev.history || []).find((x) => x.date === d);
      const entry: Entry = { date: d, mood: current?.mood, note: t };
      return { ...prev, history: [...others, entry] };
    });
  };

  const rows = useMemo(() => buildMonthRows(y, m), [y, m]);
  const entry = map[selected];
  const monthLabel = new Date(y, m, 1).toLocaleDateString(undefined, { year: "numeric", month: "long" });

  const go = (delta: number) => {
    const nm = m + delta;
    const ny = y + Math.floor(nm / 12);
    const mm = ((nm % 12) + 12) % 12;
    setY(ny);
    setM(mm);
  };

  const swipeLock = useRef(false);
  const handleSwipe = (dx: number) => {
    if (swipeLock.current) return;
    if (dx > 40) { go(-1); swipeLock.current = true; setTimeout(() => (swipeLock.current = false), 250); }
    else if (dx < -40) { go(1); swipeLock.current = true; setTimeout(() => (swipeLock.current = false), 250); }
  };
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 16 && Math.abs(g.dy) < 12,
      onPanResponderRelease: (_e, g) => handleSwipe(g.dx),
      onPanResponderTerminate: (_e, g) => handleSwipe(g.dx),
    })
  ).current;

  const pressedBg = theme.name === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  return (
    <View style={{ gap: s.md }}>
      {/* mood butonları */}
      <View style={{ flexDirection: "row", gap: s.sm, flexWrap: "wrap" }}>
        {MOODS.map((mo) => {
          const isOn = entry?.mood === mo.key || (selected === todayISO() && state?.today === mo.key);
          return (
            <Pressable
              key={mo.key}
              onPress={() => setMoodForSelected(mo.key)}
              style={({ pressed }) => ({
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isOn ? theme.accent : theme.line,
                backgroundColor: isOn ? theme.accentMuted : pressed ? pressedBg : theme.bgElevated,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              })}
            >
              <Ionicons name={mo.icon} size={16} color={isOn ? theme.accent : theme.textSecondary} />
              <Text style={{ color: theme.textPrimary, ...ty.small }}>{mo.key}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Ay başlık + gezinme */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Pressable onPress={() => go(-1)}><Text style={{ color: theme.textPrimary, ...ty.label }}>‹</Text></Pressable>
        <Text style={{ color: theme.textPrimary, ...ty.label }}>{monthLabel}</Text>
        <Pressable onPress={() => go(1)}><Text style={{ color: theme.textPrimary, ...ty.label }}>›</Text></Pressable>
      </View>

      {/* Hafta başlıkları */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {WEEKDAYS.map((w, i) => (
          <Text key={`${w}-${i}`} style={{ width: 36, textAlign: "center", color: theme.textSecondary, ...ty.small }}>
            {w}
          </Text>
        ))}
      </View>

      {/* Günler: satır satır */}
      <View {...pan.panHandlers} style={{ gap: 6 }}>
        {rows.map((row, rIdx) => (
          <View key={`r-${rIdx}`} style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {row.map((d, cIdx) => {
              if (!d) return <View key={`e-${cIdx}`} style={{ width: 36, height: 44 }} />;
              const e = map[d];
              const dot = colorFor(e?.mood);
              const isSel = selected === d;
              const day = Number(d.slice(8, 10));
              return (
                <Pressable
                  key={d}
                  onPress={() => setSelected(d)}
                  style={{
                    width: 36,
                    height: 44,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: isSel ? theme.accent : theme.line,
                    backgroundColor: theme.bgElevated,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: theme.textPrimary, ...ty.label }}>{day}</Text>
                  {dot ? (
                    <View
                      style={{
                        position: "absolute",
                        bottom: 4,
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        backgroundColor: dot,
                      }}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {/* Not alanı */}
      <View style={{ gap: s.sm }}>
        <Text style={{ color: theme.textSecondary, ...ty.small }}>
          {selected === todayISO() ? "Today's note" : `Note for ${selected}`}
        </Text>
        <TextInput
          value={entry?.note || ""}
          onChangeText={setNote}
          placeholder="Add a note…"
          placeholderTextColor={theme.inputPlaceholder}
          style={{
            minHeight: 60,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.line,
            backgroundColor: theme.bgElevated,
            padding: s.md,
            color: theme.textPrimary,
            ...ty.body,
          }}
          multiline
        />
      </View>
    </View>
  );
}
