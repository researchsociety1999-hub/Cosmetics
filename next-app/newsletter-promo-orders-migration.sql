create extension if not exists pgcrypto;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists newsletter_subscribers_email_idx
  on public.newsletter_subscribers (lower(email));

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  discount_type text not null,
  discount_value integer not null,
  is_active boolean not null default true,
  starts_at timestamptz,
  expires_at timestamptz,
  minimum_subtotal integer,
  created_at timestamptz not null default timezone('utc', now()),
  constraint promo_codes_discount_type_check
    check (discount_type = any (array['percent'::text, 'fixed'::text])),
  constraint promo_codes_discount_value_check
    check (discount_value > 0),
  constraint promo_codes_minimum_subtotal_check
    check (minimum_subtotal is null or minimum_subtotal >= 0)
);

create unique index if not exists promo_codes_code_idx
  on public.promo_codes (upper(code));

alter table public.orders
  add column if not exists promo_code text;
