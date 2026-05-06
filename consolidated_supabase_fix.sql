-- Consolidated Supabase Schema Fix
-- This script ensures all tables have the correct columns for the Coaching Directory features.

-- 1. INSTITUTES TABLE ENHANCEMENTS
ALTER TABLE public.institutes 
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true;

-- 2. BATCHES TABLE ENHANCEMENTS
ALTER TABLE public.batches
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'running',
ADD COLUMN IF NOT EXISTS medium VARCHAR(50) DEFAULT 'English',
ADD COLUMN IF NOT EXISTS board_target VARCHAR(100) DEFAULT 'CBSE',
ADD COLUMN IF NOT EXISTS total_seats INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS available_seats INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS syllabus_pdf TEXT,
ADD COLUMN IF NOT EXISTS teacher_bio TEXT,
ADD COLUMN IF NOT EXISTS curriculum JSONB DEFAULT '[]'::jsonb;

-- 3. UNIFIED DEMO REQUESTS (LEADS) TABLE
-- Drop existing table to ensure clean state with correct columns
DROP TABLE IF EXISTS public.demo_requests CASCADE;

CREATE TABLE public.demo_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Optional student user ID
    institute_id UUID NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    student_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    request_date DATE NOT NULL,
    request_time VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Scheduled', 'Rejected', 'Completed', 'Cancelled')),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. NOTICES TABLE
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ENABLE RLS
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES
DROP POLICY IF EXISTS "Public can insert demo requests" ON public.demo_requests;
CREATE POLICY "Public can insert demo requests" ON public.demo_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Institutes can view their own leads" ON public.demo_requests;
CREATE POLICY "Institutes can view their own leads" ON public.demo_requests
FOR SELECT USING (
    institute_id IN (SELECT id FROM public.institutes WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Institutes can update lead status" ON public.demo_requests;
CREATE POLICY "Institutes can update lead status" ON public.demo_requests
FOR UPDATE USING (
    institute_id IN (SELECT id FROM public.institutes WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Public can view notices" ON public.notices;
CREATE POLICY "Public can view notices" ON public.notices FOR SELECT USING (true);
