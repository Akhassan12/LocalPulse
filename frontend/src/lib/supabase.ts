/**
 * lib/supabase.ts — Supabase client singleton
 * Uses env vars injected by Vite (VITE_ prefix required for client-side exposure)
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
)

if (!isSupabaseConfigured) {
  console.warn(
    '[LocalPulse] Supabase env vars not set. Auth features will run in mock/preview mode. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file to enable live Supabase auth.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export type SupabaseSession = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']
