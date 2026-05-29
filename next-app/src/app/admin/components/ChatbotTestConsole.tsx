"use client";

import { useRef, useState } from "react";
import { detectOutcome, type ChatOutcome } from "../lib/chatLog";
import { classifyChatTheme, CHAT_THEME_LABELS, type ChatTheme } from "../lib/chatThemes";

interface ChatMessage {
  role: "user" | "assistant" | "error";
  content: string;
  /** Round-trip latency in ms for assistant turns (purely diagnostic). */
  latencyMs?: number;
  /** Classified outcome for assistant/error rows (server-mirrored on the client). */
  outcome?: ChatOutcome;
  /** Theme classification for user turns. */
  theme?: ChatTheme;
}

const MAX_INPUT_LENGTH = 1200;

const OUTCOME_BADGE: Record<ChatOutcome, { label: string; cls: string }> = {
  success: { label: "Success", cls: "bg-emerald-500/15 text-emerald-300" },
  fallback: { label: "Fallback", cls: "bg-amber-500/15 text-amber-200" },
  blocked: { label: "Blocked", cls: "bg-indigo-500/15 text-indigo-300" },
  error: { label: "Error", cls: "bg-rose-500/15 text-rose-300" },
};

interface ChatbotTestConsoleProps {
  /** True when both OPENROUTER_API_KEY and OPENROUTER_MODEL are present. */
  chatConfigured: boolean;
}

/**
 * Internal-only test console. Sends the conversation to the public `/api/chat`
 * route exactly as the storefront widget does, so what an admin sees here
 * matches what real users get. The chat route enforces its own per-IP rate
 * limit and injection guard — this console does NOT bypass either.
 */
export function ChatbotTestConsole({ chatConfigured }: ChatbotTestConsoleProps) {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || busy) return;
    if (trimmed.length > MAX_INPUT_LENGTH) {
      setError(`Message too long — max ${MAX_INPUT_LENGTH} characters.`);
      return;
    }
    setError(null);

    const userTheme = classifyChatTheme(trimmed);
    const nextHistory: ChatMessage[] = [
      ...history,
      { role: "user", content: trimmed, theme: userTheme },
    ];
    setHistory(nextHistory);
    setInput("");
    setBusy(true);

    const startedAt = performance.now();
    try {
      const conversation = nextHistory
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversation,
          pageContext: { pathname: "/admin/chatbot", pageTitle: "Admin chatbot test" },
          productContext: null,
        }),
      });

      const latencyMs = Math.round(performance.now() - startedAt);

      const text = await response.text();
      let body: { message?: string; error?: string } = {};
      try {
        body = text ? (JSON.parse(text) as { message?: string; error?: string }) : {};
      } catch {
        body = {};
      }

      if (!response.ok) {
        const errorContent =
          body.message ??
          `Request failed with HTTP ${response.status}. ${body.error ?? ""}`.trim();
        setHistory((prev) => [
          ...prev,
          {
            role: "error",
            content: errorContent,
            latencyMs,
            outcome: detectOutcome(response.status, body.message ?? null, body.error ?? null),
          },
        ]);
        return;
      }

      const assistantContent = body.message ?? "(empty response)";
      setHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: assistantContent,
          latencyMs,
          outcome: detectOutcome(
            response.status,
            assistantContent,
            body.error ?? null,
          ),
        },
      ]);
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        {
          role: "error",
          content:
            err instanceof Error
              ? `Network error: ${err.message}`
              : "Network error.",
        },
      ]);
    } finally {
      setBusy(false);
      // Re-focus so the operator can fire follow-up prompts quickly.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function handleReset() {
    setHistory([]);
    setError(null);
    inputRef.current?.focus();
  }

  const disabled = !chatConfigured || busy;

  return (
    <div className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)]">
      <div className="border-b border-[rgba(214,168,95,0.1)] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#b8ab95]">
            Test console
          </p>
          <button
            type="button"
            onClick={handleReset}
            disabled={history.length === 0 && !error}
            className="text-[0.65rem] uppercase tracking-[0.2em] text-[#9a8f7a] underline-offset-4 hover:text-[#d8c6aa] hover:underline disabled:opacity-40"
          >
            Clear
          </button>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#7a7265]">
          Internal testing only. Requests go through the live{" "}
          <code className="text-[#9a8f7a]">/api/chat</code> route — the same one
          the storefront widget uses — including its rate limit and injection
          guard.
        </p>
      </div>

      <div className="flex max-h-[26rem] min-h-[14rem] flex-col gap-3 overflow-y-auto p-5">
        {history.length === 0 ? (
          <p className="m-auto text-center text-sm text-[#7a7265]">
            Send a message below to test the Ritual Companion.
          </p>
        ) : (
          history.map((m, idx) => {
            const alignment =
              m.role === "user" ? "ml-auto" : m.role === "assistant" ? "" : "";
            const toneCls =
              m.role === "user"
                ? "bg-[rgba(214,168,95,0.1)] text-[#f5eee3] ring-1 ring-[rgba(214,168,95,0.2)]"
                : m.role === "assistant"
                  ? "bg-[rgba(255,255,255,0.04)] text-[#d8c6aa] ring-1 ring-[rgba(255,255,255,0.06)]"
                  : "bg-rose-500/10 text-rose-200 ring-1 ring-rose-500/30";
            const outcomeBadge = m.outcome ? OUTCOME_BADGE[m.outcome] : null;
            const themeLabel = m.theme ? CHAT_THEME_LABELS[m.theme] : null;
            return (
              <div
                key={`${m.role}-${idx}`}
                className={`${alignment} max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${toneCls}`}
              >
                <div className="flex flex-wrap items-center gap-2 text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
                  <span>
                    {m.role === "error" ? "Error" : m.role}
                    {m.latencyMs != null ? ` · ${m.latencyMs}ms` : ""}
                  </span>
                  {themeLabel ? (
                    <span className="rounded-full bg-[rgba(214,168,95,0.08)] px-1.5 py-0.5 normal-case tracking-[0.16em] text-[#d6a85f]">
                      {themeLabel}
                    </span>
                  ) : null}
                  {outcomeBadge ? (
                    <span
                      className={`rounded-full px-1.5 py-0.5 normal-case tracking-[0.16em] ${outcomeBadge.cls}`}
                    >
                      {outcomeBadge.label}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 whitespace-pre-wrap">{m.content}</p>
              </div>
            );
          })
        )}
        {busy ? (
          <div className="mr-auto max-w-[85%] rounded-2xl bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[#9a8f7a] ring-1 ring-[rgba(255,255,255,0.06)]">
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
              assistant
            </p>
            <p className="mt-1 italic">Thinking…</p>
          </div>
        ) : null}
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-[rgba(214,168,95,0.1)] p-5"
      >
        <label className="block">
          <span className="sr-only">Message</span>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
            placeholder={
              chatConfigured
                ? "Try a routine question, a product recommendation prompt, an injection attempt…"
                : "Configure OPENROUTER_API_KEY + OPENROUTER_MODEL to enable testing."
            }
            disabled={disabled}
            rows={3}
            maxLength={MAX_INPUT_LENGTH}
            className="mystic-input w-full resize-none text-sm disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSend(e);
              }
            }}
          />
        </label>
        {error ? (
          <p className="mt-2 text-xs text-rose-300" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[0.65rem] text-[#7a7265]">
            <span className="hidden sm:inline">⌘/Ctrl+Enter to send · </span>
            {input.length}/{MAX_INPUT_LENGTH}
          </p>
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="mystic-button-primary inline-flex min-h-[42px] items-center justify-center px-5 text-[0.65rem] uppercase tracking-[0.2em] disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
