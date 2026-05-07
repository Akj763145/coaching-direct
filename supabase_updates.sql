-- SUPABASE SETUP SCRIPT FOR COACHING HUB
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create Users Table (Handles logins for Master and Sub-Admins)
CREATE TABLE IF NOT EXISTS app_users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('MASTER', 'SUB_ADMIN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Institutes Table (Stores profile information)
CREATE TABLE IF NOT EXISTS institutes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES app_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    logo TEXT,
    address TEXT,
    location TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    whatsapp_number TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Batches Table (Course/Batch information)
CREATE TABLE IF NOT EXISTS batches (
    id SERIAL PRIMARY KEY,
    institute_id INTEGER NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    teacher_name TEXT NOT NULL,
    teacher_image TEXT,
    subject TEXT NOT NULL,
    batch_name TEXT NOT NULL,
    batch_timing TEXT,
    batch_duration TEXT,
    start_date DATE,
    fee_structure TEXT,
    status TEXT DEFAULT 'running',
    mode TEXT DEFAULT 'Offline',
    medium TEXT,
    board_target TEXT,
    total_seats INTEGER,
    available_seats INTEGER,
    syllabus_pdf TEXT,
    teacher_bio TEXT,
    curriculum JSONB, -- Stores syllabus/modules as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Notices Table (Announcements)
CREATE TABLE IF NOT EXISTS notices (
    id SERIAL PRIMARY KEY,
    institute_id INTEGER NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT DEFAULT 'announcement',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Documents Table (Study Materials)
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    institute_id INTEGER NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    size TEXT,
    format TEXT DEFAULT 'PDF',
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Faculty Table (Teachers)
CREATE TABLE IF NOT EXISTS faculty (
    id SERIAL PRIMARY KEY,
    institute_id INTEGER NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    image_url TEXT,
    qualifications TEXT,
    bio TEXT,
    experience TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Join Table for Batch-Faculty relationships (Many-to-Many)
CREATE TABLE IF NOT EXISTS batch_faculty (
    batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
    faculty_id INTEGER REFERENCES faculty(id) ON DELETE CASCADE,
    PRIMARY KEY (batch_id, faculty_id)
);

-- 8. Add indexes for faster searching
CREATE INDEX IF NOT EXISTS idx_batches_institute ON batches(institute_id);
CREATE INDEX IF NOT EXISTS idx_notices_institute ON notices(institute_id);
CREATE INDEX IF NOT EXISTS idx_faculty_institute ON faculty(institute_id);

-- 9. (OPTIONAL) Enable RLS if you want extra security (requires more config)
-- ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE institutes ENABLE ROW LEVEL SECURITY;
