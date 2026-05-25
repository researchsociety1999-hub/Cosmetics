#!/usr/bin/env node
/**
 * mystique-sync — CLI entry point.
 *
 * Verbs (all support --dry-run, --no-report unless noted):
 *   health                  Liveness probes against Supabase, Notion, Drive.
 *   sql:print               Print the 4 SQL files to stdout (paste in Supabase).
 *   supabase:hero-update    Rename + reorder + categorize the 5 hero SKUs.
 *   supabase:scan-images    Report which products still need an image_url.
 *   supabase:protocol       Run get_protocol_sequence() and print the result.
 *   notion:sync             Upsert the 5 hero products into the Notion DB.
 *   drive:move-files        Move the 12 legacy files into folder structure.
 *   drive:find-images       Score and assign best-match images per product.
 *   all                     Run the full pipeline (skips destructive steps in dry-run).
 *   report                  Re-generate a markdown report from a fresh run.
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Command, type Command as CommandT } from "commander";
import chalk from "chalk";

import { loadEnv } from "./config/env.js";
import {
  HERO_SKUS,
  HERO_SKUS_LOCKED_AT,
  HERO_SKUS_VERSION,
} from "./config/constants.js";
import { log } from "./utils/logger.js";
import { runHealthChecks } from "./utils/health-check.js";
import { writeReport } from "./utils/report.js";

import { applyHeroUpdates } from "./modules/supabase/hero-update.js";
import { scanProductsMissingImages } from "./modules/supabase/image-scanner.js";
import { getProtocolSequence } from "./modules/supabase/protocol.js";
import { syncNotionProducts } from "./modules/notion/sync-products.js";
import { moveRemainingFiles } from "./modules/drive/file-mover.js";
import { findProductImages } from "./modules/drive/image-finder.js";

import type {
  HealthCheckResult,
  HeroUpdateReport,
  ImageReport,
  ImageScanReport,
  MoveReport,
  NotionSyncReport,
  RunReport,
  SupabaseProductRow,
} from "./config/types.js";

// ─── Small helpers ───────────────────────────────────────────────────────────

const PKG_ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const SQL_DIR = resolve(PKG_ROOT, "sql");

function nowIso(): string {
  return new Date().toISOString();
}

interface GlobalOptions {
  dryRun: boolean;
  noReport: boolean;
}

function extractGlobals(cmd: CommandT): GlobalOptions {
  const opts = cmd.optsWithGlobals() as Partial<GlobalOptions>;
  return {
    dryRun: Boolean(opts.dryRun),
    noReport: Boolean(opts.noReport),
  };
}

async function persistReport(verb: string, report: RunReport, opts: GlobalOptions): Promise<void> {
  if (opts.noReport) return;
  try {
    const path = await writeReport(verb, report);
    log.info(`Report written: ${path}`);
  } catch (err) {
    log.error("Failed to write report:", err instanceof Error ? err.message : err);
  }
}

function banner(): void {
  // Don't leak env validation failures here — banner runs before any verb.
  const line = chalk.gray("─".repeat(64));
  console.log(line);
  console.log(
    chalk.bold(`  ✦ mystique-sync `) +
      chalk.gray(`v1.0.0  ·  hero-skus v${HERO_SKUS_VERSION} (locked ${HERO_SKUS_LOCKED_AT})`),
  );
  console.log(line);
}

function printHealthTable(rows: HealthCheckResult[]): void {
  for (const r of rows) {
    const tag = r.ok ? chalk.green("✓") : chalk.red("✗");
    const svc = chalk.bold(r.service.padEnd(8));
    console.log(`  ${tag} ${svc} ${chalk.gray(`${r.latencyMs}ms`)}  ${r.message}`);
  }
}

function exitCodeFor(report: RunReport): number {
  if (report.health?.some((h) => !h.ok)) return 2;
  if (report.heroUpdate?.errors) return 1;
  if (report.notionSync?.errors) return 1;
  if (report.driveMove?.errors.length) return 1;
  if (report.driveImages?.errors.length) return 1;
  return 0;
}

// ─── Verb implementations ───────────────────────────────────────────────────

async function cmdHealth(opts: GlobalOptions): Promise<void> {
  loadEnv(); // surface missing-env errors early
  log.step("Health checks");
  const rows = await runHealthChecks();
  printHealthTable(rows);
  const report: RunReport = {
    startedAt: nowIso(),
    finishedAt: nowIso(),
    dryRun: opts.dryRun,
    health: rows,
  };
  await persistReport("health", report, opts);
  process.exit(rows.every((r) => r.ok) ? 0 : 2);
}

async function cmdSqlPrint(): Promise<void> {
  const files = [
    "01_auto_slug_trigger.sql",
    "02_update_hero_skus.sql",
    "03_set_ritual_order.sql",
    "04_get_protocol_sequence.sql",
  ];
  for (const f of files) {
    const target = resolve(SQL_DIR, f);
    const body = await readFile(target, "utf8");
    console.log(chalk.bold.cyan(`\n-- ============== ${f} ==============`));
    console.log(body);
  }
}

async function cmdSupabaseHeroUpdate(opts: GlobalOptions): Promise<void> {
  loadEnv();
  log.step(`Supabase hero rename ${opts.dryRun ? "(dry-run)" : "(live)"}`);
  const result = await applyHeroUpdates({ dryRun: opts.dryRun });
  log.info(
    `updated=${result.updated} already-correct=${result.alreadyCorrect} ` +
      `not-found=${result.notFound} errors=${result.errors}`,
  );
  await persistReport("supabase-hero-update", {
    startedAt: nowIso(),
    finishedAt: nowIso(),
    dryRun: opts.dryRun,
    heroUpdate: result,
  }, opts);
  process.exit(result.errors ? 1 : 0);
}

async function cmdSupabaseScanImages(opts: GlobalOptions): Promise<void> {
  loadEnv();
  log.step("Supabase image scan");
  const result = await scanProductsMissingImages();
  log.info(
    `total=${result.totalProducts} with-image=${result.withImages} missing=${result.missingImages.length}`,
  );
  for (const m of result.missingImages) log.info(` · missing image: ${m.slug} (${m.name})`);
  await persistReport("supabase-scan-images", {
    startedAt: nowIso(),
    finishedAt: nowIso(),
    dryRun: opts.dryRun,
    imageScan: result,
  }, opts);
}

async function cmdSupabaseProtocol(opts: GlobalOptions): Promise<void> {
  loadEnv();
  log.step("Supabase protocol sequence");
  const rows = await getProtocolSequence();
  console.log(JSON.stringify(rows, null, 2));
  await persistReport("supabase-protocol", {
    startedAt: nowIso(),
    finishedAt: nowIso(),
    dryRun: opts.dryRun,
    protocolSequence: rows,
  }, opts);
}

async function cmdNotionSync(opts: GlobalOptions): Promise<void> {
  loadEnv();
  log.step(`Notion sync ${opts.dryRun ? "(dry-run)" : "(live)"}`);
  const result = await syncNotionProducts({ dryRun: opts.dryRun });
  log.info(
    `created=${result.created} updated=${result.updated} ` +
      `unchanged=${result.unchanged} errors=${result.errors}`,
  );
  await persistReport("notion-sync", {
    startedAt: nowIso(),
    finishedAt: nowIso(),
    dryRun: opts.dryRun,
    notionSync: result,
  }, opts);
  process.exit(result.errors ? 1 : 0);
}

async function cmdDriveMove(opts: GlobalOptions): Promise<void> {
  loadEnv();
  log.step(`Drive: move legacy files ${opts.dryRun ? "(dry-run)" : "(live)"}`);
  const result = await moveRemainingFiles(undefined, { dryRun: opts.dryRun });
  log.info(
    `moved=${result.moved.length} skipped=${result.skipped.length} errors=${result.errors.length}`,
  );
  await persistReport("drive-move-files", {
    startedAt: nowIso(),
    finishedAt: nowIso(),
    dryRun: opts.dryRun,
    driveMove: result,
  }, opts);
  process.exit(result.errors.length ? 1 : 0);
}

async function cmdDriveFindImages(opts: GlobalOptions, onlyMissing: boolean): Promise<void> {
  loadEnv();
  log.step(`Drive: find product images ${opts.dryRun ? "(dry-run)" : "(live)"}`);
  const result = await findProductImages(undefined, undefined, {
    dryRun: opts.dryRun,
    onlyMissing,
  });
  log.info(
    `matched=${result.matched.length} unmatched=${result.unmatched.length} ` +
      `errors=${result.errors.length} written=${result.written.length}`,
  );
  await persistReport("drive-find-images", {
    startedAt: nowIso(),
    finishedAt: nowIso(),
    dryRun: opts.dryRun,
    driveImages: result,
  }, opts);
  process.exit(result.errors.length ? 1 : 0);
}

async function cmdAll(opts: GlobalOptions): Promise<void> {
  loadEnv();
  const startedAt = nowIso();

  log.step("Phase 1 / 5 — Health");
  const health = await runHealthChecks();
  printHealthTable(health);
  if (health.some((h) => !h.ok)) {
    log.error("One or more services are unhealthy. Aborting pipeline.");
    const report: RunReport = { startedAt, finishedAt: nowIso(), dryRun: opts.dryRun, health };
    await persistReport("all", report, opts);
    process.exit(2);
  }

  log.step(`Phase 2 / 5 — Supabase hero rename ${opts.dryRun ? "(dry-run)" : "(live)"}`);
  let heroUpdate: HeroUpdateReport | undefined;
  try {
    heroUpdate = await applyHeroUpdates({ dryRun: opts.dryRun });
  } catch (err) {
    log.error("Hero update failed:", err instanceof Error ? err.message : err);
  }

  log.step("Phase 3 / 5 — Supabase image scan + protocol sequence");
  let imageScan: ImageScanReport | undefined;
  let protocol: SupabaseProductRow[] | undefined;
  try { imageScan = await scanProductsMissingImages(); } catch (err) {
    log.error("Image scan failed:", err instanceof Error ? err.message : err);
  }
  try { protocol = await getProtocolSequence(); } catch (err) {
    log.warn(
      "Protocol sequence unavailable (did you run sql/04_get_protocol_sequence.sql?):",
      err instanceof Error ? err.message : err,
    );
  }

  log.step(`Phase 4 / 5 — Drive moves + image discovery ${opts.dryRun ? "(dry-run)" : "(live)"}`);
  let driveMove: MoveReport | undefined;
  let driveImages: ImageReport | undefined;
  try { driveMove = await moveRemainingFiles(undefined, { dryRun: opts.dryRun }); } catch (err) {
    log.error("Drive move failed:", err instanceof Error ? err.message : err);
  }
  try {
    driveImages = await findProductImages(undefined, undefined, {
      dryRun: opts.dryRun,
      onlyMissing: true,
    });
  } catch (err) {
    log.error("Drive image-finder failed:", err instanceof Error ? err.message : err);
  }

  log.step(`Phase 5 / 5 — Notion sync ${opts.dryRun ? "(dry-run)" : "(live)"}`);
  let notionSync: NotionSyncReport | undefined;
  try {
    notionSync = await syncNotionProducts({ dryRun: opts.dryRun });
  } catch (err) {
    log.error("Notion sync failed:", err instanceof Error ? err.message : err);
  }

  const report: RunReport = {
    startedAt,
    finishedAt: nowIso(),
    dryRun: opts.dryRun,
    health,
    ...(heroUpdate ? { heroUpdate } : {}),
    ...(imageScan ? { imageScan } : {}),
    ...(protocol ? { protocolSequence: protocol } : {}),
    ...(driveMove ? { driveMove } : {}),
    ...(driveImages ? { driveImages } : {}),
    ...(notionSync ? { notionSync } : {}),
  };

  await persistReport("all", report, opts);
  log.success("Pipeline complete.");
  process.exit(exitCodeFor(report));
}

async function cmdReport(opts: GlobalOptions): Promise<void> {
  // Convenience: same as `all` but always writes a report regardless of flags.
  await cmdAll({ ...opts, noReport: false });
}

// ─── CLI wiring ─────────────────────────────────────────────────────────────

function main(): void {
  banner();

  const program = new Command();
  program
    .name("mystique-sync")
    .description("Sync pipeline for Mystique Skincare (Supabase + Notion + Drive)")
    .version("1.0.0")
    .option("--dry-run", "do not perform writes; show planned operations", false)
    .option("--no-report", "skip writing the markdown report under reports/", false);

  program
    .command("health")
    .description("Verify Supabase / Notion / Drive credentials and reachability")
    .action(async function (this: CommandT) { await cmdHealth(extractGlobals(this)); });

  program
    .command("sql:print")
    .description("Print all 4 SQL files (paste into Supabase SQL editor)")
    .action(async () => { await cmdSqlPrint(); });

  program
    .command("supabase:hero-update")
    .description("Rename + reorder + categorize the 5 locked hero SKUs")
    .action(async function (this: CommandT) { await cmdSupabaseHeroUpdate(extractGlobals(this)); });

  program
    .command("supabase:scan-images")
    .description("Report products missing image_url")
    .action(async function (this: CommandT) { await cmdSupabaseScanImages(extractGlobals(this)); });

  program
    .command("supabase:protocol")
    .description("Run get_protocol_sequence() and print rows as JSON")
    .action(async function (this: CommandT) { await cmdSupabaseProtocol(extractGlobals(this)); });

  program
    .command("notion:sync")
    .description("Upsert HERO_SKUS into the Notion Hero Product Lineup database")
    .action(async function (this: CommandT) { await cmdNotionSync(extractGlobals(this)); });

  program
    .command("drive:move-files")
    .description("Move legacy files from My Drive root into the organized folder tree")
    .action(async function (this: CommandT) { await cmdDriveMove(extractGlobals(this)); });

  program
    .command("drive:find-images")
    .description("Score Drive images and (optionally) populate empty Supabase image_url")
    .option("--all-products", "search every hero SKU (default: only those missing image_url)", false)
    .action(async function (this: CommandT) {
      const local = this.opts<{ allProducts?: boolean }>();
      await cmdDriveFindImages(extractGlobals(this), !local.allProducts);
    });

  program
    .command("all")
    .description("Run health → hero rename → scan → drive moves → image find → notion sync")
    .action(async function (this: CommandT) { await cmdAll(extractGlobals(this)); });

  program
    .command("report")
    .description("Run the full pipeline and write a markdown report (alias for `all`)")
    .action(async function (this: CommandT) { await cmdReport({ ...extractGlobals(this), noReport: false }); });

  program
    .command("list")
    .description("Print the 5 locked HERO_SKUS as a quick sanity check")
    .action(() => {
      for (const p of HERO_SKUS) {
        console.log(
          chalk.gray(String(p.ritual_order).padStart(2)) +
            "  " + chalk.bold(p.name.padEnd(28)) +
            "  " + chalk.cyan(p.slug.padEnd(26)) +
            "  " + chalk.gray(p.category),
        );
      }
    });

  program.parseAsync(process.argv).catch((err) => {
    log.error(err instanceof Error ? err.stack ?? err.message : String(err));
    process.exit(1);
  });
}

main();
