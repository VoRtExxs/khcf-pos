-- Migration: 009_update_login_rpc
-- Update login RPC to return role

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
        'role', v_volunteer.role
      )
    );
  ELSE
    RETURN json_build_object('success', false, 'message', 'Invalid credentials');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
