-- Supabase Schema for Coaching Directory Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
-- Stores master admin and sub-admins.
CREATE TABLE IF NOT EXISTS public.app_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('MASTER', 'SUB_ADMIN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. INSTITUTES TABLE
CREATE TABLE IF NOT EXISTS public.institutes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    logo TEXT,
    address TEXT,
    location TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    demo_video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_institute UNIQUE (user_id)
);

-- 3. BATCHES TABLE
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
    teacher_name TEXT NOT NULL,
    teacher_image TEXT,
    subject TEXT NOT NULL,
    batch_name TEXT NOT NULL,
    batch_timing TEXT,
    batch_duration TEXT,
    start_date TEXT,
    fee_structure TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

-- Note: In this architecture, writes are securely handled server-side by our Express backend 
-- using the Supabase Service Role Key. 
-- We enable read-only access for public data so students can browse seamlessly.

-- Allow public read access to institutes
CREATE POLICY "Public can view institutes" 
ON public.institutes FOR SELECT 
USING (true);

-- Allow public read access to batches
CREATE POLICY "Public can view batches" 
ON public.batches FOR SELECT 
USING (true);

-- ==========================================
-- INITIAL DATA SEEDING
-- ==========================================

-- INSERT DEFAULT MASTER ADMIN
-- Username: admin
-- Password: admin123
-- (The hash below is a valid bcrypt hash for 'admin123')
INSERT INTO public.app_users (username, password_hash, role) 
VALUES (
  'admin', 
  '$2a$10$wY9Pj/5rP0XzOW0l91.aUeT5N3qM91aYmOaC5IpHC8rG6vQ/K1lCW', 
  'MASTER'
) ON CONFLICT (username) DO NOTHING;
