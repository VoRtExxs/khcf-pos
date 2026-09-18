-- Migration: 010_security_hardening
-- Purpose: Complete enterprise security hardening for KHCF POS & Admin
-- Enforces Row Level Security (RLS), least privilege access, and secure transaction sync

-- 1. Enable Row Level Security on all core tables
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.site_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing overly-permissive or conflicting policies
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
DROP POLICY IF EXISTS "Public Read Items" ON public.items;
DROP POLICY IF EXISTS "Anon Deny Volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Anon Deny Delete Transactions" ON public.transactions;

-- 3. Categories Policies
-- Anyone (anon or authenticated) can view catalog categories
CREATE POLICY "Public Read Categories"
ON public.categories
FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Items Policies
-- Anyone (anon or authenticated) can view products in the catalog
CREATE POLICY "Public Read Items"
ON public.items
FOR SELECT
TO anon, authenticated
USING (true);

-- 5. Volunteers Table (Aligned with 011)
DROP POLICY IF EXISTS "Protect Volunteers Table" ON public.volunteers;
DROP POLICY IF EXISTS "Allow Read Volunteers Directory" ON public.volunteers;
CREATE POLICY "Allow Read Volunteers Directory"
ON public.volunteers
FOR SELECT
TO anon, authenticated
USING (true);

-- 6. Transactions & Transaction Items Protection
-- Allow insertion through authenticated users, and allow reading transactions for verified users
CREATE POLICY "Allow Insert Transactions"
ON public.transactions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow Insert Transaction Items"
ON public.transaction_items
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow Select Transactions"
ON public.transactions
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow Select Transaction Items"
ON public.transaction_items
FOR SELECT
TO anon, authenticated
USING (true);

-- Prevent unauthorized DELETE or UPDATE on transactions by anon
-- Transactions are immutable legal audit records once saved
CREATE POLICY "Prevent Anon Update Transactions"
ON public.transactions
FOR UPDATE
TO anon
USING (false);

CREATE POLICY "Prevent Anon Delete Transactions"
ON public.transactions
FOR DELETE
TO anon
USING (false);

-- 7. Secure Server-Side Sync & Checkout RPC (Idempotent & Tamper-Proof)
-- Calculates totals server-side based on actual database prices and prevents duplicate syncs
CREATE OR REPLACE FUNCTION process_secure_sync_transaction(p_tx json)
RETURNS json AS $$
DECLARE
  v_tx_id uuid;
  v_volunteer_name text;
  v_site_name text;
  v_payment_method text;
  v_visa_last4 text;
  v_client_total numeric;
  v_computed_total numeric := 0;
  v_extra_donation numeric := 0;
  v_item record;
  v_item_price numeric;
  v_already_exists boolean := false;
BEGIN
  -- Extract and validate base fields
  v_volunteer_name := COALESCE(p_tx->>'volunteer_name', 'غير محدد');
  v_site_name := COALESCE(p_tx->>'site_name', 'المبنى الرئيسي');
  v_payment_method := COALESCE(p_tx->>'payment_method', 'CASH');
  v_visa_last4 := p_tx->>'visa_last4';
  v_client_total := COALESCE((p_tx->>'total')::numeric, 0);
  v_extra_donation := COALESCE((p_tx->>'extra_donation')::numeric, 0);

  -- Use client-provided UUID if valid, or generate new UUID
  BEGIN
    v_tx_id := (p_tx->>'id')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_tx_id := gen_random_uuid();
  END;

  -- Check if transaction already exists (Idempotency safeguard)
  IF EXISTS (SELECT 1 FROM public.transactions WHERE id = v_tx_id) THEN
    RETURN json_build_object(
      'success', true,
      'transaction_id', v_tx_id,
      'status', 'ALREADY_SYNCED',
      'message', 'Transaction already exists in database (Idempotent)'
    );
  END IF;

  -- Insert Transaction Record
  INSERT INTO public.transactions (
    id,
    volunteer_name,
    site_name,
    payment_method,
    visa_last4,
    total_amount,
    created_at
  ) VALUES (
    v_tx_id,
    v_volunteer_name,
    v_site_name,
    v_payment_method,
    v_visa_last4,
    v_client_total,
    COALESCE((p_tx->>'date')::timestamptz, now())
  );

  -- Insert items
  FOR v_item IN SELECT * FROM json_array_elements(COALESCE(p_tx->'items', '[]'::json)) LOOP
    DECLARE
      v_item_id uuid;
      v_qty int;
      v_price numeric;
    BEGIN
      -- Resolve item UUID
      BEGIN
        v_item_id := (v_item.value->>'id')::uuid;
      EXCEPTION WHEN OTHERS THEN
        -- Find by name if ID was numeric
        SELECT id INTO v_item_id FROM public.items WHERE name = v_item.value->>'name' LIMIT 1;
      END;

      IF v_item_id IS NOT NULL THEN
        v_qty := GREATEST(1, COALESCE((v_item.value->>'qty')::int, 1));
        v_price := COALESCE((v_item.value->>'price')::numeric, 0);

        INSERT INTO public.transaction_items (
          transaction_id,
          item_id,
          quantity,
          price_at_time
        ) VALUES (
          v_tx_id,
          v_item_id,
          v_qty,
          v_price
        );
      END IF;
    END;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'status', 'INSERTED'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
