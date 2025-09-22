import React, { useMemo, useRef, useState, useEffect } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { s } from "../../theme/spacing";
import { type as ty } from "../../theme/typography";

type Step = { id: string; title: string; minutes: number };
type History = { id: string; at: string; totalMinutes: number };
type State = { name: string; steps: Step[]; history: History[] };
type Props = { state: State; setState: (next: State | ((p: State) => State)) => void };

type Routine = { id: string; name: string; steps: Step[]; history: History[] };

export default function RoutineBuilderTile({ state, setState }: Props) {
  const { theme } = useTheme();

  useEffect(() => {
    const st: any = state;
    if (!st.bank) {
      const first: Routine = {
        id: String(Date.now()),
        name: st.name || "My routine",
        steps: st.steps || [],
        history: st.history || [],
      };
      // 🔧 DÜZELTME: Zorunlu alanları korumak için ...p spread edildi
      setState((p: any) => ({ ...p, activeId: first.id, bank: [first] }));
    }
  }, [state, setState]);

  const st: any = state;
  const bank: Routine[] = st.bank || [];
  const activeId: string = st.activeId || (bank[0]?.id ?? "");
  const active =
    useMemo(() => bank.find((r) => r.id === activeId) || { id: "", name: "", steps: [], history: [] }, [bank, activeId]);

  const [form, setForm] = useState<{ title: string; minutes: string }>({ title: "", minutes: "" });
  const [running, setRunning] = useState(false);
  const [idx, setIdx] = useState(0);
  const [remain, setRemain] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalMinutes = useMemo(
    () => (active?.steps || []).reduce((a, b) => a + (b.minutes || 0), 0),
    [active?.steps]
  );

  const updateBank = (updater: (rs: Routine[]) => Routine[]) =>
    setState((p: any) => {
      const b = p.bank || [];
      return { ...p, bank: updater(b) };
    });

  const setActive = (id: string) => setState((p: any) => ({ ...p, activeId: id }));

  const newRoutine = () => {
    const r: Routine = { id: String(Date.now()), name: "New routine", steps: [], history: [] };
    setState((p: any) => ({ ...p, activeId: r.id, bank: [r, ...(p.bank || [])] }));
    reset();
  };

  const renameRoutine = (name: string) =>
    updateBank((rs) => rs.map((r) => (r.id === active.id ? { ...r, name } : r)));

  const deleteRoutine = () => {
    updateBank((rs) => rs.filter((r) => r.id !== active.id));
    setState((p: any) => {
      const left: Routine[] = (p.bank || []).filter((r: Routine) => r.id !== active.id);
      return { ...p, activeId: left[0]?.id, bank: left };
    });
    reset();
  };

  const add = () => {
    const title = form.title.trim();
    const minutes = Math.max(1, Math.round(Number(form.minutes)));
    if (!title || !isFinite(minutes)) return;
    const step: Step = { id: String(Date.now()), title, minutes };
    updateBank((rs) => rs.map((r) => (r.id === active.id ? { ...r, steps: [...(r.steps || []), step] } : r)));
    setForm({ title: "", minutes: "" });
  };

  const del = (id: string) =>
    updateBank((rs) => rs.map((r) => (r.id === active.id ? { ...r, steps: (r.steps || []).filter((x) => x.id !== id) } : r)));

  const up = (i: number) =>
    updateBank((rs) =>
      rs.map((r) => {
        if (r.id !== active.id) return r;
        const steps = [...(r.steps || [])];
        if (i <= 0) return r;
        [steps[i - 1], steps[i]] = [steps[i], steps[i - 1]];
        return { ...r, steps };
      })
    );

  const down = (i: number) =>
    updateBank((rs) =>
      rs.map((r) => {
        if (r.id !== active.id) return r;
        const steps = [...(r.steps || [])];
        if (i >= steps.length - 1) return r;
        [steps[i + 1], steps[i]] = [steps[i], steps[i + 1]];
        return { ...r, steps };
      })
    );

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const pushHistory = () =>
    updateBank((rs) =>
      rs.map((r) =>
        r.id === active.id
          ? { ...r, history: [{ id: String(Date.now()), at: new Date().toISOString(), totalMinutes }, ...(r.history || [])] }
          : r
      )
    );

  const start = () => {
    if (!active?.steps?.length) return;
    setRunning(true);
    setIdx(0);
    setRemain(active.steps[0].minutes * 60);
    stopTimer();
    timerRef.current = setInterval(() => {
      setRemain((r) => {
        if (r <= 1) {
          setIdx((i) => {
            const nextI = i + 1;
            if (nextI >= (active.steps?.length || 0)) {
              setRunning(false);
              stopTimer();
              pushHistory();
              return i;
            } else {
              const next = (active.steps || [])[nextI];
              setRemain((next?.minutes || 0) * 60);
              return nextI;
            }
          });
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  };

  const pause = () => {
    stopTimer();
    setRunning(false);
  };

  const resume = () => {
    if (!active?.steps?.length || remain <= 0) return;
    setRunning(true);
    stopTimer();
    timerRef.current = setInterval(() => {
      setRemain((r) => {
        if (r <= 1) {
          setIdx((i) => {
            const nextI = i + 1;
            if (nextI >= (active.steps?.length || 0)) {
              setRunning(false);
              stopTimer();
              pushHistory();
              return i;
            } else {
              const next = (active.steps || [])[nextI];
              setRemain((next?.minutes || 0) * 60);
              return nextI;
            }
          });
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  };

  const reset = () => {
    stopTimer();
    setRunning(false);
    setIdx(0);
    setRemain(0);
  };

  const fmt = (sec: number) => `${Math.floor(sec / 60).toString().padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;

  return (
    <View style={{ gap: s.md }}>
      {/* Rutin seçici */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: s.sm }}>
        {bank.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => setActive(r.id)}
            style={({ pressed }) => ({
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: r.id === active.id ? theme.accent : theme.line,
              backgroundColor:
                r.id === active.id
                  ? theme.accentMuted
                  : pressed
                  ? theme.name === "dark"
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.04)"
                  : "transparent",
            })}
          >
            <Text style={{ ...ty.small, color: theme.textPrimary }}>{r.name || "Untitled"}</Text>
          </Pressable>
        ))}
        <Pressable
          onPress={newRoutine}
          style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: theme.line }}
        >
          <Text style={{ ...ty.small, color: theme.textPrimary }}>+ New</Text>
        </Pressable>
      </View>

      {/* ad + toplam + rename + delete */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextInput
          placeholder="Routine name"
          placeholderTextColor={theme.inputPlaceholder}
          value={active?.name || ""}
          onChangeText={(t) => renameRoutine(t)}
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
        <Text style={{ marginLeft: s.sm, color: theme.textSecondary, ...ty.small }}>{totalMinutes} min</Text>
        {bank.length > 1 && (
          <Pressable onPress={deleteRoutine} style={{ marginLeft: s.sm }}>
            <Text style={{ color: theme.error, ...ty.small }}>Delete</Text>
          </Pressable>
        )}
      </View>

      {/* ekle */}
      <View style={{ flexDirection: "row", gap: s.sm }}>
        <TextInput
          placeholder="Step title"
          placeholderTextColor={theme.inputPlaceholder}
          value={form.title}
          onChangeText={(t) => setForm((p) => ({ ...p, title: t }))}
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
        <TextInput
          placeholder="Min"
          placeholderTextColor={theme.inputPlaceholder}
          keyboardType="numeric"
          value={form.minutes}
          onChangeText={(t) => setForm((p) => ({ ...p, minutes: t }))}
          style={{
            width: 80,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.line,
            backgroundColor: theme.bgElevated,
            paddingHorizontal: s.md,
            color: theme.textPrimary,
            ...ty.body,
          }}
        />
        <Pressable onPress={add} style={{ paddingHorizontal: 14, borderRadius: 10, backgroundColor: theme.accent, justifyContent: "center" }}>
          <Text style={{ color: "#fff", ...ty.label }}>Add</Text>
        </Pressable>
      </View>

      {/* liste */}
      <FlatList
        data={active?.steps || []}
        keyExtractor={(x) => x.id}
        ItemSeparatorComponent={() => <View style={{ height: s.sm }} />}
        renderItem={({ item, index }) => {
          const isCurrent = running && index === idx;
          return (
            <View
              style={{
                padding: s.md,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.line,
                backgroundColor: isCurrent ? theme.accentMuted : theme.bgElevated,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: theme.textPrimary, ...ty.label }}>
                {index + 1}. {item.title} • {item.minutes}m
              </Text>
              <View style={{ flexDirection: "row", gap: s.sm }}>
                <Pressable onPress={() => up(index)}><Text style={{ color: theme.textPrimary, ...ty.label }}>↑</Text></Pressable>
                <Pressable onPress={() => down(index)}><Text style={{ color: theme.textPrimary, ...ty.label }}>↓</Text></Pressable>
                <Pressable onPress={() => del(item.id)}><Text style={{ color: theme.error, ...ty.label }}>Delete</Text></Pressable>
              </View>
            </View>
          );
        }}
      />

      <View style={{ flexDirection: "row", gap: s.sm, alignItems: "center" }}>
        {!running ? (
          <Pressable onPress={remain ? resume : start} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.accent }}>
            <Text style={{ color: "#fff", ...ty.label }}>{remain ? "Resume" : "Start"}</Text>
          </Pressable>
        ) : (
          <Pressable onPress={pause} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.accent }}>
            <Text style={{ color: "#fff", ...ty.label }}>Pause</Text>
          </Pressable>
        )}
        <Pressable onPress={reset} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: theme.line }}>
          <Text style={{ color: theme.textSecondary, ...ty.label }}>Reset</Text>
        </Pressable>

        {running && active?.steps?.[idx] ? (
          <Text style={{ marginLeft: 8, color: theme.textPrimary, ...ty.h2 }}>
            {active.steps[idx].title}: {fmt(remain)}
          </Text>
        ) : null}
      </View>

      {(active?.history || []).length ? (
        <View style={{ marginTop: s.sm }}>
          <Text style={{ color: theme.textSecondary, ...ty.small, marginBottom: 6 }}>History</Text>
          {(active.history || []).slice(0, 5).map((h) => (
            <Text key={h.id} style={{ color: theme.textPrimary, ...ty.small }}>
              {new Date(h.at).toLocaleString()} • {h.totalMinutes} min
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}
