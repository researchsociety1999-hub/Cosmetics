/**
 * Shared discriminated-union return type for admin order mutations.
 *
 * `ok: true`  → the write committed; `message` is the human-readable
 *                confirmation rendered in the inline banner.
 * `ok: false` → the write was rejected or threw; `error` is the
 *                operator-facing message.
 *
 * Kept in its own file so `actions.ts` (a "use server" module) can import
 * the type without exporting it, and the client panel can re-use it too.
 */
export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };
