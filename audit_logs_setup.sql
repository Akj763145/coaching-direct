-- Audit Logs dedicated SQL script for Coaching Directory Platform
-- This script sets up the infrastructure for tracking administrative actions.

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CREATE AUDIT_LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,           -- e.g., 'LOGIN', 'CREATE_INSTITUTE', 'UPDATE_SEO'
    user_id TEXT NOT NULL,          -- Flexible type to store sub-admin UUID or Master ID
    username TEXT NOT NULL,         -- Storing username for quick display without joins
    details TEXT,                   -- Descriptive details of the action
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- 3. SECURITY: ROW LEVEL SECURITY (RLS)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES
-- Back-end operations (Express server) use the Service Role Key and bypass RLS.
-- These policies are for added protection when querying via Supabase client directly.

-- Allow MASTER admins to query the logs
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'audit_logs' AND policyname = 'Master admins can view audit logs'
    ) THEN
        CREATE POLICY "Master admins can view audit logs" 
        ON public.audit_logs FOR SELECT 
        TO authenticated 
        USING (
            EXISTS (
                SELECT 1 FROM public.app_users 
                WHERE public.app_users.id::text = auth.uid()::text 
                AND public.app_users.role = 'MASTER'
            )
        );
    END IF;
END $$;

-- Explicitly deny all mutations from user clients
CREATE POLICY "Deny inserts from client" ON public.audit_logs FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny updates from client" ON public.audit_logs FOR UPDATE USING (false);
CREATE POLICY "Deny deletes from client" ON public.audit_logs FOR DELETE USING (false);

COMMENT ON TABLE public.audit_logs IS 'Tracks all administrative and security-relevant actions performed on the platform.';
