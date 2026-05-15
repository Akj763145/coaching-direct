-- Run this script in your Supabase SQL Editor
-- This adds indices and relationships to drastically speed up enrollment loading in admin panels

-- 1. Index on batches for fast filtering by institute
CREATE INDEX IF NOT EXISTS idx_batches_institute_id ON public.batches(institute_id);

-- 2. Index on enrollments by batch_id
CREATE INDEX IF NOT EXISTS idx_enrollments_batch_id ON public.enrollments(batch_id);

-- 3. We cannot easily create a foreign key from enrollments.student_id to student_profiles.id 
-- because they both reference auth.users(id), but we can create a fast read-only View for the dashboards

DROP VIEW IF EXISTS public.institute_enrollments_view;
CREATE OR REPLACE VIEW public.institute_enrollments_view AS
SELECT 
    e.id AS enrollment_id,
    e.student_id,
    e.batch_id,
    e.razorpay_payment_id,
    e.amount,
    e.status,
    e.created_at,
    b.batch_name,
    b.fee_structure,
    b.institute_id,
    i.name AS institute_name,
    sp.full_name,
    sp.phone_number,
    sp.photo_url,
    sp.current_class,
    sp.education_level
FROM 
    public.enrollments e
JOIN 
    public.batches b ON e.batch_id = b.id
LEFT JOIN 
    public.institutes i ON b.institute_id = i.id
LEFT JOIN 
    public.student_profiles sp ON e.student_id = sp.id;

-- 4. Secure the view
GRANT SELECT ON public.institute_enrollments_view TO authenticated, service_role;
