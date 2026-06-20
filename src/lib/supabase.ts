import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wnogtmjmpfhgzfgkbcnh.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_s-_irARrTI8BViAA0nDP_w_1VuXNC83'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
