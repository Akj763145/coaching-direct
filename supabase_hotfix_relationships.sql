-- SUPABASE HOTFIX: Fix missing relationships and tables
-- Run this in your Supabase SQL Editor if you see "relationship not found" errors.

-- 1. Ensure institute_categories exists
CREATE TABLE IF NOT EXISTS public.institute_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Ensure institutes has category_id and the foreign key
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='institutes' AND column_name='category_id') THEN
        ALTER TABLE public.institutes ADD COLUMN category_id UUID;
    END IF;
END $$;

-- Drop existing constraint if it exists to avoid conflicts, then recreate
ALTER TABLE public.institutes DROP CONSTRAINT IF EXISTS institutes_category_id_fkey;
ALTER TABLE public.institutes 
ADD CONSTRAINT institutes_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.institute_categories(id) ON DELETE SET NULL;

-- 3. Ensure foreign key to app_users is correct
-- This is critical for the .select('*, app_users(username)') join
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='institutes_user_id_fkey') THEN
        ALTER TABLE public.institutes 
        ADD CONSTRAINT institutes_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Enable RLS and add public read policies
ALTER TABLE public.institute_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view institute categories" ON public.institute_categories;
CREATE POLICY "Public can view institute categories" ON public.institute_categories FOR SELECT USING (true);

ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view institutes" ON public.institutes;
CREATE POLICY "Public can view institutes" ON public.institutes FOR SELECT USING (true);

-- 5. Seed initial data if empty
INSERT INTO public.institute_categories (name) VALUES 
('Coaching'), ('School'), ('College'), ('Computer Center')
ON CONFLICT (name) DO NOTHING;
