/**
 * Markdown report writer. Every CLI verb that mutates state hands its
 * results to `buildRunReport()` → `writeReport()`. The output lands in
 * `./reports/<ISO>-<verb>.md` and is gitignored.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { HERO_SKUS_LOCKED_AT, HERO_SKUS_VERSION } from "../config/constants.js";
import type {
  HealthCheckResult,
  HeroUpdateReport,
  ImageReport,
  ImageScanReport,
  MoveReport,
  NotionSyncReport,
  RunReport,
  SupabaseProductRow,
} from "../config/types.js";

const REPORTS_DIR = resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "..",
  "..",
  "reports",
);

function safeSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function fmt(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "yes" : "no";
  return String(v);
}

// ─── Section renderers ───────────────────────────────────────────────────────

function renderHealth(rows: HealthCheckResult[] | undefined): string {
  if (!rows || rows.length === 0) return "";
  const body = rows
    .map((r) => `| ${r.service} | ${r.ok ? "✅" : "❌"} | ${r.latencyMs}ms | ${r.message.replace(/\|/g, "\\|")} |`)
    .join("\n");
  return [
    "## Health checks",
    "",
    "| Service | OK | Latency | Message |",
    "|---|---|---:|---|",
    body,
    "",
  ].join("\n");
}

function renderHeroUpdate(r: HeroUpdateReport | undefined): string {
  if (!r) return "";
  const rows = r.outcomes
    .map(
      (o) =>
        `| ${o.slug} | ${o.status} | ${fmt(o.matched_by)} | ${fmt(o.previous_slug)} → ${o.slug} | ${fmt(o.error)} |`,
    )
    .join("\n");
  return [
    "## Supabase hero-SKU rename",
    "",
    `**updated** ${r.updated} · **already correct** ${r.alreadyCorrect} · **not found** ${r.notFound} · **errors** ${r.errors}`,
    "",
    "| Slug | Status | Matched by | Slug change | Error |",
    "|---|---|---|---|---|",
    rows,
    "",
  ].join("\n");
}

function renderImageScan(r: ImageScanReport | undefined): string {
  if (!r) return "";
  const missing = r.missingImages.length === 0
    ? "_All products have an image_url._"
    : r.missingImages.map((m) => `- \`${m.slug}\` (${m.name})`).join("\n");
  return [
    "## Supabase image scan",
    "",
    `**total** ${r.totalProducts} · **with images** ${r.withImages} · **missing** ${r.missingImages.length}`,
    "",
    "**Missing image_url:**",
    "",
    missing,
    "",
  ].join("\n");
}

function renderProtocol(rows: SupabaseProductRow[] | undefined): string {
  if (!rows) return "";
  const body = rows
    .map(
      (p) =>
        `| ${fmt(p.ritual_order)} | ${fmt(p.category)} | ${p.name} | ${p.slug} | ${fmt(p.is_published)} | ${p.image_url ? "✓" : "—"} |`,
    )
    .join("\n");
  return [
    "## Protocol sequence (live from `get_protocol_sequence()`)",
    "",
    "| # | Category | Name | Slug | Published | Image |",
    "|---:|---|---|---|---|---|",
    body,
    "",
  ].join("\n");
}

function renderNotion(r: NotionSyncReport | undefined): string {
  if (!r) return "";
  const rows = r.outcomes
    .map((o) => `| ${o.slug} | ${o.status} | ${fmt(o.pageId)} | ${fmt(o.error)} |`)
    .join("\n");
  return [
    "## Notion sync",
    "",
    `**created** ${r.created} · **updated** ${r.updated} · **unchanged** ${r.unchanged} · **errors** ${r.errors}`,
    "",
    "| Slug | Status | Page ID | Error |",
    "|---|---|---|---|",
    rows,
    "",
  ].join("\n");
}

function renderDriveMove(r: MoveReport | undefined): string {
  if (!r) return "";
  const moved = r.moved.length ? r.moved.map((f) => `- ${f}`).join("\n") : "_none_";
  const skipped = r.skipped.length
    ? r.skipped.map((s) => `- ${s.file} — _${s.reason}_`).join("\n")
    : "_none_";
  const errors = r.errors.length
    ? r.errors.map((e) => `- ${e.file} — \`${e.error}\``).join("\n")
    : "_none_";
  return [
    "## Drive — file moves",
    "",
    `**moved** ${r.moved.length} · **skipped** ${r.skipped.length} · **errors** ${r.errors.length}`,
    "",
    "**Moved:**",
    "",
    moved,
    "",
    "**Skipped:**",
    "",
    skipped,
    "",
    "**Errors:**",
    "",
    errors,
    "",
  ].join("\n");
}

function renderDriveImages(r: ImageReport | undefined): string {
  if (!r) return "";
  const matched = r.matched.length
    ? r.matched
        .map(
          (m) =>
            `| ${m.slug} | ${m.fileName} | ${m.score.toFixed(2)} | ${m.fileId} | ${
              m.webViewLink ? `[open](${m.webViewLink})` : "—"
            } |`,
        )
        .join("\n")
    : "| — | — | — | — | — |";
  const unmatched = r.unmatched.length
    ? r.unmatched.map((u) => `- \`${u.slug}\` — ${u.reason}`).join("\n")
    : "_none_";
  const errors = r.errors.length
    ? r.errors.map((e) => `- \`${e.slug}\` — ${e.error}`).join("\n")
    : "_none_";
  const written = r.written.length
    ? r.written.map((s) => `- \`${s}\``).join("\n")
    : "_none (dry run, or no slugs needed an update)_";
  return [
    "## Drive — product images",
    "",
    "**Best matches:**",
    "",
    "| Slug | File | Score | File ID | Link |",
    "|---|---|---:|---|---|",
    matched,
    "",
    "**Unmatched:**",
    "",
    unmatched,
    "",
    "**Errors:**",
    "",
    errors,
    "",
    "**Written to Supabase `image_url`:**",
    "",
    written,
    "",
  ].join("\n");
}

// ─── Composition ─────────────────────────────────────────────────────────────

export function renderReportMarkdown(report: RunReport): string {
  const header = [
    "# mystique-sync run report",
    "",
    `- **Started:** ${report.startedAt}`,
    `- **Finished:** ${report.finishedAt}`,
    `- **Mode:** ${report.dryRun ? "🧪 dry run (no writes)" : "🚀 live run"}`,
    `- **Hero SKU lock:** \`v${HERO_SKUS_VERSION}\` (locked at ${HERO_SKUS_LOCKED_AT})`,
    "",
  ].join("\n");

  const sections = [
    renderHealth(report.health),
    renderHeroUpdate(report.heroUpdate),
    renderImageScan(report.imageScan),
    renderProtocol(report.protocolSequence),
    renderNotion(report.notionSync),
    renderDriveMove(report.driveMove),
    renderDriveImages(report.driveImages),
  ].filter((s) => s.length > 0);

  return header + sections.join("\n");
}

/**
 * Persist a report to `./reports/<iso>-<verb>.md`.
 * Returns the absolute path that was written.
 */
export async function writeReport(verb: string, report: RunReport): Promise<string> {
  await mkdir(REPORTS_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${stamp}-${safeSlug(verb) || "run"}.md`;
  const target = join(REPORTS_DIR, filename);
  await writeFile(target, renderReportMarkdown(report), "utf8");
  return target;
}
