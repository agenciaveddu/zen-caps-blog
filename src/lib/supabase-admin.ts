import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase ADMIN (service role) — bypassa RLS.
 * Use APENAS em rotas server-side (API endpoints com prerender=false).
 * NUNCA exponha essa key para o cliente.
 */
const supabaseUrl = import.meta.env.SUPABASE_URL
const serviceKey = import.meta.env.SUPABASE_SERVICE_KEY

export const supabaseAdmin = createClient(supabaseUrl || '', serviceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
