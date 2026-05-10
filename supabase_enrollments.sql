-- Create enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    razorpay_payment_id TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add new fields to batches table
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS next_class_time TEXT;
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS zoom_link TEXT;

-- Enable Row Level Security (RLS) on enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Create Policies for enrollments
-- 1. Users can view their own enrollments
CREATE POLICY "Users can view their own enrollments" 
    ON public.enrollments 
    FOR SELECT 
    USING (auth.uid() = student_id);

-- 2. Users can insert their own enrollments (for client-side inserts. Server-side using service_role bypasses RLS)
CREATE POLICY "Users can insert their own enrollments" 
    ON public.enrollments 
    FOR INSERT 
    WITH CHECK (auth.uid() = student_id);

-- 3. Users can update their own enrollments
CREATE POLICY "Users can update their own enrollments" 
    ON public.enrollments 
    FOR UPDATE 
    USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);

-- Optional: Create index for faster querying by student_id
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
