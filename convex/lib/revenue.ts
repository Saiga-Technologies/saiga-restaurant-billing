import { MutationCtx, QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Denormalized all-time settled revenue per outlet, kept in the `counters`
 * table under `total_revenue:{outletId}` (same convention as
 * `order_number:{outletId}`).
 *
 * Every site that moves an order into or out of "paid" must call
 * `bumpOutletRevenue` with ±order.total, so dashboard reads stay a single
 * document instead of a full scan of the outlet's paid history. Backfill /
 * repair with `npx convex run migrations:backfillRevenueCounters`.
 */
export function revenueCounterKey(outletId: Id<"outlets">): string {
  return `total_revenue:${outletId}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function readOutletTotalRevenue(
  ctx: QueryCtx,
  outletId: Id<"outlets">
): Promise<number> {
  const counter = await ctx.db
    .query("counters")
    .withIndex("by_key", (q) => q.eq("key", revenueCounterKey(outletId)))
    .first();
  return counter?.value ?? 0;
}

export async function bumpOutletRevenue(
  ctx: MutationCtx,
  outletId: Id<"outlets"> | undefined,
  delta: number
): Promise<void> {
  // Legacy rows without outlet_id are invisible to outlet-scoped stats, so
  // they don't contribute to the counter either.
  if (!outletId || delta === 0) return;
  const key = revenueCounterKey(outletId);
  const counter = await ctx.db
    .query("counters")
    .withIndex("by_key", (q) => q.eq("key", key))
    .first();
  if (counter) {
    await ctx.db.patch(counter._id, { value: round2(counter.value + delta) });
  } else {
    await ctx.db.insert("counters", { key, value: round2(Math.max(0, delta)) });
  }
}
