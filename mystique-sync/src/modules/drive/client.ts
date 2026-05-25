/**
 * Google Drive client built around `googleapis`.
 *
 * We expose a small typed surface — `listFiles`, `getFile`, `moveFile`,
 * `findFolder` — so the rest of the codebase never imports `googleapis`
 * directly. Easier to mock, easier to swap.
 *
 * Auth: service account via google.auth.JWT. Make sure the service account
 * email (DRIVE_CLIENT_EMAIL) has Editor access to every folder it touches.
 */
import { google, type drive_v3 } from "googleapis";
import { loadEnv } from "../../config/env.js";
import { DRIVE_FOLDER_MIME } from "../../config/constants.js";
import type { DriveFile } from "../../config/types.js";

export interface DriveAPI {
  /** Raw Drive client — escape hatch. Prefer the helpers below. */
  raw: drive_v3.Drive;

  /**
   * List files matching a Drive `q` expression.
   * @see https://developers.google.com/drive/api/guides/search-files
   */
  listFiles(args: {
    q: string;
    pageSize?: number;
    orderBy?: string;
  }): Promise<DriveFile[]>;

  /** Fetch a single file's metadata. Returns null if 404. */
  getFile(fileId: string): Promise<DriveFile | null>;

  /**
   * Move a file by switching its parent. Drive's "move" is just an
   * update with `addParents` + `removeParents`.
   */
  moveFile(args: {
    fileId: string;
    newParentId: string;
    oldParentId: string;
  }): Promise<DriveFile>;

  /**
   * Find a folder by name. By default scopes to `root`; pass `parentId`
   * to look inside a specific folder.
   */
  findFolder(args: { name: string; parentId?: string }): Promise<DriveFile | null>;
}

// ─── Implementation ──────────────────────────────────────────────────────────

const SCOPES = ["https://www.googleapis.com/auth/drive"];
const FIELDS = "id, name, mimeType, parents, resourceKey";
const LIST_FIELDS = `files(${FIELDS})`;

let cached: DriveAPI | null = null;

function buildAuth() {
  const env = loadEnv();
  return new google.auth.JWT({
    email: env.driveClientEmail,
    key: env.drivePrivateKey,
    scopes: SCOPES,
    keyId: env.driveClientId,
  });
}

function toDriveFile(f: drive_v3.Schema$File): DriveFile {
  return {
    id: f.id ?? "",
    name: f.name ?? "",
    mimeType: f.mimeType ?? "",
    parents: f.parents ?? undefined,
    resourceKey: f.resourceKey ?? undefined,
  };
}

function isHttpStatusError(e: unknown, code: number): boolean {
  if (!e || typeof e !== "object") return false;
  const maybe = e as { code?: number; status?: number };
  return maybe.code === code || maybe.status === code;
}

export function getDrive(): DriveAPI {
  if (cached) return cached;

  const auth = buildAuth();
  const drive = google.drive({ version: "v3", auth });

  cached = {
    raw: drive,

    async listFiles({ q, pageSize, orderBy }) {
      const out: DriveFile[] = [];
      let pageToken: string | undefined;
      do {
        const res = await drive.files.list({
          q,
          fields: `nextPageToken, ${LIST_FIELDS}`,
          pageSize: pageSize ?? 200,
          orderBy,
          pageToken,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });
        for (const f of res.data.files ?? []) out.push(toDriveFile(f));
        pageToken = res.data.nextPageToken ?? undefined;
      } while (pageToken);
      return out;
    },

    async getFile(fileId: string) {
      try {
        const res = await drive.files.get({
          fileId,
          fields: FIELDS,
          supportsAllDrives: true,
        });
        return toDriveFile(res.data);
      } catch (e) {
        if (isHttpStatusError(e, 404)) return null;
        throw e;
      }
    },

    async moveFile({ fileId, newParentId, oldParentId }) {
      const res = await drive.files.update({
        fileId,
        addParents: newParentId,
        removeParents: oldParentId,
        fields: "id, name, parents",
        supportsAllDrives: true,
      });
      return toDriveFile(res.data);
    },

    async findFolder({ name, parentId }) {
      // Escape single quotes in the name for the q expression.
      const safe = name.replace(/'/g, "\\'");
      const parts = [
        `mimeType = '${DRIVE_FOLDER_MIME}'`,
        `name = '${safe}'`,
        "trashed = false",
      ];
      if (parentId) parts.push(`'${parentId}' in parents`);
      const matches = await this.listFiles({ q: parts.join(" and "), pageSize: 5 });
      return matches[0] ?? null;
    },
  };

  return cached;
}

export function resetDriveForTests(): void {
  cached = null;
}
