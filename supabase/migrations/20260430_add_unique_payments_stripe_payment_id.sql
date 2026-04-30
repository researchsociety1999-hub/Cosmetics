-- Ensure payment rows are idempotent at the database layer.
-- Prevents duplicate inserts when Stripe retries or the webhook is delivered twice.

CREATE UNIQUE INDEX IF NOT EXISTS payments_stripe_payment_id_unique
  ON public.payments (stripe_payment_id)
  WHERE stripe_payment_id IS NOT NULL;

