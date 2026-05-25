/**
 * Move the 12 remaining loose files in My Drive root into the organized
 * top-level folder structure (see FILE_MOVES in config/constants.ts).
 *
 * Algorithm per file:
 *   1. Look in Drive root first (the spec's expected location).
 *   2. If not found, search globally (`name = '…'`) to find current home.
 *   3. If still not found → record `skipped: not found in root or any subfolder`.
 *   4. If the file is already in the target folder → `skipped: already in correct folder`.
 *   5. Otherwise, run `drive.files.update({ addParents, removeParents })` and
 *      verify the new parent is present by re-reading.
 *   6. Throttle by 100ms between moves (Drive quota friendliness).
 *
 * `dryRun: true` only prints the plan — no Drive writes.
 */
import { getDrive, type DriveAPI } from "./client.js";
import { DRIVE_TOP_FOLDERS, FILE_MOVES, type FileMove } from "../../config/constants.js";
import { loadEnv } from "../../config/env.js";
import { runWithDelay } from "../../utils/rate-limit.js";
import { log } from "../../utils/logger.js";
import type { DriveFile, MoveReport } from "../../config/types.js";

const MOVE_DELAY_MS = 100;

// ─── Folder lookups ──────────────────────────────────────────────────────────

/**
 * Resolve every top-level destination folder name into a Drive file ID.
 * Throws if any expected folder is missing — caller is then expected to bail.
 */
async function resolveTopFolders(drive: DriveAPI): Promise<Map<string, string>> {
  const root = loadEnv().driveRootFolderId ?? "root";
  const map = new Map<string, string>();
  for (const name of DRIVE_TOP_FOLDERS) {
    const folder = await drive.findFolder({ name, parentId: root });
    if (!folder) {
      throw new Error(
        `Top-level Drive folder "${name}" not found under ${root}. ` +
          "Create the folder structure described in README.md before running drive:move-files.",
      );
    }
    map.set(name, folder.id);
  }
  return map;
}

// ─── File lookups ────────────────────────────────────────────────────────────

function escapeName(name: string): string {
  return name.replace(/'/g, "\\'");
}

async function findFileForMove(
  drive: DriveAPI,
  move: FileMove,
): Promise<DriveFile | null> {
  const root = loadEnv().driveRootFolderId ?? "root";
  const safe = escapeName(move.file);

  // Step 1: prefer something already in root.
  const rootQuery =
    move.match === "exact"
      ? `name = '${safe}' and '${root}' in parents and trashed = false`
      : `name contains '${safe}' and '${root}' in parents and trashed = false`;
  const rootMatches = await drive.listFiles({ q: rootQuery, pageSize: 5 });
  if (rootMatches.length > 0) return rootMatches[0] ?? null;

  // Step 2: search globally if not in root.
  const globalQuery =
    move.match === "exact"
      ? `name = '${safe}' and trashed = false`
      : `name contains '${safe}' and trashed = false`;
  const globalMatches = await drive.listFiles({ q: globalQuery, pageSize: 5 });
  return globalMatches[0] ?? null;
}

// ─── Public entry point ──────────────────────────────────────────────────────

export interface MoveOptions {
  dryRun: boolean;
}

export async function moveRemainingFiles(
  drive: DriveAPI = getDrive(),
  options: MoveOptions = { dryRun: false },
): Promise<MoveReport> {
  const scoped = log.scope("drive:file-mover");
  const report: MoveReport = { moved: [], skipped: [], errors: [] };

  let folderIdByName: Map<string, string>;
  try {
    folderIdByName = await resolveTopFolders(drive);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    scoped.error(message);
    // Mark every move as errored so the caller still gets a useful report.
    for (const m of FILE_MOVES) report.errors.push({ file: m.file, error: message });
    return report;
  }

  await runWithDelay([...FILE_MOVES], MOVE_DELAY_MS, async (move) => {
    const targetId = folderIdByName.get(move.target);
    if (!targetId) {
      report.errors.push({
        file: move.file,
        error: `target folder "${move.target}" did not resolve to an ID`,
      });
      return;
    }

    try {
      const file = await findFileForMove(drive, move);
      if (!file) {
        scoped.warn(`Skip ${move.file}: not found in root or any subfolder`);
        report.skipped.push({
          file: move.file,
          reason: "not found in root or any subfolder",
        });
        return;
      }

      const currentParents = file.parents ?? [];
      if (currentParents.includes(targetId)) {
        scoped.info(`Skip ${move.file}: already in ${move.target}`);
        report.skipped.push({
          file: move.file,
          reason: "already in correct folder",
        });
        return;
      }

      if (options.dryRun) {
        scoped.info(
          `[dry-run] would move "${file.name}" (id=${file.id}) from`,
          currentParents.join(",") || "(no parent)",
          `→ ${move.target} (${targetId})`,
        );
        report.moved.push(move.file);
        return;
      }

      // Drive's "move" = update parents. We pick one current parent to remove
      // so we don't multi-parent the file accidentally. (Modern Drive only
      // allows one parent; legacy multi-parent files keep the rest.)
      const oldParentId = currentParents[0] ?? "root";
      const moved = await drive.moveFile({
        fileId: file.id,
        newParentId: targetId,
        oldParentId,
      });

      // Verify: re-fetch and ensure new parent is present.
      const verify = await drive.getFile(moved.id);
      const newParents = verify?.parents ?? [];
      if (!newParents.includes(targetId)) {
        throw new Error(
          `verification failed: parents=${JSON.stringify(newParents)} does not include ${targetId}`,
        );
      }
      scoped.success(`Moved "${file.name}" → ${move.target}`);
      report.moved.push(move.file);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      scoped.error(`Error moving ${move.file}: ${message}`);
      report.errors.push({ file: move.file, error: message });
    }
  });

  return report;
}
