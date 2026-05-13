-- ==============================================================================
-- STRICKLY FOR SUPABASE / POSTGRESQL (or SQLite)
-- Run this script in your Supabase SQL Editor to set up the SEO settings table.
-- ==============================================================================

-- 1. Create the platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT,
    keywords TEXT
);

-- 2. Insert the initial default SEO settings (Hardcoded to ID 1)
INSERT INTO platform_settings (id, title, description, keywords)
VALUES (
    1, 
    'VidyaNation', 
    'A premium multi-tenant platform for students to explore coaching institutes.', 
    'education, coaching, institutes, learning'
)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    keywords = EXCLUDED.keywords;

-- ==============================================================================
-- SUPABASE SPECIFIC SETTINGS (Row Level Security)
-- ==============================================================================

-- Enable Row Level Security (RLS) to protect the table
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access so your frontend can fetch the SEO data
CREATE POLICY "Allow public read access on platform_settings" 
ON platform_settings 
FOR SELECT 
TO public 
USING (true);

-- Allow authenticated admins to update the settings
-- (Note: If you use the Supabase Service Role Key in your Server Actions, 
-- it automatically bypasses RLS, so this policy is optional but good practice).
CREATE POLICY "Allow authenticated users to update platform_settings" 
ON platform_settings 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);
