/**
 * Tiny wrapper around `p-limit`. Two reasons we don't import p-limit directly:
 *   1. Single chokepoint for tuning concurrency (env-driven default).
 *   2. Optional `delay` argument so we can space out Drive / Notion writes,
 *      which respond well to a small inter-call sleep.
 */
import pLimit from "p-limit";
import { loadEnv } from "../config/env.js";

export type Limiter = <T>(fn: () => Promise<T>) => Promise<T>;

export function createLimiter(concurrency?: number): Limiter {
  let resolved = concurrency;
  if (resolved === undefined) {
    try {
      resolved = loadEnv().syncConcurrency;
    } catch {
      resolved = 3;
    }
  }
  const limit = pLimit(Math.max(1, resolved));
  return <T,>(fn: () => Promise<T>) => limit(fn);
}

/** Resolves after `ms` milliseconds. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sequentially run async tasks with a fixed delay between each. Used by the
 * Drive file-mover, which must space requests by ~100ms to avoid the
 * "User Rate Limit Exceeded" 403.
 */
export async function runWithDelay<T>(
  items: T[],
  delayMs: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  for (let i = 0; i < items.length; i++) {
    // The throwaway `!` is safe — the loop bound proves the index exists.
    await worker(items[i]!, i);
    if (i < items.length - 1 && delayMs > 0) await sleep(delayMs);
  }
}
