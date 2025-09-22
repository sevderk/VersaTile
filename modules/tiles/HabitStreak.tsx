import React, { useMemo, useRef, useState } from "react";
import { PanResponder, Pressable, Text, TextInput, View } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { s } from "../../theme/spacing";
import { type as ty } from "../../theme/typography";
import Button from "../../components/Button";

/** ---------- Ortak takvim yardımcıları ---------- **/

// Pazartesi ile başlatmak istiyorsan true yap
const MONDAY_START = true;

const WEEKDAYS = MONDAY_START
  ? ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
  : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Date.getDay(): 0=Sun..6=Sat -> grid sütunu (0..6)
const mapDayIndex = (d: number) => (MONDAY_START ? (d + 6) % 7 : d);

const todayISO = () => new Date().toISOString().slice(0, 10);
const iso = (d: Date) => d.toISOString().slice(0, 10);

type Habit = { id: string; name: string; marks: string[] };
type State = { activeId?: string; habits: Habit[] };
type Props = { state: State; setState: (next: State | ((p: State) => State)) => void };

// Ay hücrelerini üret (leading/trailing boşlukları dahil), 7’lik satırlara böl
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

export default function HabitStreakTile({ state, setState }: Props) {
  const { theme } = useTheme();
  const [newName, setNewName] = useState("");

  const habits = state?.habits ?? [];
  const active = habits.find((h) => h.id === state?.activeId) ?? habits[0];

  const now = new Date();
  const [y, setY] = useState(now.getFullYear());
  const [m, setM] = useState(now.getMonth());
  const rows = useMemo(() => buildMonthRows(y, m), [y, m]);

  const isMarked = (d: string) => !!active?.marks?.includes(d);

  // tek tetiklemeli swipe kilidi
  const swipeLock = useRef(false);
  const go = (delta: number) => {
    const nm = m + delta;
    const ny = y + Math.floor(nm / 12);
    const mm = ((nm % 12) + 12) % 12;
    setY(ny);
    setM(mm);
  };
  const handleSwipe = (dx: number) => {
    if (swipeLock.current) return;
    if (dx > 40) {
      go(-1);
      swipeLock.current = true;
      setTimeout(() => (swipeLock.current = false), 250);
    } else if (dx < -40) {
      go(1);
      swipeLock.current = true;
      setTimeout(() => (swipeLock.current = false), 250);
    }
  };
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 16 && Math.abs(g.dy) < 12,
      onPanResponderRelease: (_e, g) => handleSwipe(g.dx),
      onPanResponderTerminate: (_e, g) => handleSwipe(g.dx),
    })
  ).current;

  const streak = useMemo(() => {
    if (!active) return 0;
    let c = 0;
    const d = new Date();
    while (true) {
      const id = iso(d);
      if (active.marks.includes(id)) {
        c++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return c;
  }, [active?.marks]);

  const toggle = (dateISO: string) => {
    if (!active) return;
    setState((prev) => ({
      ...prev,
      habits: (prev.habits || []).map((h) =>
        h.id !== active.id
          ? h
          : {
              ...h,
              marks: isMarked(dateISO)
                ? h.marks.filter((x) => x !== dateISO)
                : [...h.marks, dateISO],
            }
      ),
    }));
  };

  const addHabit = () => {
    const name = newName.trim();
    if (!name) return;
    const h: Habit = { id: String(Date.now()), name, marks: [] };
    setState((p) => ({ ...p, habits: [...(p.habits || []), h], activeId: h.id }));
    setNewName("");
  };

  const setActive = (id: string) => setState((p) => ({ ...p, activeId: id }));
  const removeActive = () => {
    if (!active) return;
    setState((p) => {
      const rest = (p.habits || []).filter((h) => h.id !== active.id);
      return { ...p, habits: rest, activeId: rest[0]?.id };
    });
  };

  return (
    <View style={{ gap: s.md }}>
      {/* aktif seçim */}
      <View style={{ flexDirection: "row", gap: s.sm, flexWrap: "wrap" }}>
        {habits.map((item) => {
          const on = item.id === active?.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setActive(item.id)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: theme.line,
                backgroundColor: on ? theme.accentMuted : theme.bgElevated,
              }}
            >
              <Text style={{ color: theme.textPrimary, ...ty.label }}>{item.name}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* ekle */}
      <View style={{ flexDirection: "row", gap: s.sm }}>
        <TextInput
          value={newName}
          onChangeText={setNewName}
          placeholder="Add habit (e.g., Read 20m)"
          placeholderTextColor={theme.inputPlaceholder}
          style={{
            flex: 1,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.line,
            backgroundColor: theme.bgElevated,
            paddingHorizontal: s.md,
            color: theme.textPrimary,
            ...ty.body,
          }}
        />
        <Button title="Add" onPress={addHabit} variant="solid" />
      </View>

      {active ? (
        <>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: theme.textPrimary, ...ty.h2 }}>{active.name}</Text>
            <View style={{ flexDirection: "row", gap: s.sm }}>
              <Pressable onPress={() => toggle(todayISO())}>
                <Text style={{ color: theme.accent, ...ty.label }}>Mark today</Text>
              </Pressable>
              <Pressable onPress={removeActive}>
                <Text style={{ color: theme.error, ...ty.label }}>Delete habit</Text>
              </Pressable>
            </View>
          </View>

          {/* Ay başlık + gezinme */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Pressable onPress={() => go(-1)}>
              <Text style={{ color: theme.textPrimary, ...ty.label }}>‹</Text>
            </Pressable>
            <Text style={{ color: theme.textPrimary, ...ty.label }}>
              {new Date(y, m, 1).toLocaleDateString(undefined, { year: "numeric", month: "long" })}
            </Text>
            <Pressable onPress={() => go(1)}>
              <Text style={{ color: theme.textPrimary, ...ty.label }}>›</Text>
            </Pressable>
          </View>

          {/* Hafta başlıkları */}
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {WEEKDAYS.map((w, i) => (
              <Text
                key={`wd-${w}-${i}`}
                style={{ width: 36, textAlign: "center", color: theme.textSecondary, ...ty.small }}
              >
                {w}
              </Text>
            ))}
          </View>

          {/* Günler: satır satır 7’şer */}
          <View {...pan.panHandlers} style={{ gap: 6 }}>
            {rows.map((row, rIdx) => (
              <View key={`r-${rIdx}`} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                {row.map((d, cIdx) => {
                  if (!d) return <View key={`e-${cIdx}`} style={{ width: 36, height: 36 }} />;
                  const on = isMarked(d);
                  const day = Number(d.slice(8, 10));
                  return (
                    <Pressable
                      key={d}
                      onPress={() => toggle(d)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: theme.line,
                        backgroundColor: on ? theme.accent : theme.bgElevated,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: on ? "#fff" : theme.textSecondary, ...ty.label }}>{day}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          <Text style={{ color: theme.textSecondary, ...ty.small }}>{streak} day streak</Text>
        </>
      ) : (
        <Text style={{ color: theme.textSecondary, ...ty.body }}>Add your first habit to start tracking.</Text>
      )}
    </View>
  );
}
