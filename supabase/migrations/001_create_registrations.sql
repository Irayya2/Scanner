-- ============================================================
-- QR Attendance Scanner — Supabase Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create the registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
  id          TEXT PRIMARY KEY,           -- QR code ID e.g. CZ2026-00001
  name        TEXT NOT NULL,
  gmail       TEXT,
  sem         TEXT,
  div         TEXT,
  attendance  BOOLEAN DEFAULT FALSE,
  entry_time  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index for fast lookups on name and gmail
CREATE INDEX IF NOT EXISTS idx_registrations_name  ON public.registrations (name);
CREATE INDEX IF NOT EXISTS idx_registrations_gmail ON public.registrations (gmail);
CREATE INDEX IF NOT EXISTS idx_registrations_attendance ON public.registrations (attendance);

-- 3. Enable Row Level Security
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Allow anyone to READ (anon key is fine for reading)
CREATE POLICY "Allow public read"
  ON public.registrations
  FOR SELECT
  USING (true);

-- 5. Policy: Allow authenticated users to UPDATE attendance
--    (For now, allow anon to update too — tighten this once you add auth)
CREATE POLICY "Allow attendance update"
  ON public.registrations
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 6. Optional: Insert sample test records
-- INSERT INTO public.registrations (id, name, gmail, sem, div, attendance)
-- VALUES
--   ('CZ2026-00001', 'Alice Johnson', 'alice@gmail.com', '3', 'A', false),
--   ('CZ2026-00002', 'Bob Smith',    'bob@gmail.com',   '3', 'B', false),
--   ('CZ2026-00003', 'Carol White',  'carol@gmail.com', '5', 'A', false);
