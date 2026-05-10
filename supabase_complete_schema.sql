-- COMPLETE SUPABASE SCHEMA FOR COACHING DIRECT
-- Run this in your Supabase SQL Editor

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- App Users (Admins and Sub-Admins)
-- Note: 'admin' is created automatically by server.ts if not present
CREATE TABLE IF NOT EXISTS public.app_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('MASTER', 'SUB_ADMIN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Institute Categories (Global)
CREATE TABLE IF NOT EXISTS public.institute_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Institutes
CREATE TABLE IF NOT EXISTS public.institutes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.app_users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.institute_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    logo TEXT,
    address TEXT,
    location TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    whatsapp_number TEXT,
    latitude REAL,
    longitude REAL,
    is_featured BOOLEAN DEFAULT false,
    rating NUMERIC(3, 2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Local Categories (for Batches within an Institute)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Faculty
CREATE TABLE IF NOT EXISTS public.faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    image_url TEXT,
    qualifications TEXT,
    bio TEXT,
    experience TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Batches
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    teacher_name TEXT,
    teacher_image TEXT,
    subject TEXT NOT NULL,
    batch_name TEXT NOT NULL,
    batch_timing TEXT,
    batch_duration TEXT,
    start_date TEXT,
    fee_structure TEXT,
    status TEXT DEFAULT 'running',
    mode TEXT DEFAULT 'Offline',
    medium TEXT DEFAULT 'English',
    board_target TEXT DEFAULT 'CBSE',
    total_seats INTEGER DEFAULT 0,
    available_seats INTEGER DEFAULT 0,
    syllabus_pdf TEXT,
    teacher_bio TEXT,
    curriculum JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Batch-Faculty Junction
CREATE TABLE IF NOT EXISTS public.batch_faculty (
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES public.faculty(id) ON DELETE CASCADE,
    PRIMARY KEY (batch_id, faculty_id)
);

-- Notices
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT DEFAULT 'announcement',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Documents / Resources
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    size TEXT,
    format TEXT DEFAULT 'PDF',
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Lead Management (Demo Requests)
CREATE TABLE IF NOT EXISTS public.demo_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 3. ENABLE RLS
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institute_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES (BASIC PUBLIC READ)

-- Public can view most things
CREATE POLICY "Public read institute categories" ON public.institute_categories FOR SELECT USING (true);
CREATE POLICY "Public read institutes" ON public.institutes FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read batches" ON public.batches FOR SELECT USING (true);
CREATE POLICY "Public read faculty" ON public.faculty FOR SELECT USING (true);
CREATE POLICY "Public read notices" ON public.notices FOR SELECT USING (true);
CREATE POLICY "Public read documents" ON public.documents FOR SELECT USING (true);

-- Leads: only public insert, institute owner can view
CREATE POLICY "Public insert leads" ON public.demo_requests FOR INSERT WITH CHECK (true);
-- To enable lead viewing for institutes, we would need to link app_users to auth.users 
-- or use a custom claim. For now, let's allow service role or master admin broad access.

-- 5. INITIAL SEEDS
INSERT INTO public.institute_categories (name) VALUES 
('Coaching'), ('School'), ('College'), ('Computer Center')
ON CONFLICT (name) DO NOTHING;

-- 6. FAVORITES (INSTITUTES & BATCHES)
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'INSTITUTE' CHECK (type IN ('INSTITUTE', 'BATCH')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, institute_id, batch_id)
);

-- RLS for favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own favorites" ON public.favorites
    FOR ALL USING (auth.uid() = user_id);

-- 7. STUDENT PROFILES
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    age INTEGER,
    education_level TEXT,
    phone_number TEXT,
    onboarding_completed BOOLEAN DEFAULT false,
    tour_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for student_profiles
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile" ON public.student_profiles
    FOR ALL USING (auth.uid() = id);

-- Create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.student_profiles (id, full_name, onboarding_completed, tour_completed)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', false, false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users cascade;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
