/**
 * Strips implementation details from auth-related query messages so the UI
 * never exposes backend vendor or env file names to shoppers.
 */
export function sanitizeClientAuthMessage(
  message: string | undefined | null,
): string | undefined {
  if (!message?.trim()) {
    return undefined;
  }
  const m = message.trim();
  if (
    /supabase/i.test(m) ||
    /\.env\.local/i.test(m) ||
    /service role/i.test(m) ||
    /anon key/i.test(m) ||
    /next_public_/i.test(m)
  ) {
    return undefined;
  }
  return m;
}
