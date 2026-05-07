-- # COACHING HUB SUPABASE FULL SCHEMA SCRIPT
-- 🚀 Run this in your Supabase SQL Editor to ensure all tables and columns are correctly synced.

-- 1. APPS USERS TABLE (For Auth)
CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('MASTER', 'SUB_ADMIN')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INSTITUTES TABLE
CREATE TABLE IF NOT EXISTS institutes (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    logo TEXT,
    address TEXT,
    location TEXT,
    phone TEXT, -- Support Phone
    email TEXT,
    website TEXT,
    whatsapp_number TEXT, -- WhatsApp verified
    latitude REAL,
    longitude REAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix institutes: Ensure 'phone' and 'whatsapp_number' exist if table already existed
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='institutes' AND column_name='phone') THEN
        ALTER TABLE institutes ADD COLUMN phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='institutes' AND column_name='whatsapp_number') THEN
        ALTER TABLE institutes ADD COLUMN whatsapp_number TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='institutes' AND column_name='latitude') THEN
        ALTER TABLE institutes ADD COLUMN latitude REAL;
        ALTER TABLE institutes ADD COLUMN longitude REAL;
    END IF;
END $$;

-- 3. BATCHES TABLE
CREATE TABLE IF NOT EXISTS batches (
    id BIGSERIAL PRIMARY KEY,
    institute_id BIGINT REFERENCES institutes(id) ON DELETE CASCADE,
    teacher_name TEXT NOT NULL,
    teacher_image TEXT,
    subject TEXT NOT NULL,
    batch_name TEXT NOT NULL,
    batch_timing TEXT,
    batch_duration TEXT,
    start_date TEXT,
    fee_structure TEXT,
    status TEXT DEFAULT 'running',
    mode TEXT DEFAULT 'Offline',
    medium TEXT,
    board_target TEXT,
    total_seats INTEGER,
    available_seats INTEGER,
    syllabus_pdf TEXT,
    teacher_bio TEXT,
    curriculum JSONB, -- Stored as JSON
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. NOTICES TABLE
CREATE TABLE IF NOT EXISTS notices (
    id BIGSERIAL PRIMARY KEY,
    institute_id BIGINT REFERENCES institutes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT,
    type TEXT DEFAULT 'announcement',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix notices: Handle legacy "message" column if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notices' AND column_name='message') THEN
        ALTER TABLE notices ALTER COLUMN message DROP NOT NULL;
        UPDATE notices SET description = message WHERE description IS NULL OR description = '';
    END IF;
END $$;

-- 5. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    institute_id BIGINT REFERENCES institutes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    size TEXT,
    format TEXT DEFAULT 'PDF',
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FACULTY TABLE
CREATE TABLE IF NOT EXISTS faculty (
    id BIGSERIAL PRIMARY KEY,
    institute_id BIGINT REFERENCES institutes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    image_url TEXT,
    qualifications TEXT,
    bio TEXT,
    experience TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BATCH FACULTY JUNCTION
CREATE TABLE IF NOT EXISTS batch_faculty (
    batch_id BIGINT REFERENCES batches(id) ON DELETE CASCADE,
    faculty_id BIGINT REFERENCES faculty(id) ON DELETE CASCADE,
    PRIMARY KEY (batch_id, faculty_id)
);

-- 8. SECURITY POLICIES (RLS)
-- Enable RLS on all tables
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_faculty ENABLE ROW LEVEL SECURITY;

-- Default Allow Read to all for public tables
DROP POLICY IF EXISTS "Public Read Notices" ON notices;
CREATE POLICY "Public Read Notices" ON notices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Institutes" ON institutes;
CREATE POLICY "Public Read Institutes" ON institutes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Batches" ON batches;
CREATE POLICY "Public Read Batches" ON batches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Faculty" ON faculty;
CREATE POLICY "Public Read Faculty" ON faculty FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Documents" ON documents;
CREATE POLICY "Public Read Documents" ON documents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Batch Faculty" ON batch_faculty;
CREATE POLICY "Public Read Batch Faculty" ON batch_faculty FOR SELECT USING (true);

-- 9. Refresh Schema Cache
NOTIFY pgrst, 'reload schema';

-- ✅ SCRIPT COMPLETED
