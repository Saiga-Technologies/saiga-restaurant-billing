import { QueryCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

// Order statuses that mean "bill still open" (not settled, not voided).
export const OPEN_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "served",
] as const;

// Cap per status so a pathological backlog can't blow up read volume.
const MAX_OPEN_PER_STATUS = 200;

/**
 * All still-open orders for an outlet, newest first.
 *
 * Reads only the open rows via the by_outlet_status index — one small range per
 * open status — instead of paging through a take(N) window of mostly-settled
 * history. Keeps the read set (and so both bytes read and reactive
 * invalidations) proportional to the number of bills actually open.
 */
export async function collectOpenOrders(
  ctx: QueryCtx,
  outletId: Id<"outlets">
): Promise<Doc<"restaurant_orders">[]> {
  const perStatus = await Promise.all(
    OPEN_ORDER_STATUSES.map((status) =>
      ctx.db
        .query("restaurant_orders")
        .withIndex("by_outlet_status", (q) =>
          q.eq("outlet_id", outletId).eq("status", status)
        )
        .order("desc")
        .take(MAX_OPEN_PER_STATUS)
    )
  );
  return perStatus.flat().sort((a, b) => b._creationTime - a._creationTime);
}
