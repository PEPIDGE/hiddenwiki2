import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionCode } from "@/lib/hc/session";
import { getPlayer } from "@/lib/hc/store";
import {
  comparePages,
  hasMarketAccess,
  MarketError,
  mutateMarket,
  pageCodes,
} from "@/lib/blackmarket/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("purchase"), service: z.string().max(40) }),
  z.object({
    action: z.literal("message"),
    service: z.string().max(40),
    text: z.string().trim().min(1).max(200),
    requestId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("read"),
    service: z.string().max(40),
    through: z.number().finite().nonnegative(),
  }),
  z.object({ action: z.literal("reset") }),
  z.object({
    action: z.literal("install"),
    patch: z.enum(["mailbox-v1", "password-v1"]),
  }),
  z.object({
    action: z.literal("compare"),
    a: z.string().max(40),
    b: z.string().max(40),
  }),
  z.object({ action: z.literal("password") }),
]);
async function session() {
  const code = await getSessionCode();
  const player = code ? await getPlayer(code) : null;
  if (!player) throw new MarketError("Влез отново в профила си.", 401);
  return player;
}
function fail(error: unknown) {
  if (error instanceof MarketError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  if (error instanceof z.ZodError || error instanceof SyntaxError)
    return NextResponse.json({ error: "Невалидна заявка." }, { status: 400 });
  console.error(
    "[blackmarket]",
    error instanceof Error ? error.message : "storage error",
  );
  return NextResponse.json(
    { error: "Връзката с архива прекъсна. Опитай отново." },
    { status: 503 },
  );
}
export async function GET() {
  try {
    const player = await session();
    return NextResponse.json(
      {
        unlocked: hasMarketAccess(player),
        market: hasMarketAccess(player) ? player.blackmarket : null,
        codes: pageCodes(player.code),
        coins: player.coins,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return fail(error);
  }
}
export async function POST(req: NextRequest) {
  try {
    const player = await session();
    if (!hasMarketAccess(player))
      throw new MarketError(
        "Завърши мисията „Некро пощенско клеймо“ в MONEYTASKS.",
        403,
      );
    const raw = await req.text();
    if (raw.length > 4096)
      throw new MarketError("Заявката е твърде голяма.", 413);
    const action = actionSchema.parse(JSON.parse(raw));
    if (action.action === "compare")
      return NextResponse.json({
        comparison: comparePages(player, action.a, action.b),
      });
    if (action.action === "password") {
      if (!player.blackmarket.patches.includes("password-v1"))
        throw new MarketError("Нужен е активиран лиценз от BruteForce.", 403);
      return NextResponse.json({
        username: "GothGirl",
        password: "g0th.g1rl!26",
        source: "Възстановен игрови dump / 13.10.2025 / 18:22",
      });
    }
    const updated = await mutateMarket(player.code, action);
    return NextResponse.json({
      market: updated.blackmarket,
      coins: updated.coins,
    });
  } catch (error) {
    return fail(error);
  }
}
