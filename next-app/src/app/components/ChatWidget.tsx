"use client";

import { usePathname } from "next/navigation";
import { RitualCompanionAvatar } from "./RitualCompanionAvatar";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import styles from "./ChatWidget.module.css";
void styles;

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

type WidgetPhase = "closed" | "greeting" | "open";

const GREETING_BUBBLE =
  "Hi ✨ I can help you build a ritual, pick products, and answer ingredient questions.";

const STARTER_MESSAGE =
  "Welcome—I'm your Mystique ritual companion. I can help you shape a morning or evening routine, suggest formulas that fit your goals, and explain ingredients in plain language. What would you like to explore?";

const QUICK_SUGGESTIONS = [
  "Build my routine",
  "Help me choose products",
  "Ingredient question",
] as const;

// Height of the circular launcher button (matches h-[3.65rem] / md:h-[3.9rem]).
// Written to --chat-launcher-h so BackToTopButton can stack above it.
const LAUNCHER_H_MOBILE = 58; // 3.65rem @ 16px base
const LAUNCHER_H_MD = 62; // 3.9rem @ 16px base

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function extractProductSlug(pathname: string): string | undefined {
  const match = /^\/products\/([^/?#]+)/.exec(pathname);
  return match?.[1];
}

/** Keep --chat-launcher-h in sync with the actual breakpoint so
 *  BackToTopButton always stacks cleanly above the chat button. */
function useChatLauncherHeight() {
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(min-width: 768px)");

    const write = () => {
      const h = mq.matches ? LAUNCHER_H_MD : LAUNCHER_H_MOBILE;
      root.style.setProperty("--chat-launcher-h", `${h}px`);
    };

    write();
    mq.addEventListener("change", write);
    return () => mq.removeEventListener("change", write);
  }, []);
}

export function ChatWidget() {
  const pathname = usePathname() ?? "/";
  const panelTitleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const greetingTimerRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<WidgetPhase>("closed");
  const [isWaving, setIsWaving] = useState(false);
  const [showGreetingBubble, setShowGreetingBubble] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  useChatLauncherHeight();

  const hasUserMessage = messages.some((m) => m.role === "user");

  useEffect(() => {
    return () => {
      if (greetingTimerRef.current) {
        window.clearTimeout(greetingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== "open") return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, phase, isSending]);

  useEffect(() => {
    if (phase !== "open") return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(t);
  }, [phase]);

  const openPanel = useCallback(() => {
    setPhase("open");
    setShowGreetingBubble(false);
    setIsWaving(false);

    if (!messages.some((m) => m.role === "assistant")) {
      setMessages([
        {
          id: createId(),
          role: "assistant",
          content: STARTER_MESSAGE,
        },
      ]);
    }
  }, [messages]);

  const handleLauncherClick = useCallback(() => {
    if (phase === "open") {
      setPhase("closed");
      setShowGreetingBubble(false);
      setIsWaving(false);
      return;
    }

    if (phase === "greeting") return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    setPhase("greeting");
    setIsWaving(true);
    setShowGreetingBubble(true);

    if (greetingTimerRef.current) {
      window.clearTimeout(greetingTimerRef.current);
    }

    const greetingDuration = reducedMotion ? 400 : 1100;
    greetingTimerRef.current = window.setTimeout(() => {
      openPanel();
    }, greetingDuration);
  }, [phase, openPanel]);

  const sendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || isSending) return;

      const userMessage: ChatMessage = {
        id: createId(),
        role: "user",
        content: text,
      };

      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setInput("");
      setIsSending(true);

      if (phase !== "open") {
        setPhase("open");
      }

      try {
        const payloadMessages = nextMessages.map(({ role, content }) => ({
          role,
          content,
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: payloadMessages,
            pageContext: {
              pathname,
              pageTitle:
                typeof document !== "undefined" ? document.title : undefined,
              productSlug: extractProductSlug(pathname),
            },
          }),
        });

        const data = (await response.json()) as { message?: string };

        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "assistant",
            content:
              data.message ??
              "Something went quiet for a moment—please try again.",
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "assistant",
            content:
              "I lost the thread for a moment. Please try your question again.",
          },
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [isSending, messages, pathname, phase],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  const handleSuggestion = (label: string) => {
    void sendMessage(label);
  };

  const closePanel = () => {
    setPhase("closed");
    setShowGreetingBubble(false);
    setIsWaving(false);
    if (greetingTimerRef.current) {
      window.clearTimeout(greetingTimerRef.current);
    }
  };

  // Derived bottom position: sit above cookie bar + safe area + 16px gap.
  // All vars are seeded in globals.css :root so the expression never NaNs.
  const launcherBottom = "calc(var(--cookie-bar-h, 0px) + var(--safe-bottom, 0px) + 16px)";

  return (
    <>
      <div
        className="pointer-events-none fixed right-4 z-[60] flex flex-col items-end md:right-6"
        style={{ bottom: launcherBottom }}
        aria-live="polite"
      >
        {showGreetingBubble && phase === "greeting" && (
          <div className="pointer-events-none mb-3 max-w-[15.5rem] mystique-chat-bubble-in rounded-2xl border border-[rgba(214,168,95,0.28)] bg-[rgba(8,7,10,0.94)] px-4 py-3 text-sm leading-relaxed text-[#f6f0e6] shadow-[0_18px_48px_rgba(0,0,0,0.55),0_0_32px_rgba(255,154,60,0.12)] backdrop-blur-md">
            {GREETING_BUBBLE}
          </div>
        )}

        <button
          type="button"
          aria-label={
            phase === "open"
              ? "Close Mystique ritual companion"
              : "Open Mystique ritual companion"
          }
          aria-expanded={phase === "open"}
          aria-controls={panelTitleId}
          onClick={handleLauncherClick}
          className={`pointer-events-auto group relative flex h-[3.65rem] w-[3.65rem] items-center justify-center rounded-full transition-[transform,box-shadow,filter] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#e8c56e] md:h-[3.9rem] md:w-[3.9rem] ${
            isWaving ? "mystique-chat-mascot-wave" : "mystique-chat-mascot-idle"
          } hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(255,154,60,0.22),0_18px_44px_rgba(0,0,0,0.58)] active:scale-[0.97]`}
          style={{
            boxShadow:
              "0 0 0 1px rgba(214,168,95,0.22), 0 0 28px rgba(255,154,60,0.16), 0 18px 48px rgba(0,0,0,0.58)",
          }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_72%,rgba(255,154,60,0.18),transparent_62%)] opacity-80 transition-opacity group-hover:opacity-100"
          />
          <RitualCompanionAvatar
            isWaving={isWaving}
            variant="launcher"
            className="relative"
          />
        </button>
      </div>

      {phase === "open" && (
        <section
          id={panelTitleId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${panelTitleId}-title`}
          className="fixed right-4 z-[59] flex w-[min(100vw-2rem,24.5rem)] flex-col overflow-hidden rounded-[1.35rem] border border-[rgba(214,168,95,0.24)] bg-[rgba(6,7,12,0.92)] shadow-[0_28px_80px_rgba(0,0,0,0.72),0_0_48px_rgba(255,154,60,0.08)] backdrop-blur-xl mystique-chat-panel-in md:right-6"
          style={{
            bottom: `calc(${launcherBottom} + var(--chat-launcher-h, 58px) + 8px)`,
            maxHeight: "min(72vh, 640px)",
          }}
        >
          <header className="flex items-start gap-3 border-b border-[rgba(214,168,95,0.16)] px-4 py-3.5">
            <div className="relative mt-0.5 flex h-9 w-9 shrink-0 items-end justify-center overflow-hidden rounded-full bg-[rgba(255,255,255,0.03)] ring-1 ring-[rgba(214,168,95,0.22)]">
              <RitualCompanionAvatar variant="header" />
            </div>
            <div className="min-w-0 flex-1">
              <h2
                id={`${panelTitleId}-title`}
                className="font-literata text-base tracking-[0.06em] text-[#f6f0e6]"
              >
                Ritual Companion
              </h2>
              <p className="text-xs leading-relaxed text-[#b9aa8f]">
                Routines · products · ingredients
              </p>
            </div>
            <button
              type="button"
              onClick={closePanel}
              aria-label="Close chat"
              className="inline-flex h-8 w-8 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-[rgba(214,168,95,0.18)] text-[#e8c56e] transition hover:border-[rgba(214,168,95,0.38)] hover:bg-[rgba(214,168,95,0.08)]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "rounded-br-md bg-[rgba(214,168,95,0.14)] text-[#f6f0e6] ring-1 ring-[rgba(214,168,95,0.22)]"
                        : "rounded-bl-md bg-[rgba(255,255,255,0.04)] text-[#e8dfd0] ring-1 ring-[rgba(255,255,255,0.06)]"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-[rgba(255,255,255,0.04)] px-3.5 py-2.5 text-sm text-[#b9aa8f] ring-1 ring-[rgba(255,255,255,0.06)]">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff9a3c]" />
                      Composing a gentle reply…
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {!hasUserMessage && (
              <div className="flex flex-wrap gap-2 px-4 pb-2">
                {QUICK_SUGGESTIONS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleSuggestion(label)}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[rgba(214,168,95,0.22)] bg-[rgba(214,168,95,0.06)] px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-[#e8c56e] transition hover:border-[rgba(214,168,95,0.38)] hover:bg-[rgba(214,168,95,0.12)]"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="border-t border-[rgba(214,168,95,0.14)] p-3"
            >
              <div className="flex items-center gap-2">
                <label htmlFor={`${panelTitleId}-input`} className="sr-only">
                  Ask about rituals, products, or ingredients
                </label>
                <input
                  ref={inputRef}
                  id={`${panelTitleId}-input`}
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Ask about your ritual…"
                  disabled={isSending}
                  maxLength={1200}
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-xl border border-[rgba(214,168,95,0.18)] bg-[rgba(0,0,0,0.35)] px-3.5 py-2.5 text-sm text-[#f6f0e6] placeholder:text-[#8f8270] focus:border-[rgba(214,168,95,0.42)] focus:outline-none focus:ring-1 focus:ring-[rgba(255,154,60,0.25)] disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isSending || !input.trim()}
                  aria-label="Send message"
                  className="inline-flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-[rgba(214,168,95,0.28)] bg-[rgba(214,168,95,0.12)] text-[#e8c56e] transition hover:border-[rgba(214,168,95,0.42)] hover:bg-[rgba(214,168,95,0.18)] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" aria-hidden="true">
                    <path d="M5 12h12" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M13 7l5 5-5 5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </>
  );
}
