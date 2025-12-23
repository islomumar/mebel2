-- 1) Drop orders_limited view completely
DROP VIEW IF EXISTS public.orders_limited CASCADE;

-- 2) Harden orders table columns
ALTER TABLE public.orders
  ALTER COLUMN customer_name SET NOT NULL,
  ALTER COLUMN phone SET NOT NULL,
  ALTER COLUMN total_amount SET NOT NULL;

-- Ensure total_amount is positive
ALTER TABLE public.orders
  ADD CONSTRAINT orders_total_amount_positive
  CHECK (total_amount > 0);

-- Basic phone format validation (international format, 7-20 chars, digits and + allowed)
ALTER TABLE public.orders
  ADD CONSTRAINT orders_phone_format_valid
  CHECK (phone ~ '^[0-9+][0-9+\-() ]{6,19}$');

-- 3) Reset RLS policies on orders to match desired model
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admin roles can view orders" ON public.orders;
DROP POLICY IF EXISTS "Admin roles can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admin roles can delete orders" ON public.orders;

-- Public (anon) can only INSERT, subject to table-level validation above
CREATE POLICY "Public can insert orders"
ON public.orders
FOR INSERT
TO anon
WITH CHECK (true);

-- Admin/Superadmin have full access to orders
CREATE POLICY "Admin roles can manage orders"
ON public.orders
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- Ensure anon has only INSERT privilege at SQL level
REVOKE ALL ON public.orders FROM anon;
GRANT INSERT ON public.orders TO anon;