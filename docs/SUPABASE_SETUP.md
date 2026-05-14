# Supabase integration (Mystique storefront)

## Environment variables (`next-app/.env.local`)

Copy **`next-app/.env.example`** → **`next-app/.env.local`** (the latter is gitignored). In the [Supabase dashboard](https://supabase.com/dashboard/projects), open **your project** → **Project Settings** (gear) → **API**: copy the **Project URL** (`https://<ref>.supabase.co`) and the **anon public** / **publishable** key (`eyJ...` JWT), plus Stripe/Resend as needed. Use **`GET /api/health/integrations`** (in dev, or with `ENABLE_INTEGRATION_HEALTH=1` in production) to see `readiness` and `missingEnv` without exposing secrets.

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL` | Yes | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes* | Public anon key (safe for browser). |
| `SUPABASE_ANON_KEY` | Optional | Server-only copy if you prefer not to duplicate `NEXT_PUBLIC_*`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Server/admin scripts; never expose to the client. |

\* Do **not** put the **service role** or `sb_secret_*` keys in `NEXT_PUBLIC_*` variables.

**Auth + service role together:** keep the **anon (or publishable) key** set for `NEXT_PUBLIC_*` even when you add `SUPABASE_SERVICE_ROLE_KEY`. The SSR client (`@supabase/ssr`) used for magic links and sessions **does not** use the service key; omitting the anon key breaks sign-in while the catalog might still work from server-side queries.

## Magic links, sign-up, and “Signups not allowed for otp”

The storefront calls `signInWithOtp` with `emailRedirectTo` pointing at **`/auth/confirm`** on your site. If something is wrong, Supabase returns an error and the app shows a short message—**it does not mean your React email template is broken**; it usually means a **project setting** blocks the request.

### 1. Allow new users (required for “Create account”)

If **new sign-ups are disabled**, only **existing** Auth users can receive a magic link. The **Create account** flow will fail with an error like **Signups not allowed for otp**.

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication**.
2. Go to **Sign In / Providers** (or **Providers**) → **Email**.
3. Turn **on** the option to **allow new users to sign up** (wording may be “Allow new users” / “Enable sign ups”—do **not** leave “Disable sign ups” enabled if you want `/account/signup` to work).

After saving, try **Create account** again from the Mystique site.

### 2. Redirect URLs (required for the link in the email to work)

1. **Authentication** → **URL Configuration**.
2. **Site URL** — set to your real origin, e.g. `http://localhost:3000` for local dev or `https://yourdomain.com` in production.
3. **Redirect URLs** — add allowlisted URLs, including:
   - `http://localhost:3000/auth/confirm`
   - `http://localhost:3000/**` (wildcard is convenient for dev), and your production `/auth/confirm` URL.

The magic link in the email must redirect to one of these; otherwise verification can fail after the user clicks.

### 3. Email templates (login / sign-up only)

**Authentication** → **Email Templates** — customize **Magic link**, **Confirm sign up**, etc. These templates apply only to **Supabase Auth** (passwordless login and sign-up). They **do not** include shopping cart or order line items.

### 4. Order confirmation emails (separate system)

**Paid orders** trigger emails from the Next.js app via **Resend** (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`), not from Supabase Auth templates. Configure Resend and optional `ORDERS_ADMIN_EMAIL` in `next-app/.env.local`. See `next-app/src/app/lib/orderNotifications.ts`.

### 5. Custom SMTP (optional)

If you use **custom SMTP** in Supabase for Auth mail, verify **SMTP** settings under project **Authentication** / **Settings** so magic-link messages are actually delivered (inbox vs spam).

## Product catalog not showing?

1. **Published flag** — The app loads only rows where `is_published` is **true**. Draft or `NULL` rows are hidden.
2. **Silent failures removed** — If Supabase returns an error (RLS, wrong column, etc.), the storefront no longer swaps in demo/mock products; check **server logs** for `[Supabase] getProducts failed:`.
3. **Health check (local / staging)** — With `ENABLE_INTEGRATION_HEALTH=1` or in development, open:
   - `GET /api/health/integrations`  
   Inspect `productsPublishedCount`: `ok`, `count`, and `error` (e.g. RLS violation).

## Optional merchandising (`products.volume_size_label`)

For faster scanning on cards and the PDP, you can add a nullable text column used only for display (no migration is required for checkout or cart):

- **`volume_size_label`** — short shopper-facing line, e.g. `30 ml · glass dropper` or `150 ml · pump`. If omitted, the UI may still infer a size from **`product_variants.variant_name`** when it looks like a volume (contains `ml`, `g`, etc.).

## Product images (`products.image_url`, `extra_images`)

1. **Store full HTTPS URLs** in `image_url` (and optional `extra_images` array). Typical Supabase Storage public URL shape:
   - `https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/<path-to-file>`
2. **Bucket must be public** (or use signed URLs and extend allowlists — see below). In the Storage UI, set the bucket to public or generate long-lived signed URLs if you keep the bucket private.
3. **Next.js `next/image`** only optimizes remotes listed in `next-app/next.config.js` (`**.supabase.co`, Unsplash, `placehold.co`, etc.). For a **custom CDN hostname**, set:
   - `NEXT_PUBLIC_IMAGE_REMOTE_HOSTS=cdn.example.com,images.example.com`  
   (comma-separated, no `https://`). The same list is honored at runtime by `isSafeImageSrc` in `next-app/src/app/lib/format.ts` — keep the two in sync when you change `next.config.js`.
4. **Site-local files** — URLs starting with `/` (e.g. `/catalog/serum-hero.jpg`) must live under `next-app/public/`.
5. If `image_url` is empty or blocked, the storefront shows an **in-app branded placeholder** (no broken icon).

## Product reviews (`reviews`)

- The PDP shows **stars and counts only from rows** returned by Supabase (`reviews` filtered by `product_id`). If the table is empty or the query errors, the UI explains that **no reviews are shown** (mock quotes are **not** substituted in production).
- With **`ALLOW_MOCK_CATALOG=1`** only, bundled mock reviews may appear for local demos.

## Row Level Security (RLS)

If RLS is enabled on `products`, the **anon** role must be allowed to `SELECT` published rows, for example:

```sql
-- Example: allow anyone to read published products
create policy "Public read published products"
on public.products
for select
to anon, authenticated
using (coalesce(is_published, false) = true);
```

Adjust schema/name to match your project. If RLS is **off** for `products`, ensure the table is readable by the API key you use.

## Press (`press_mentions`)

The Press page reads **only** from `press_mentions` when Supabase is configured. There is **no** bundled fallback of fake articles or `example.com` links—an empty table simply shows the honest empty state. Add rows with real `title`, `source`, optional `quote`, optional `published_at`, and a **`link` that resolves to the actual piece** (https) when you want an outbound button.

## Categories

`categories` is loaded for shop filters. If the query fails or returns an empty array, filters may be empty—add rows in Supabase.

## Cart and checkout

- **Guest bag → account** — After a successful magic link on `/auth/confirm` (or OAuth code exchange on `/auth/callback`), items in the **guest cookie cart** are merged into **`cart_items`** for the signed-in user, then the cookie is cleared. RLS must allow authenticated users to `INSERT`/`UPDATE`/`DELETE` their own `cart_items`.
- **Stripe checkout** — Order creation and fulfillment use **`supabaseAdmin` when `SUPABASE_SERVICE_ROLE_KEY` is set**; otherwise the shared server client is used (anon must be allowed by RLS for `orders`, `order_items`, `payments`, `addresses`, etc.). **Set the service role on the server** for production checkout unless you have carefully scoped RLS for those tables.
- **Order emails** — If Resend is not configured, paid orders still finalize; confirmation emails are skipped and a warning is logged.

## Mock catalog (Playwright / local only)

By default, the storefront **does not** use bundled demo products when Supabase is missing or misconfigured; the shop shows **no products** until env vars and data are set.

For **Playwright E2E** (or local demos without a database), set:

```bash
ALLOW_MOCK_CATALOG=1
```

(`ALLOW_MOCK_PRODUCTS=1` is accepted as an alias.) `npm run test` starts the app on **port 3001** with this flag so it does not pick up a normal `next dev` on port 3000 without mocks.

## Legacy reference

Older sections of this file described generic uploads; the live schema follows `next-app/src/app/lib/types.ts` (`Product`, `Category`, `product_variants`, etc.).
