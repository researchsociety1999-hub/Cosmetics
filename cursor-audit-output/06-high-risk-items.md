# 06 — High-Risk Items (Do NOT auto-apply without review)

These require human judgment because they change financial reporting, money movement, security posture, the data model, or production reliability behavior.

| ID | Change | Why it is high-risk | What review must confirm |
|---|---|---|---|
| B01 | Filter admin KPIs by order status | Redefines what "revenue" and "order count" mean for the business; wrong status set silently misreports money | Canonical revenue-bearing status set (`paid`/`processing`/`fulfilled`/`shipped`/`delivered`?), whether refunds/cancellations net out, timezone for "today" (`overviewData.ts:43-47` uses local time) |
| B03 | Durable order audit log | Adds a write path on every admin mutation + new table; bad schema/RLS could leak operator data or block actions | Table shape, RLS (service-role only), retention, PII policy; reuse `order_status_history` vs. new `order_audit_log` |
| B05 | Add error monitoring (Sentry) | New dependency, new DSN secret, source-map upload in build, possible PII in payloads | Vendor choice, data-scrubbing config, env/secret management, CSP `connect-src` update |
| B06 | Durable rate limiting | Changes security behavior; a misconfigured limiter can lock out real users or fail open | Backing store (Supabase table vs. Vercel KV/Upstash), fail-open vs. fail-closed policy, key strategy behind proxies |
| B07 | Product CRUD in admin | Service-role writes to catalog from a UI; validation gaps could corrupt pricing/stock or publish drafts | Field-level validation, who can edit, optimistic-lock/conflict handling, audit coverage, image handling |
| B09 | Consolidate migrations | Re-ordering/moving SQL can break a clean re-apply or diverge from the live DB | Whether live DB already applied both dirs; canonical order; no destructive re-runs |
| B11 | Admin roles via Supabase auth | Replaces the auth model for `/admin`; mistakes lock out staff or expose admin | Migration path from shared password, `admin_users` mapping, session model, rollback |
| B13 | UTM attribution capture | Writes campaign data onto orders/`analytics_events`; privacy + schema impact | Consent interaction, storage location, retention, GDPR/CCPA stance |
| B19 | Sales tax | Legal/compliance + money; `taxAmount` hard-coded 0 (`checkout.ts:36`) | Jurisdictions, Stripe Tax vs. manual, nexus rules — **legal sign-off required** |
| — | Branch deletion / force operations | Destructive git history changes | Owner confirmation before deleting any remote branch |

**Rule for unattended runs:** none of the above should be applied by an agent without an explicit, scoped instruction and a reviewer on the resulting PR.
