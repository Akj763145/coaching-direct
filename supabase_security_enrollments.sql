-- Run this script in your Supabase SQL Editor

-- 1. Ensure the amount column exists for recording payment values safely
ALTER TABLE IF EXISTS enrollments 
ADD COLUMN IF NOT EXISTS amount NUMERIC;

-- 2. Enforce Row Level Security (RLS) on Enrollments
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Students can VIEW their own enrollments
DROP POLICY IF EXISTS "Students can view their own enrollments" ON enrollments;
CREATE POLICY "Students can view their own enrollments" 
ON enrollments FOR SELECT 
USING (auth.uid() = student_id);

-- 4. CRITICAL: Block all direct client-side insertions into the enrollments table.
-- Because our backend (server.ts) uses the SUPABASE_SERVICE_ROLE_KEY, it will automatically
-- bypass RLS and successfully create enrollments after verifying payments.
-- Therefore, we DO NOT want clients being able to insert enrollments directly 
-- which would allow them to bypass the Razorpay payment check completely.
DROP POLICY IF EXISTS "Users can insert their own enrollments" ON enrollments;
-- (By not defining an INSERT policy for authenticated users, they are implicitly denied).

-- 5. Policy: Secure the batches table from unauthorized modifications if not already done
ALTER TABLE IF EXISTS batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active batches" ON batches;
CREATE POLICY "Public can view active batches" 
ON batches FOR SELECT 
USING (status = 'active' OR status = 'running');

-- Only admins/service role can insert/update batches (implicitly blocked for users).
