import { notFound, redirect } from "next/navigation";
import { getSessionCode } from "@/lib/hc/session";
import { getPlayer } from "@/lib/hc/store";
import { hasMarketAccess } from "@/lib/blackmarket/server";
import { getService } from "@/lib/blackmarket/catalog";
import { MarketLocked, MarketView } from "@/components/blackmarket/market";

export const dynamic = "force-dynamic";
export default async function BlackmarketPage({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path = [] } = await params;
  const valid =
    !path.length ||
    (path.length === 1 &&
      ["services", "inbox", "weapons", "substances", "policy"].includes(
        path[0],
      )) ||
    (path.length === 2 && path[0] === "services" && !!getService(path[1]));
  if (!valid) notFound();
  const code = await getSessionCode();
  const player = code ? await getPlayer(code) : null;
  if (!player) redirect("/login");
  if (!hasMarketAccess(player)) return <MarketLocked />;
  return <MarketView segments={path} />;
}
