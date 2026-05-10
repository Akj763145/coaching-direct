-- Migration to add Institute Categories
CREATE TABLE IF NOT EXISTS public.institute_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add category_id to institutes
ALTER TABLE public.institutes ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.institute_categories(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.institute_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can view institute categories" 
ON public.institute_categories FOR SELECT 
USING (true);

-- Seed some initial categories
INSERT INTO public.institute_categories (name) VALUES 
('Coaching'), 
('School'), 
('College'), 
('Computer Center'),
('Language School'),
('Technical Institute')
ON CONFLICT (name) DO NOTHING;
