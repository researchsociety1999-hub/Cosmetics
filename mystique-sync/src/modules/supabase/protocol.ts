/**
 * Thin wrapper around the `get_protocol_sequence()` Postgres function
 * defined in `sql/04_get_protocol_sequence.sql`.
 *
 * The function is the canonical "what does the Mystique daily ritual look
 * like right now?" query — used by the storefront and by mystique-sync's
 * `supabase:protocol` CLI verb.
 */
import { getSupabase } from "./client.js";
import type { SupabaseProductRow } from "../../config/types.js";

export async function getProtocolSequence(): Promise<SupabaseProductRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("get_protocol_sequence");
  if (error) {
    throw new Error(
      `get_protocol_sequence() failed: ${error.message}. ` +
        "Did you run sql/04_get_protocol_sequence.sql in the Supabase SQL editor?",
    );
  }
  return (data ?? []) as SupabaseProductRow[];
}
