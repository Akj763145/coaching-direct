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
ALTER TABLE batches ADD COLUMN IF NOT EXISTS medium TEXT;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS board_target TEXT;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS total_seats INTEGER DEFAULT 50;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS available_seats INTEGER DEFAULT 50;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS syllabus_pdf TEXT;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS teacher_bio TEXT;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS curriculum TEXT;



-- Faculty Table (Integrated with existing bigint primary keys)
CREATE TABLE IF NOT EXISTS faculty (
    id BIGSERIAL PRIMARY KEY,
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    image_url TEXT,
    qualifications TEXT,
    bio TEXT,
    experience TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for multiple faculty members in a batch (Types matched to actual PKs)
CREATE TABLE IF NOT EXISTS batch_faculty (
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
    faculty_id BIGINT REFERENCES faculty(id) ON DELETE CASCADE,
    PRIMARY KEY (batch_id, faculty_id)
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
