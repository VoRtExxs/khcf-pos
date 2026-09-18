-- Migration: 008_admin_role
-- Add role column to volunteers and insert master admin

ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS role text DEFAULT 'VOLUNTEER' CHECK (role IN ('ADMIN', 'VOLUNTEER'));

-- Insert the default admin if it doesn't exist
INSERT INTO public.volunteers (national_id, name, password_hash, role)
VALUES ('100', 'المدير العام', 'admin123', 'ADMIN')
ON CONFLICT (national_id) DO UPDATE SET role = 'ADMIN';
