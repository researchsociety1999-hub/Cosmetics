alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (
    status = any (
      array[
        'pending'::text,
        'paid'::text,
        'failed'::text,
        'processing'::text,
        'shipped'::text,
        'delivered'::text,
        'cancelled'::text,
        'refunded'::text
      ]
    )
  );

create unique index if not exists orders_stripe_checkout_session_id_idx
  on public.orders (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;
