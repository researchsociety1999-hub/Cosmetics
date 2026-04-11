import { createClient } from '@supabase/supabase-js';

// Public values (client‑side)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Server‑side service role (if needed for promos, newsletters, order writes)
// When this file runs on the server (API routes), the secret key will be present.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Choose the right key based on the execution environment
const clientKey = typeof window === 'undefined' && serviceRoleKey
  ? serviceRoleKey          // server: use service role
  : supabaseAnonKey;        // browser: use anon key

export const supabase = createClient(supabaseUrl, clientKey);