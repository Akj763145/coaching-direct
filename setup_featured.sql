-- Dedicated SQL Script for Coaching Direct
-- Run this in your Supabase SQL Editor or Local Database

-- 1. Add is_featured column if it doesn't exist
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- 2. Ensure rating and total_reviews columns exist for the leaderboard
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS rating REAL DEFAULT 0;
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- 3. If you want to manually feature some institutes to test
-- UPDATE institutes SET is_featuredBuffer = TRUE WHERE name LIKE '%Coaching%';

-- For SQLite (local development):
-- ALTER TABLE institutes ADD COLUMN is_featured INTEGER DEFAULT 0;
-- ALTER TABLE institutes ADD COLUMN rating REAL DEFAULT 0;
-- ALTER TABLE institutes ADD COLUMN total_reviews INTEGER DEFAULT 0;
