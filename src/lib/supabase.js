import { createClient } from '@supabase/supabase-js'

// Strip trailing slashes and /rest/v1 suffix if accidentally included in env
const rawUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Missing environment variables.\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  )
}

/**
 * Supabase client singleton.
 * Uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from .env
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

/**
 * Lookup a student by their QR ID.
 * @param {string} id - The student ID (e.g. "CZ2026-00001")
 * @returns {{ data: object|null, error: object|null }}
 */
export async function getStudentById(id) {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('id', id.trim())
    .single()

  return { data, error }
}

/**
 * Mark attendance for a student.
 * Sets attendance=true and entry_time=now().
 * @param {string} id - The student ID
 * @returns {{ data: object|null, error: object|null }}
 */
export async function approveEntry(id) {
  const { data, error } = await supabase
    .from('registrations')
    .update({
      attendance: true,
      entry_time: new Date().toISOString(),
    })
    .eq('id', id.trim())
    .select()
    .single()

  return { data, error }
}

/**
 * Get today's attendance records, newest first.
 * @returns {{ data: Array|null, error: object|null }}
 */
export async function getTodayScans() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('registrations')
    .select('id, name, sem, div, entry_time, attendance')
    .eq('attendance', true)
    .gte('entry_time', today.toISOString())
    .order('entry_time', { ascending: false })

  return { data, error }
}

/**
 * Search registrations by multiple fields.
 * @param {string} query - Search term
 * @returns {{ data: Array|null, error: object|null }}
 */
export async function searchStudents(query) {
  if (!query || query.trim() === '') {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    return { data, error }
  }

  const q = query.trim()

  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .or(
      `id.ilike.%${q}%,name.ilike.%${q}%,gmail.ilike.%${q}%,sem.ilike.%${q}%,div.ilike.%${q}%`
    )
    .order('created_at', { ascending: false })
    .limit(50)

  return { data, error }
}

/**
 * Check if Supabase is reachable.
 * A 42P01 (undefined_table) error still means we're connected — just need to run migrations.
 * @returns {Promise<boolean>}
 */
export async function checkConnection() {
  try {
    const { error } = await supabase
      .from('registrations')
      .select('id')
      .limit(1)

    if (!error) return true

    // 42P01 = undefined_table — DB is reachable, table just doesn't exist yet
    if (error.code === '42P01') {
      console.warn(
        '[Supabase] ⚠️ The "registrations" table does not exist.\n' +
        'Run the SQL in supabase/migrations/001_create_registrations.sql in your Supabase dashboard.'
      )
      return true // Connection is fine
    }

    console.error('[Supabase] Connection error:', error)
    return false
  } catch {
    return false
  }
}
