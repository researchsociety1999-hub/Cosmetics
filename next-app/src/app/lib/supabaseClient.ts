// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.https://piqwtmnbxyiesxcxdwod.supabase.co!
const supabaseAnonKey = process.env.sb_publishable_GDE95-anAcDNc2RSiCddCA_NSzWSQv-!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)