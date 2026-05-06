-- 1. Add Rating Columns to Institutes (if they don't exist)
ALTER TABLE institutes
ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 2. Reviews Table Definition
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    demo_request_id UUID REFERENCES demo_requests(id) ON DELETE SET NULL, -- Links the review to the specific demo taken
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT true, -- Since they took a demo through the platform, they are verified
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(institute_id, user_id) -- Ensures 1 review per student per institute
);

-- 3. Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (Safely dropping them first to avoid "already exists" errors)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
    DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
    DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
    DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;
END $$;

CREATE POLICY "Reviews are viewable by everyone" ON reviews 
    FOR SELECT USING (true);
    
CREATE POLICY "Users can insert their own reviews" ON reviews 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own reviews" ON reviews 
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Users can delete their own reviews" ON reviews 
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_reviews_modtime ON reviews;
CREATE TRIGGER trigger_update_reviews_modtime
BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE PROCEDURE update_reviews_updated_at();

-- 6. Trigger to Update Institute's Average Rating Automatically
CREATE OR REPLACE FUNCTION update_institute_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE institutes
        SET 
            rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE institute_id = NEW.institute_id),
            review_count = (SELECT COUNT(*) FROM reviews WHERE institute_id = NEW.institute_id)
        WHERE id = NEW.institute_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE institutes
        SET 
            rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE institute_id = OLD.institute_id),
            review_count = (SELECT COUNT(*) FROM reviews WHERE institute_id = OLD.institute_id)
        WHERE id = OLD.institute_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_institute_rating ON reviews;
CREATE TRIGGER trigger_update_institute_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE PROCEDURE update_institute_rating();
