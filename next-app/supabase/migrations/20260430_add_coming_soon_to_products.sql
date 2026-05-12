-- Adds pre-launch product state for "Coming Soon" handling.
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS coming_soon boolean DEFAULT false;

