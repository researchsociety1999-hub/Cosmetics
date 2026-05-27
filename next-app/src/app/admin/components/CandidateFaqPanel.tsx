interface CandidateFaqPanelProps {
  topics: Array<{ label: string; count: number }>;
}

/**
 * Renders the output of `detectCandidateFaqTopics` (themes seen ≥ 3× in the
 * current window) as a simple ranked list. Stateless / no client JS.
 */
export function CandidateFaqPanel({ topics }: CandidateFaqPanelProps) {
  const max = topics.reduce((acc, t) => Math.max(acc, t.count), 0);

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <header className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Candidate FAQ topics
        </h2>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Themes asked 3+ times in window
        </span>
      </header>

      {topics.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No repeated topics detected in this window.
        </p>
      ) : (
        <ol className="space-y-2">
          {topics.map((topic, idx) => {
            const widthPct = max > 0 ? Math.round((topic.count / max) * 100) : 0;
            return (
              <li
                key={`${topic.label}-${idx}`}
                className="flex items-center gap-3"
              >
                <span className="w-6 text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  {idx + 1}.
                </span>
                <span className="flex-1 truncate text-sm text-zinc-800 dark:text-zinc-200">
                  {topic.label}
                </span>
                <div className="hidden h-2 w-32 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 sm:block">
                  <div
                    className="h-full bg-zinc-400 dark:bg-zinc-500"
                    style={{ width: `${widthPct}%` }}
                    aria-hidden
                  />
                </div>
                <span className="w-10 text-right text-sm font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
                  {topic.count}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <p className="mt-4 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
        Heuristic — grouped by theme classifier. Edit{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          chatThemes.ts
        </code>{" "}
        to tune the keyword rules.
      </p>
    </section>
  );
}
