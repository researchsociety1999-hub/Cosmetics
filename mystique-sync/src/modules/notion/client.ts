/**
 * Singleton @notionhq/client. Default timeout bumped to 15s because
 * databases with many properties can be slow to enumerate the first time
 * the integration is granted access.
 */
import { Client as NotionClient } from "@notionhq/client";
import { loadEnv } from "../../config/env.js";

let cached: NotionClient | null = null;

export function getNotion(): NotionClient {
  if (cached) return cached;
  const env = loadEnv();
  cached = new NotionClient({
    auth: env.notionKey,
    timeoutMs: 15_000,
  });
  return cached;
}

export function resetNotionForTests(): void {
  cached = null;
}
