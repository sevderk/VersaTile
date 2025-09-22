import { useCallback, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_ORDER,
  STORAGE_KEY,
  type ModuleDef,
  type ModuleId,
  type StateMap,
} from "./types";
import { registry } from "./registry";

const safeParse = (raw: string | null) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const regIds = (): ModuleId[] =>
  (Array.isArray(registry) ? registry.map((m) => m.id) : []) as ModuleId[];

function mergeOrder(saved?: ModuleId[]): ModuleId[] {
  const all = regIds();
  const base = Array.isArray(saved)
    ? (saved.filter((id): id is ModuleId => all.includes(id)) as ModuleId[])
    : [];

  for (const id of all) if (!base.includes(id)) base.push(id);

  if (!base.length) {
    const def = DEFAULT_ORDER.filter((id): id is ModuleId => all.includes(id));
    return def.length ? def : all;
  }
  return base;
}

export function useModules() {
  const [order, setOrder] = useState<ModuleId[]>(() =>
    mergeOrder(DEFAULT_ORDER as ModuleId[])
  );

  const [state, setState] = useState<StateMap>(() =>
    Object.fromEntries(registry.map((m) => [m.id, m.initial])) as StateMap
  );

  const registryById: Record<ModuleId, ModuleDef> = useMemo(() => {
    const list = Array.isArray(registry) ? registry : [];
    return Object.fromEntries(list.map((m) => [m.id, m])) as Record<
      ModuleId,
      ModuleDef
    >;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const parsed = safeParse(await AsyncStorage.getItem(STORAGE_KEY)) || {};
        if (parsed.order) setOrder(mergeOrder(parsed.order as ModuleId[]));
        if (parsed.state && typeof parsed.state === "object") {
          setState((prev) => ({ ...prev, ...(parsed.state as StateMap) }));
        }
      } catch {
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ order, state })
    ).catch(() => {});
  }, [order, state]);

  const setModuleState = useCallback((id: ModuleId, next: any) => {
    setState((prev) => {
      const cur = prev[id];
      const value = typeof next === "function" ? next(cur) : next;
      return { ...prev, [id]: value };
    });
  }, []);

  return {
    modules: order.map((id) => registryById[id]).filter(Boolean),
    state,
    setModuleState,
    setOrder: (next: ModuleId[]) => setOrder(mergeOrder(next)),
  };
}
