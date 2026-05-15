-- Migration to update student_profiles table with new details (DOB, Class, Email, Photo)

-- Add new columns if they don't exist
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE public.student_profiles ADD COLUMN dob TEXT;
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;

    BEGIN
        ALTER TABLE public.student_profiles ADD COLUMN current_class TEXT;
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;

    BEGIN
        ALTER TABLE public.student_profiles ADD COLUMN email TEXT;
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;

    BEGIN
        ALTER TABLE public.student_profiles ADD COLUMN photo_url TEXT;
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
END $$;

-- Update RLS policies to make sure update still works (should be fine as is, but just in case)
-- The existing policy "Users can update their own profile" covers all columns.

-- Optional: If you want to sync the user's email from auth.users (though often better to just keep it independent or rely on auth.users for login)
