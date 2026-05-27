import { CHAT_THEME_LABELS, type ChatTheme } from "../lib/chatThemes";

interface ChatThemePanelProps {
  themes: ReadonlyArray<{ theme: ChatTheme; count: number; percent: number }>;
}

/**
 * "Top themes" sidebar panel — pure server-rendered bar chart using inline
 * widths. Keeps the page footprint zero JS for this block.
 */
export function ChatThemePanel({ themes }: ChatThemePanelProps) {
  return (
    <section
      aria-labelledby="top-themes-heading"
      className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-5"
    >
      <h2
        id="top-themes-heading"
        className="text-[0.7rem] uppercase tracking-[0.24em] text-[#b8ab95]"
      >
        Top themes
      </h2>
      {themes.length === 0 ? (
        <p className="mt-4 text-xs text-[#9a8f7a]">
          No classified turns yet — themes appear once chat traffic is recorded.
        </p>
      ) : (
        <ul className="mt-4 space-y-3 text-sm">
          {themes.map((row) => {
            const widthPct = Math.max(2, Math.round(row.percent * 100));
            return (
              <li key={row.theme}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[#d8c6aa]">
                    {CHAT_THEME_LABELS[row.theme]}
                  </span>
                  <span className="text-[0.7rem] text-[#9a8f7a]">
                    {row.count.toLocaleString("en-US")} ·{" "}
                    {(row.percent * 100).toFixed(0)}%
                  </span>
                </div>
                <div
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[rgba(214,168,95,0.08)]"
                  aria-hidden
                >
                  <div
                    className="h-full rounded-full bg-[#d6a85f]/70"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-4 text-[0.65rem] leading-relaxed text-[#7a7265]">
        Themes are derived from keyword rules in{" "}
        <code className="text-[#9a8f7a]">admin/lib/chatThemes.ts</code>. Edit
        keyword arrays there to tune coverage.
      </p>
    </section>
  );
}
