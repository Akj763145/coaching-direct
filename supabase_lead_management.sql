-- 1. Demo Requests (Leads) Table Definition
CREATE TABLE IF NOT EXISTS demo_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Nullable if allowing guest bookings
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
    student_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    request_date DATE NOT NULL,
    request_time VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Scheduled', 'Rejected', 'Completed', 'Cancelled')),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- 3. Row Level Security Policies

-- Policy: Students can insert their own requests
CREATE POLICY "Students can insert demo requests" ON demo_requests
    FOR INSERT 
    WITH CHECK (true); -- Allow all inserts, or restrict to auth.uid() = user_id if strict

-- Policy: Students can view their own requests
CREATE POLICY "Students can view their own demo requests" ON demo_requests
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy: Institutes (sub-admins) can view leads for their institute
-- Assuming sub-admins are linked to an institute somehow, or using a generic approach for demonstration:
CREATE POLICY "Institutes can view their own leads" ON demo_requests
    FOR SELECT 
    USING (
        institute_id IN (
            SELECT id FROM institutes WHERE user_id = auth.uid()
        )
    );

-- Policy: Institutes can update lead statuses (Approve/Reject)
CREATE POLICY "Institutes can update lead status" ON demo_requests
    FOR UPDATE 
    USING (
        institute_id IN (
            SELECT id FROM institutes WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        institute_id IN (
            SELECT id FROM institutes WHERE user_id = auth.uid()
        )
    );

-- 4. Trigger to automatically update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_demo_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_demo_requests_modtime ON demo_requests;
CREATE TRIGGER trigger_update_demo_requests_modtime
BEFORE UPDATE ON demo_requests
FOR EACH ROW EXECUTE PROCEDURE update_demo_requests_updated_at();
