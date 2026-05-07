-- # COACHING HUB SUPABASE NOTICE BOARD REPAIR
-- 🚀 Run this in your Supabase SQL Editor to fix the "message" vs "description" conflict.

-- 1. Ensure the notices table has the correct structure for our code
CREATE TABLE IF NOT EXISTS notices (
    id BIGSERIAL PRIMARY KEY,
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT,
    type TEXT DEFAULT 'announcement',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Handle legacy "message" column conflicts
DO $$ 
BEGIN
    -- If 'message' exists and is NOT NULL, make it NULLable so it doesn't block inserts
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notices' AND column_name='message') THEN
        ALTER TABLE notices ALTER COLUMN message DROP NOT NULL;
        
        -- Migrate any existing data from message to description if description is empty
        UPDATE notices SET description = message WHERE description IS NULL OR description = '';
    END IF;

    -- Ensure 'description' exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notices' AND column_name='description') THEN
        ALTER TABLE notices ADD COLUMN description TEXT;
    END IF;

    -- Ensure 'type' exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notices' AND column_name='type') THEN
        ALTER TABLE notices ADD COLUMN type TEXT DEFAULT 'announcement';
    END IF;
END $$;

-- 3. Security Check: Enable RLS and add policies
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access for notices" ON notices;
CREATE POLICY "Allow public read access for notices" ON notices FOR SELECT USING (true);

-- 4. Refresh Schema Cache
NOTIFY pgrst, 'reload schema';
