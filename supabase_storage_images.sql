-- Run this script in your Supabase SQL Editor to create a storage bucket for images

-- 1. Create a public bucket named 'images' (if it doesn't already exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies if they exist (to avoid errors when re-running)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- 3. Set up Storage Security Policies

-- Allow public read access to images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
);

-- Allow users to update their own uploaded images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
    AND owner = auth.uid()
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
    AND owner = auth.uid()
);

-- Note: Currently the application converts images to Base64 strings and saves them directly into the database. 
-- This avoids needing to set up storage buckets for prototyping, but setting up this bucket will be useful 
-- if you plan to upgrade the code to upload the raw image files to Supabase Storage later.
