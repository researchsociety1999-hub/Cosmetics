import type { KnowledgeGapSignal } from "../lib/chatLogQuery";
import { CHAT_THEME_LABELS } from "../lib/chatThemes";

interface KnowledgeGapPanelProps {
  signals: ReadonlyArray<KnowledgeGapSignal>;
}

function formatDateTime(ts: number): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toISOString();
  }
}

/**
 * Surfaces messages the chatbot most likely failed to answer well.
 *
 * All signals here are heuristic — the `reasons` array carries operator-facing
 * copy so it's clear *why* a row is flagged (e.g. "Asked 3×", "Short generic
 * reply"). No model evaluation, no automatic resolution — this is a backlog
 * for the team to mine when adding FAQ snippets.
 */
export function KnowledgeGapPanel({ signals }: KnowledgeGapPanelProps) {
  return (
    <section
      aria-labelledby="knowledge-gap-heading"
      className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-5"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id="knowledge-gap-heading"
          className="text-[0.7rem] uppercase tracking-[0.24em] text-[#b8ab95]"
        >
          Knowledge gaps
        </h2>
        <span className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
          Heuristic
        </span>
      </div>

      {signals.length === 0 ? (
        <p className="mt-4 text-xs text-[#9a8f7a]">
          No knowledge gaps detected in the recent buffer. Once chat traffic
          includes fallbacks, errors, blocked responses, or repeated questions
          on the same topic, candidates will surface here.
        </p>
      ) : (
        <ul className="mt-4 space-y-3 text-sm">
          {signals.map((signal) => (
            <li
              key={signal.topic}
              className="rounded-[12px] border border-[rgba(214,168,95,0.08)] bg-[rgba(255,255,255,0.015)] p-3"
            >
              <div className="flex items-baseline justify-between gap-2">
                <p
                  className="line-clamp-2 break-words text-[#f5eee3]"
                  title={signal.lastEntry.userMessage}
                >
                  {signal.lastEntry.userMessage}
                </p>
                <span className="shrink-0 text-[0.65rem] uppercase tracking-[0.18em] text-[#9a8f7a]">
                  ×{signal.count}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {signal.reasons.map((reason) => (
                  <span
                    key={reason}
                    className="rounded-full bg-[rgba(214,168,95,0.08)] px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.16em] text-[#d6a85f]"
                  >
                    {reason}
                  </span>
                ))}
                <span className="rounded-full bg-[rgba(255,255,255,0.04)] px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.16em] text-[#9a8f7a]">
                  {CHAT_THEME_LABELS[signal.lastEntry.theme]}
                </span>
              </div>
              <p className="mt-2 text-[0.65rem] text-[#7a7265]">
                Last seen {formatDateTime(signal.lastEntry.ts)}
              </p>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-[0.65rem] leading-relaxed text-[#7a7265]">
        Heuristics: repeated topic, fallback/error/blocked outcome, or short
        generic reply. Tune thresholds in{" "}
        <code className="text-[#9a8f7a]">admin/lib/chatLogQuery.ts</code>.
      </p>
    </section>
  );
}
