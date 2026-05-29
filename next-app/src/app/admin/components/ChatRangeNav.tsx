"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ChatRangeTabs } from "./ChatRangeTabs";

type RangeValue = "24h" | "7d" | "30d" | "all";

interface ChatRangeNavProps {
  activeRange: RangeValue;
}

/**
 * Server-page → client-tabs bridge.
 *
 * The chatbot workspace is a server component, but `<ChatRangeTabs>` is a
 * client component that wants an `onRangeChange` callback. This wrapper:
 *   1. Reads the current URL via `usePathname` / `useSearchParams`.
 *   2. On tab change, preserves all other filter params and bumps `range`.
 *   3. Calls `router.replace` so the back stack doesn't accumulate one entry
 *      per tab click.
 *
 * The actual data fetch lives in the server component — when the URL changes,
 * Next re-runs the page with the new searchParams, which picks the appropriate
 * `getChatLogsLast24h/7d/30d` slice helper.
 */
export function ChatRangeNav({ activeRange }: ChatRangeNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function handleRangeChange(range: string) {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    next.set("range", range);
    const url = `${pathname ?? "/admin/chatbot"}?${next.toString()}`;
    startTransition(() => {
      router.replace(url);
    });
  }

  return (
    <ChatRangeTabs
      activeRange={activeRange}
      onRangeChange={handleRangeChange}
    />
  );
}
