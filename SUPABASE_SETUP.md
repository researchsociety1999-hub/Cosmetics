# Supabase integration (Mystique storefront)

## Environment variables (`next-app/.env.local`)

Copy **`next-app/.env.example`** → **`next-app/.env.local`** (the latter is gitignored). Fill in the [Supabase dashboard](https://supabase.com/dashboard/project/_/settings/api) **Project URL** and **anon public** key (`eyJ...` JWT), plus Stripe/Resend as needed. Use **`GET /api/health/integrations`** (in dev, or with `ENABLE_INTEGRATION_HEALTH=1` in production) to see `readiness` and `missingEnv` without exposing secrets.

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL` | Yes | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes* | Public anon key (safe for browser). |
| `SUPABASE_ANON_KEY` | Optional | Server-only copy if you prefer not to duplicate `NEXT_PUBLIC_*`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Server/admin scripts; never expose to the client. |

\* Do **not** put the **service role** or `sb_secret_*` keys in `NEXT_PUBLIC_*` variables.

## Product catalog not showing?

1. **Published flag** — The app loads only rows where `is_published` is **true**. Draft or `NULL` rows are hidden.
2. **Silent failures removed** — If Supabase returns an error (RLS, wrong column, etc.), the storefront no longer swaps in demo/mock products; check **server logs** for `[Supabase] getProducts failed:`.
3. **Health check (local / staging)** — With `ENABLE_INTEGRATION_HEALTH=1` or in development, open:
   - `GET /api/health/integrations`  
   Inspect `productsPublishedCount`: `ok`, `count`, and `error` (e.g. RLS violation).

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
