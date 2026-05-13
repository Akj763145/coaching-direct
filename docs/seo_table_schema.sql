-- Supabase PostgreSQL Migration for SEO Platform Settings

-- 1. Create the platform_settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id integer PRIMARY KEY DEFAULT 1,
  title text NOT NULL DEFAULT 'VidyaNation',
  description text,
  keywords text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure only one row exists (id = 1)
  CONSTRAINT platform_settings_id_check CHECK (id = 1)
);

-- 2. Insert initial default row
INSERT INTO public.platform_settings (id, title, description, keywords)
VALUES (
  1, 
  'VidyaNation', 
  'A premium multi-tenant platform for students to explore coaching institutes.', 
  'education, coaching, institutes, learning'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies

-- Allow PUBLIC read access (so generateMetadata or client components can read it)
CREATE POLICY "Allow public read access to platform_settings"
  ON public.platform_settings
  FOR SELECT
  TO public
  USING (true);

-- Allow Admin (Service Role) full access
-- Note: Service role inherently bypasses RLS, but if you want specific admin roles (e.g. auth.users with specific claims):
CREATE POLICY "Allow admin to update platform_settings"
  ON public.platform_settings
  FOR UPDATE
  TO authenticated
  USING (
    -- Replace with your actual admin check logic if using custom claims or an admin table.
    -- Assuming a user role or email check. Example:
    auth.jwt() ->> 'role' = 'MASTER'
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'MASTER'
  );

-- 5. Set up trigger to automatically update 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_platform_settings_updated_at
    BEFORE UPDATE ON public.platform_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
