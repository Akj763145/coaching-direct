-- 1. INSTITUTES TABLE ENHANCEMENTS
-- Add rating and review_count columns if they don't exist
ALTER TABLE institutes
ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 2. REVIEWS SYSTEM
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(institute_id, user_id)
);

-- RLS for Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- 3. AUTOMATIC RATING CALCULATION
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

DROP TRIGGER IF EXISTS update_institute_rating_trigger ON reviews;
CREATE TRIGGER update_institute_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_institute_rating();

-- 4. DEMO REQUESTS SYSTEM
CREATE TABLE IF NOT EXISTS demo_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
    request_date DATE NOT NULL,
    request_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Scheduled', 'Completed', 'Cancelled')),
    phone VARCHAR(20),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own demo requests" ON demo_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own demo requests" ON demo_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own demo requests" ON demo_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own demo requests" ON demo_requests FOR DELETE USING (auth.uid() = user_id);

-- 5. SAVED INSTITUTES (SHORTLIST)
CREATE TABLE IF NOT EXISTS saved_institutes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, institute_id)
);

ALTER TABLE saved_institutes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved institutes" ON saved_institutes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own saved institutes" ON saved_institutes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own saved institutes" ON saved_institutes FOR DELETE USING (auth.uid() = user_id);

-- 6. USER PREFERENCES
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    target_exam VARCHAR(255),
    class_focus VARCHAR(255),
    max_distance NUMERIC,
    preferred_timing VARCHAR(255),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- 7. GENERAL UTILITIES
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_preferences_modtime ON user_preferences;
CREATE TRIGGER update_user_preferences_modtime
BEFORE UPDATE ON user_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_demo_requests_modtime ON demo_requests;
CREATE TRIGGER update_demo_requests_modtime
BEFORE UPDATE ON demo_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
