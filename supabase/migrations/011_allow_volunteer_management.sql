-- Migration: 011_allow_volunteer_management
-- Purpose: Allow Enterprise Admin portal to read, register, and update volunteers under Row Level Security (RLS)

-- 1. Drop previous overly-restrictive volunteer policies
DROP POLICY IF EXISTS "Protect Volunteers Table" ON public.volunteers;
DROP POLICY IF EXISTS "Allow Read Volunteers Directory" ON public.volunteers;
DROP POLICY IF EXISTS "Allow Insert Volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Allow Update Volunteers" ON public.volunteers;

-- 2. Allow reading volunteers directory
CREATE POLICY "Allow Read Volunteers Directory"
ON public.volunteers
FOR SELECT
TO anon, authenticated
USING (true);

-- 3. Allow registering new volunteers
CREATE POLICY "Allow Insert Volunteers"
ON public.volunteers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 4. Allow updating volunteer credentials and roles
CREATE POLICY "Allow Update Volunteers"
ON public.volunteers
FOR UPDATE
TO anon, authenticated
USING (true);
