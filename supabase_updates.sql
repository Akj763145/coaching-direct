-- SQL Script to update/sync Supabase schema for Coaching Direct
-- Run this in your Supabase SQL Editor

-- Add description column
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS description TEXT;

-- Add WhatsApp and Location columns if they don't exist
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add mode to batches
ALTER TABLE batches ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'Offline';

-- Faculty Table (Corrected for UUID institutes)
CREATE TABLE IF NOT EXISTS faculty (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notices Table
CREATE TABLE IF NOT EXISTS notices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT DEFAULT 'announcement',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    size TEXT,
    format TEXT DEFAULT 'PDF',
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recommended: Add index on user_id if not already present
-- CREATE UNIQUE INDEX IF NOT EXISTS institutes_user_id_idx ON institutes (user_id);

COMMENT ON COLUMN institutes.description IS 'About section for the institute profile';
