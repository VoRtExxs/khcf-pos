-- Migration: 007_auth_security
-- Purpose: Enterprise-grade Volunteer Auth using pgcrypto

-- Enable the pgcrypto extension for Bcrypt hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create the secure volunteers table
CREATE TABLE IF NOT EXISTS public.volunteers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  national_id text UNIQUE NOT NULL, -- Serves as the username
  name text NOT NULL,
  password_hash text NOT NULL,
  status text DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Trigger to automatically hash passwords on INSERT or UPDATE
CREATE OR REPLACE FUNCTION hash_volunteer_password()
RETURNS TRIGGER AS $$
BEGIN
  -- If password_hash doesn't look like a bcrypt hash (doesn't start with $2a$ or $2b$), hash it!
  IF NEW.password_hash NOT LIKE '$2%' THEN
    NEW.password_hash = crypt(NEW.password_hash, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS volunteer_password_trigger ON public.volunteers;
CREATE TRIGGER volunteer_password_trigger
BEFORE INSERT OR UPDATE ON public.volunteers
FOR EACH ROW
EXECUTE FUNCTION hash_volunteer_password();

-- 3. Secure Login Function (RPC)
-- This function allows the frontend to verify credentials without ever exposing the hash
CREATE OR REPLACE FUNCTION login_volunteer(p_national_id text, p_password text)
RETURNS json AS $$
DECLARE
  v_volunteer public.volunteers;
BEGIN
  -- Find the volunteer
  SELECT * INTO v_volunteer FROM public.volunteers WHERE national_id = p_national_id;
  
  -- If not found, or suspended, return null
  IF NOT FOUND OR v_volunteer.status = 'SUSPENDED' THEN
    RETURN json_build_object('success', false, 'message', 'Invalid credentials or suspended account');
  END IF;

  -- Verify password
  IF v_volunteer.password_hash = crypt(p_password, v_volunteer.password_hash) THEN
    -- Success! Return profile info (excluding password hash)
    RETURN json_build_object(
      'success', true,
      'volunteer', json_build_object(
        'id', v_volunteer.id,
        'name', v_volunteer.name,
        'national_id', v_volunteer.national_id,
        'role', 'VOLUNTEER'
      )
    );
  ELSE
    RETURN json_build_object('success', false, 'message', 'Invalid credentials');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
