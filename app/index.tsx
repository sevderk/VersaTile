import React from "react";
import { Text, View, FlatList } from "react-native";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Screen from "../components/Screen";
import Button from "../components/Button";
import Tile from "../components/Tile";
import { useTheme } from "../theme/ThemeProvider";
import { useModules } from "../modules/useModules";
import { s } from "../theme/spacing";
import { type as ty } from "../theme/typography";

const CARD_HEIGHT = 100;

export default function Home() {
  const { theme } = useTheme();
  const { modules, state } = useModules();
  const router = useRouter();

  const preview = (id: string) => {
    const v = state[id as keyof typeof state];
    switch (id) {
      case "quickNote": {
        const txt = typeof v === "string" ? v : (v?.draft || v?.notes?.[0]?.text || "");
        return (txt?.slice?.(0, 60) || "Write a quick note…") + (txt && txt.length > 60 ? "…" : "");
      }
      case "checklist": return `${v?.filter?.((t: any)=>t.done).length || 0}/${v?.length || 0} done`;
      case "pomodoro":  return v?.mode === "break" ? "Break" : "Focus";
      case "habitStreak": return `${(v?.habits?.find?.((h:any)=>h.id===v?.activeId)?.marks?.length ?? 0)} marks`;
      case "linkSaver": return `${v?.length || 0} saved links`;
      case "waterTracker": return `${v?.ml || 0} / ${v?.target || 2000} ml`;
      case "counter": return String(v ?? 0);
      case "stopwatch": return `${Math.floor((v?.seconds||0)/60)} min`;
      case "unitConverter": return `${v?.cat || "Length"} converter`;
      case "expenseMini": return `${(v||[]).reduce((s:number,t:any)=>s+t.amount,0).toFixed(2)}`;
      case "passwordGen": return `${(v?.opt?.length || 12)} chars`;
      case "mood": return v?.today ? `Today: ${v.today}` : "How do you feel today?";
      case "breathing": return `${v?.mode === "box" ? "Box 4-4-4" : "4-7-8"} • ${v?.cycles ?? 0} cycles`;
      case "countdown": return v?.iso ? "Countdown set" : "Set a target";
      case "randomPicker": return v?.last ? `Last: ${v.last}` : "Add choices";
      case "routineBuilder": {
        // ✅ Hem eski (steps/history) hem yeni (bank/activeId) şekli destekle
        const rb: any = v || {};
        let stepsArr: any[] = Array.isArray(rb?.steps) ? rb.steps : [];
        if ((!stepsArr || !stepsArr.length) && Array.isArray(rb?.bank)) {
          const active = rb.bank.find((r: any) => r.id === rb.activeId) || rb.bank[0];
          stepsArr = active?.steps || [];
        }
        const steps = stepsArr?.length || 0;
        const total = (stepsArr || []).reduce(
          (a: number, b: any) => a + (Number.isFinite(+b?.minutes) ? +b.minutes : 0),
          0
        );
        return `${steps} steps • ${total} min`;
      }
      default: return "";
    }
  };

  const Header = (
    <LinearGradient
      colors={theme.name === "light" ? ["#FFFFFF", theme.accentMuted] : [theme.bgElevated, "#1B2442"]}
      style={{
        borderRadius: 20,
        marginTop: s.xl,
        borderWidth: 1,
        borderColor: theme.line,
        padding: s.xl,
        marginBottom: s.lg,
      }}
    >
      <Text style={{ color: theme.textPrimary, ...ty.h2 }}>VersaTile</Text>
      <Text style={{ color: theme.textSecondary, marginTop: 6, ...ty.body }}>
        Tap any tile to open it full-screen.
      </Text>

      <View style={{ height: s.sm }} />
      <View style={{ flexDirection: "row", gap: s.sm }}>
        <Link href="/(auth)/login" asChild><Button title="Login" variant="ghost" /></Link>
        <Link href="/settings" asChild><Button title="Settings" variant="ghost" /></Link>
      </View>
    </LinearGradient>
  );

  return (
    <Screen>
      <FlatList
        data={modules}
        keyExtractor={(m) => m.id}
        numColumns={2}
        ListHeaderComponent={Header}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingBottom: s.xl }}
        extraData={state}
        renderItem={({ item: m }) => (
          <View style={{ width: "48%", marginBottom: s.lg }}>
            <Tile
              title={m.title}
              icon={m.icon}
              fixedHeight={CARD_HEIGHT}
              onPress={() =>
                router.push({ pathname: "/modules/[id]", params: { id: m.id } })
              }
            >
              <Text numberOfLines={2} style={{ color: theme.textSecondary, ...ty.small }}>
                {preview(m.id)}
              </Text>
            </Tile>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}
