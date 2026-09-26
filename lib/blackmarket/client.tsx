"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePlayer } from "@/lib/hc/client";
import { MARKET_MISSION } from "./catalog";
import { emptyMarket, type MarketState } from "./types";

interface Snapshot {
  market: MarketState | null;
  codes: Record<string, string>;
  unlocked: boolean;
}
interface MarketContextValue extends Snapshot {
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  act: (action: Record<string, unknown>) => Promise<Record<string, any>>;
}
const Context = createContext<MarketContextValue | null>(null);
export function MarketProvider({ children }: { children: ReactNode }) {
  const { authenticated, player, refresh } = usePlayer();
  const unlocked = player?.completedTasks.includes(MARKET_MISSION) ?? false;
  const [snapshot, setSnapshot] = useState<Snapshot>({
    market: null,
    codes: {},
    unlocked: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const generation = useRef(0);
  const reload = useCallback(async () => {
    const current = generation.current;
    try {
      const res = await fetch("/api/blackmarket", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (current !== generation.current) return;
      setSnapshot((old) => ({
        ...data,
        market:
          data.market && (old.market?.revision ?? -1) > data.market.revision
            ? old.market
            : data.market,
      }));
      setError("");
    } catch (err) {
      if (current === generation.current)
        setError(err instanceof Error ? err.message : "Няма връзка с архива.");
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    generation.current++;
    if (!authenticated) {
      setSnapshot({ market: null, codes: {}, unlocked: false });
      setLoading(false);
      return;
    }
    setLoading(true);
    void reload();
    const onFocus = () => {
      void reload();
    };
    window.addEventListener("focus", onFocus);
    const timer = setInterval(onFocus, 30000);
    return () => {
      generation.current++;
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [authenticated, unlocked, reload]);
  const act = useCallback(
    async (action: Record<string, unknown>) => {
      const res = await fetch("/api/blackmarket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Операцията не успя.");
      if (data.market)
        setSnapshot((old) => ({
          ...old,
          market:
            (old.market?.revision ?? -1) > data.market.revision
              ? old.market
              : data.market,
        }));
      if (["purchase", "message"].includes(String(action.action)))
        await refresh();
      return data;
    },
    [refresh],
  );
  return (
    <Context.Provider
      value={{ ...snapshot, unlocked, loading, error, reload, act }}
    >
      {children}
    </Context.Provider>
  );
}
export function useMarket() {
  const value = useContext(Context);
  if (!value) throw new Error("MarketProvider is missing");
  return { ...value, market: value.market ?? emptyMarket() };
}
