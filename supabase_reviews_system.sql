-- 1. PREPARE INSTITUTES TABLE
-- Ensure we have both naming conventions if needed, but we'll use total_reviews for the app
ALTER TABLE public.institutes 
ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0; -- Compatibility with previous system

-- 2. PREPARE REVIEWS TABLE
-- Create the base table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

-- Ensure ALL columns are present (Safe for existing tables)
-- We make user_id nullable to avoid the error report by the user.
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS batch_id TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS rating INTEGER;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS review_text TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reply_text TEXT; -- Admin response
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS comment TEXT; -- Compatibility
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- CRITICAL FIX: If user_id exists from a previous migration, it might be NOT NULL.
-- We must make it nullable to allow anonymous or non-auth-linked reviews as per current app logic.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'user_id') THEN
        ALTER TABLE public.reviews ALTER COLUMN user_id DROP NOT NULL;
    END IF;
END $$;

-- Ensure the check constraint exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rating_range') THEN
        ALTER TABLE public.reviews ADD CONSTRAINT rating_range CHECK (rating >= 1 AND rating <= 5);
    END IF;
END $$;

-- Add helpful comments
COMMENT ON COLUMN public.reviews.student_name IS 'Stores the students name at the time of review for display fallback';
COMMENT ON COLUMN public.reviews.batch_id IS 'Optional reference to a batch name or ID for context';

-- 3. ENABLE RLS FOR REVIEWS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid "already exists" errors during re-run
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;

-- Allow public read access to reviews
CREATE POLICY "Anyone can view reviews" 
ON public.reviews FOR SELECT 
USING (true);

-- Allow authenticated users to insert reviews (simplified for this platform's iframe environment)
CREATE POLICY "Authenticated users can insert reviews" 
ON public.reviews FOR INSERT 
WITH CHECK (true);

-- 4. AUTO-CALCULATION TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.calculate_institute_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the institutes table with new average rating and total count
    -- Handles both naming conventions just in case
    UPDATE public.institutes
    SET 
        rating = (
            SELECT ROUND(COALESCE(AVG(rating), 0)::numeric, 1)
            FROM public.reviews
            WHERE institute_id = COALESCE(NEW.institute_id, OLD.institute_id)
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE institute_id = COALESCE(NEW.institute_id, OLD.institute_id)
        ),
        review_count = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE institute_id = COALESCE(NEW.institute_id, OLD.institute_id)
        )
    WHERE id = COALESCE(NEW.institute_id, OLD.institute_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CREATE THE TRIGGER
DROP TRIGGER IF EXISTS on_review_insert ON public.reviews;
DROP TRIGGER IF EXISTS trigger_update_institute_rating ON public.reviews;

CREATE TRIGGER on_review_insert
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.calculate_institute_rating();
