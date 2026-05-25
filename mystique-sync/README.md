# mystique-sync

A purpose-built sync pipeline for **Mystique Skincare** that keeps three
systems in lockstep:

| System         | Role                                                         |
|----------------|--------------------------------------------------------------|
| Supabase       | Source of truth for the live catalog (`products` table)      |
| Notion         | Brand HQ — Hero Product Lineup database                      |
| Google Drive   | Asset archive (brand bible, content, legal, product images)  |

The 5 hero SKUs, their slugs, ritual order, and category are **locked**.
Every other field (price, description, image_url, is_published) is owned by
Supabase. mystique-sync never overwrites those during a rename.

---

## Locked hero catalog

| # | Name                       | Slug                          | Ritual | Category   |
|---|----------------------------|-------------------------------|--------|------------|
| 1 | Soft Reset Cleansing Gel   | `soft-reset-cleansing-gel`    | 1      | cleanser   |
| 2 | Calm Layer Toning Essence  | `calm-layer-toning-essence`   | 2      | essence    |
| 3 | Hydrating Serum            | `hydrating-serum`             | 3      | serum      |
| 4 | Barrier Replenish Cream    | `barrier-replenish-cream`     | 4      | cream      |
| 5 | Light Veil SPF 50 Fluid    | `light-veil-spf-50-fluid`     | 5      | sunscreen  |

The catalog is source-controlled in `src/data/hero-skus.json` and frozen
at load time (`HERO_SKUS_VERSION`).

---

## Prerequisites

- Node **20+** (Node 22 verified)
- pnpm, yarn, or npm
- A Supabase project with a `products` table
- A Notion integration token with access to your "Hero Product Lineup" DB
- A Google service account with Editor access to the relevant Drive folders

---

## Install

```bash
pnpm install      # or: yarn install / npm install
cp .env.example .env
# fill in the secrets
```

### .env quick map

| Var                          | Where to get it                                                                |
|------------------------------|--------------------------------------------------------------------------------|
| `SUPABASE_URL`               | Supabase Dashboard → Project Settings → API                                    |
| `SUPABASE_KEY`               | Same page, **service_role** key (server-side only)                             |
| `NOTION_KEY`                 | https://www.notion.so/profile/integrations → New internal integration          |
| `NOTION_HERO_PRODUCT_DB_ID`  | Open the Notion DB → … menu → "Copy link" → the 32-char ID in the URL          |
| `DRIVE_CLIENT_EMAIL`         | Google Cloud Console → IAM & Admin → Service Accounts → key JSON `client_email`|
| `DRIVE_CLIENT_ID`            | Same JSON, `client_id`                                                         |
| `DRIVE_PRIVATE_KEY`          | Same JSON, `private_key` (keep the surrounding `\n` sequences)                 |
| `DRIVE_ROOT_FOLDER_ID`       | (Optional) ID of a custom parent if folders aren't at My Drive root            |
| `LOG_LEVEL`                  | `debug` / `info` / `warn` / `error` (default: `info`)                          |
| `SYNC_CONCURRENCY`           | Concurrency cap for Notion + Drive writes (default: `3`)                       |

---

## Bootstrap order (first run)

mystique-sync expects three things to be set up in your platforms before
the pipeline can do useful work:

### 1. Supabase — run the SQL files (one time)

Open the **Supabase SQL Editor** and run the files in this order. You can
print them locally with `pnpm sql:print`.

| Order | File                                  | Purpose                                                              |
|------:|---------------------------------------|----------------------------------------------------------------------|
| 1     | `sql/01_auto_slug_trigger.sql`        | Auto-fill `products.slug` from `name` when missing                   |
| 2     | `sql/02_update_hero_skus.sql`         | Rename existing rows to the 5 locked names (preserves price/img/etc) |
| 3     | `sql/03_set_ritual_order.sql`         | Adds `category` column, assigns `ritual_order` 1..5                  |
| 4     | `sql/04_get_protocol_sequence.sql`    | RPC returning published products in ritual order                     |

> The `02` and `03` SQL scripts are **idempotent and additive** — they only
> write `name`, `slug`, `ritual_order`, `category`, and `updated_at`. They
> never touch `is_published`, `price`, `description`, or `image_url`.

### 2. Notion — create the "Hero Product Lineup" database

The DB must have these properties (case-sensitive):

| Property      | Type        | Notes                                                              |
|---------------|-------------|--------------------------------------------------------------------|
| `Name`        | Title       | The product display name                                           |
| `Slug`        | Rich Text   | mystique-sync queries by this — keep it exact                      |
| `RitualOrder` | Number      | 1..5                                                               |
| `Category`    | Select      | options: `cleanser`, `essence`, `serum`, `cream`, `sunscreen`      |
| `Price`       | Number      | USD                                                                |
| `Description` | Rich Text   |                                                                    |
| `Published`   | Checkbox    | mirrors `products.is_published`                                    |
| `ImageURL`    | URL         | populated from Supabase if Drive finder writes one back            |

After creating the database:

1. Click **… → Connections** and add your `NOTION_KEY` integration.
2. Copy the **database ID** (32 chars in the URL) into `NOTION_HERO_PRODUCT_DB_ID`.

### 3. Google Drive — share folders with the service account

These 7 top-level folders must already exist at the Drive root (or under
`DRIVE_ROOT_FOLDER_ID`):

```
01_Master-System
02_Product-System
03_Content-and-Campaigns
04_Platform-and-Tech
05_Business-and-Legal
06_References
99_Archive-Legacy
```

Share each with `DRIVE_CLIENT_EMAIL` as **Editor**.

---

## CLI verbs

```bash
pnpm health                 # ping Supabase + Notion + Drive
pnpm dev list               # print the 5 locked hero SKUs

pnpm dev sql:print          # echo all 4 SQL files
pnpm supabase:hero          # rename hero SKUs (use --dry-run first)
pnpm supabase:scan          # list products missing image_url
pnpm supabase:protocol      # print get_protocol_sequence() output

pnpm notion:sync            # upsert hero SKUs into Notion DB
pnpm drive:move             # move 12 legacy files into folder tree
pnpm drive:images           # find best-match product images in Drive

pnpm sync:all               # full pipeline (live)
pnpm sync:all:dry           # full pipeline (no writes, just plan + report)
pnpm report                 # alias for `all`, always writes a report
```

All verbs accept:

| Flag           | Effect                                                |
|----------------|-------------------------------------------------------|
| `--dry-run`    | Plan-only; no writes to any external service          |
| `--no-report`  | Suppress the markdown report under `reports/`         |

Markdown reports land in `./reports/<ISO>-<verb>.md` (gitignored).

---

## Safety guarantees

1. **Hero rename never touches sensitive columns.** `applyHeroUpdates()`
   builds an `UPDATE` payload that contains only `name`, `slug`,
   `ritual_order`, `category`, and `updated_at`. The brief's invariant on
   `is_published / price / description / image_url` is enforced *in code*,
   not just in SQL.
2. **Image write-back is one-way: empty → set.** `setProductImageIfEmpty`
   reads the current `image_url` and refuses to write if it's non-empty.
3. **Drive moves verify themselves.** After every `update({addParents, …})`
   we re-fetch the file and assert the new parent is present.
4. **Dry-run is everywhere.** Every verb supports `--dry-run`. The `all`
   pipeline propagates the flag to each phase.
5. **No service-role key in dist or git.** `.env` is gitignored; only
   `.env.example` ships.

---

## File map

```
mystique-sync/
├── src/
│   ├── index.ts                       — CLI orchestrator
│   ├── config/
│   │   ├── env.ts                     — env loader + validator
│   │   ├── constants.ts               — HERO_SKUS, FILE_MOVES, PRODUCT_IMAGE_FOLDERS
│   │   └── types.ts                   — shared DTO types
│   ├── data/hero-skus.json            — source of truth for the 5 hero SKUs
│   ├── modules/
│   │   ├── supabase/
│   │   │   ├── client.ts              — singleton service-role client
│   │   │   ├── hero-update.ts         — applyHeroUpdates()
│   │   │   ├── image-scanner.ts       — scanProductsMissingImages(), setProductImageIfEmpty()
│   │   │   └── protocol.ts            — getProtocolSequence()
│   │   ├── notion/
│   │   │   ├── client.ts              — singleton @notionhq/client
│   │   │   ├── schema.ts              — NOTION_PRODUCT_PROPS schema map
│   │   │   └── sync-products.ts       — syncNotionProducts()
│   │   └── drive/
│   │       ├── client.ts              — google.auth.JWT + drive_v3 wrapper
│   │       ├── file-mover.ts          — moveRemainingFiles()
│   │       └── image-finder.ts        — findProductImages() + scoring
│   └── utils/
│       ├── logger.ts                  — chalk-coloured leveled logger
│       ├── health-check.ts            — runHealthChecks()
│       ├── report.ts                  — Markdown report writer
│       └── rate-limit.ts              — p-limit wrapper + sleep helpers
├── sql/
│   ├── 01_auto_slug_trigger.sql
│   ├── 02_update_hero_skus.sql
│   ├── 03_set_ritual_order.sql
│   └── 04_get_protocol_sequence.sql
├── reports/                           — generated, gitignored
├── .env.example                       — every env var documented
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── LICENSE                            — MIT
```

---

## Recommended first run

```bash
# 1. Validate creds without writing anything
pnpm health

# 2. See what hero rename would do, without touching the DB
pnpm dev supabase:hero-update --dry-run

# 3. Apply for real
pnpm supabase:hero
pnpm supabase:protocol           # confirm 1..5 ritual order

# 4. Move legacy files, dry-run first
pnpm dev drive:move-files --dry-run
pnpm drive:move

# 5. Discover product images and write the obvious matches
pnpm dev drive:find-images --dry-run
pnpm drive:images

# 6. Push to Notion last (so it reads the freshly-written image_urls)
pnpm dev notion:sync --dry-run
pnpm notion:sync
```

Or, if you trust the pipeline end-to-end:

```bash
pnpm sync:all:dry    # see the full plan
pnpm sync:all        # do it
```

---

## License

MIT — see [LICENSE](./LICENSE).
