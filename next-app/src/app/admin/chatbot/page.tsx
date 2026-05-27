import type { Metadata } from "next";
import { AdminShell } from "../components/AdminShell";
import { ChatbotTestConsole } from "../components/ChatbotTestConsole";
import { requireAdminSession } from "../lib/session";

export const metadata: Metadata = {
  title: "Chatbot admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface ChatbotConfigView {
  modelLabel: string;
  apiKeyConfigured: boolean;
  modelConfigured: boolean;
  siteUrl: string;
}

/**
 * Inspects the chatbot's runtime configuration WITHOUT exposing secrets.
 * Only the model name and presence flags cross to the browser.
 */
function getChatbotConfigView(): ChatbotConfigView {
  const apiKeyConfigured = Boolean(process.env.OPENROUTER_API_KEY?.trim());
  const modelRaw = process.env.OPENROUTER_MODEL?.trim() ?? "";
  return {
    modelLabel: modelRaw || "Not set",
    apiKeyConfigured,
    modelConfigured: Boolean(modelRaw),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "(default)",
  };
}

function StatusBadge({ ok, label }: { ok: boolean; label?: string }) {
  const cls = ok
    ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
    : "bg-rose-500/15 text-rose-300 ring-rose-500/30";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.18em] ring-1 ring-inset ${cls}`}
    >
      {label ?? (ok ? "Configured" : "Missing")}
    </span>
  );
}

export default async function AdminChatbotPage() {
  await requireAdminSession("/admin/chatbot");
  const config = getChatbotConfigView();
  const chatReady = config.apiKeyConfigured && config.modelConfigured;

  return (
    <AdminShell pageEyebrow="Mystique admin" pageTitle="Chatbot">
      <p className="mb-6 max-w-3xl text-sm text-[#b8ab95]">
        The Ritual Companion is powered by OpenRouter through the existing{" "}
        <code className="text-[#d8c6aa]">/api/chat</code> route. This page lets
        an operator verify config, send test prompts, and preview what end users
        will see — without leaving the admin.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* ── Live test console ───────────────────────────── */}
        <ChatbotTestConsole chatConfigured={chatReady} />

        {/* ── Config sidebar ───────────────────────────── */}
        <aside className="space-y-6">
          <section
            aria-labelledby="chat-config-heading"
            className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-5"
          >
            <h2
              id="chat-config-heading"
              className="text-[0.7rem] uppercase tracking-[0.24em] text-[#b8ab95]"
            >
              Current config
            </h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
                  Model
                </dt>
                <dd className="mt-1 break-all font-mono text-[0.78rem] text-[#f5eee3]">
                  {config.modelLabel}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
                  OPENROUTER_API_KEY
                </dt>
                <dd>
                  <StatusBadge ok={config.apiKeyConfigured} />
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
                  OPENROUTER_MODEL
                </dt>
                <dd>
                  <StatusBadge ok={config.modelConfigured} />
                </dd>
              </div>
              <div>
                <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-[#7a7265]">
                  NEXT_PUBLIC_SITE_URL
                </dt>
                <dd className="mt-1 break-all font-mono text-[0.72rem] text-[#9a8f7a]">
                  {config.siteUrl}
                </dd>
              </div>
            </dl>
            {!chatReady ? (
              <p className="mt-4 rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-xs leading-relaxed text-rose-200">
                Chatbot is not fully configured. Set both{" "}
                <code className="text-rose-100">OPENROUTER_API_KEY</code> and{" "}
                <code className="text-rose-100">OPENROUTER_MODEL</code> in your
                Vercel environment, then redeploy.
              </p>
            ) : null}
          </section>

          {/* ── Future knowledge controls ───────────────────────────── */}
          <section
            aria-labelledby="future-knowledge-heading"
            className="rounded-[16px] border border-dashed border-[rgba(214,168,95,0.22)] bg-[rgba(214,168,95,0.04)] p-5"
          >
            <h2
              id="future-knowledge-heading"
              className="text-[0.7rem] uppercase tracking-[0.24em] text-[#d6a85f]"
            >
              Knowledge controls — coming next
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-[#d8c6aa]">
              Today the chat context is assembled from the catalog and a
              hard-coded system prompt. The natural follow-up is operator-editable
              knowledge that doesn&apos;t require code deploys:
            </p>
            <ul className="mt-3 space-y-2 text-xs text-[#d8c6aa]">
              <li className="flex gap-2">
                <span aria-hidden className="text-[#d6a85f]">•</span>
                <span>
                  <span className="text-[#f5eee3]">FAQ snippets</span> —
                  short Q&amp;A pairs surfaced when keywords match.
                </span>
              </li>
              <li className="flex gap-2">
                <span aria-hidden className="text-[#d6a85f]">•</span>
                <span>
                  <span className="text-[#f5eee3]">Product guidance</span> —
                  per-SKU usage notes layered into the prompt for product pages.
                </span>
              </li>
              <li className="flex gap-2">
                <span aria-hidden className="text-[#d6a85f]">•</span>
                <span>
                  <span className="text-[#f5eee3]">Brand tone snippets</span> —
                  example exchanges to anchor voice and refusal patterns.
                </span>
              </li>
              <li className="flex gap-2">
                <span aria-hidden className="text-[#d6a85f]">•</span>
                <span>
                  <span className="text-[#f5eee3]">Banned topics</span> —
                  editable refusal list separate from the static prompt.
                </span>
              </li>
            </ul>
            <p className="mt-3 text-[0.7rem] text-[#9a8f7a]">
              All four would live in a small Supabase table (e.g.{" "}
              <code className="text-[#b8ab95]">chatbot_snippets</code>) and be
              fetched by the existing chat-context helper. No new infrastructure
              required.
            </p>
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}
