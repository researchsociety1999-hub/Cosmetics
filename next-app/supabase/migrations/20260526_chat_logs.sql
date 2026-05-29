CREATE TABLE IF NOT EXISTS public.chat_logs (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    source TEXT NOT NULL CHECK (source IN ('admin','storefront','unknown')),
    user_message TEXT NOT NULL CHECK (char_length(user_message) <= 1000),
    assistant_message TEXT CHECK (assistant_message IS NULL OR char_length(assistant_message) <= 1000),
    outcome TEXT NOT NULL CHECK (outcome IN ('success','fallback','blocked','error')),
    theme TEXT NOT NULL DEFAULT 'other' CHECK (theme IN (
        'product_question','shipping_tracking','returns_refund','recommendation',
        'ingredients_suitability','price_promotion','other'
    )),
    latency_ms INTEGER CHECK (latency_ms IS NULL OR latency_ms >= 0),
    status INTEGER NOT NULL DEFAULT 200,
    error_code TEXT,
    pathname TEXT
);
CREATE INDEX chat_logs_created_at_idx ON public.chat_logs (created_at DESC);
CREATE INDEX chat_logs_outcome_idx ON public.chat_logs (outcome, created_at DESC);
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;
-- intentionally no policies — only the service role can read or write
