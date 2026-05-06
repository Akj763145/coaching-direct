-- 1. Add rating and review_count columns to the institutes table
ALTER TABLE institutes
ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 2. Create the reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(institute_id, user_id) -- Ensures a user can only review a specific institute once
);

-- 3. Enable RLS on reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 4. Create Row Level Security (RLS) policies for reviews
-- Anyone can read reviews
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (true);

-- Authenticated users can insert their own reviews
CREATE POLICY "Users can insert their own reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews" ON reviews
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Function to automatically update institute rating and review count
CREATE OR REPLACE FUNCTION update_institute_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE institutes
        SET 
            rating = (
                SELECT COALESCE(AVG(rating), 0)
                FROM reviews
                WHERE institute_id = NEW.institute_id
            ),
            review_count = (
                SELECT COUNT(*)
                FROM reviews
                WHERE institute_id = NEW.institute_id
            )
        WHERE id = NEW.institute_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE institutes
        SET 
            rating = (
                SELECT COALESCE(AVG(rating), 0)
                FROM reviews
                WHERE institute_id = NEW.institute_id
            ),
            review_count = (
                SELECT COUNT(*)
                FROM reviews
                WHERE institute_id = NEW.institute_id
            )
        WHERE id = NEW.institute_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE institutes
        SET 
            rating = (
                SELECT COALESCE(AVG(rating), 0)
                FROM reviews
                WHERE institute_id = OLD.institute_id
            ),
            review_count = (
                SELECT COUNT(*)
                FROM reviews
                WHERE institute_id = OLD.institute_id
            )
        WHERE id = OLD.institute_id;
    END IF;
    RETURN NULL; -- result is ignored since this is an AFTER trigger
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger to call the function on review insert, update, or delete
DROP TRIGGER IF EXISTS update_institute_rating_trigger ON reviews;
CREATE TRIGGER update_institute_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_institute_rating();
