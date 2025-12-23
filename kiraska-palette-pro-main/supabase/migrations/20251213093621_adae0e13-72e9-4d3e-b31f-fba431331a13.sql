-- 1. Drop existing policies on orders
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admin and superadmin can view orders" ON public.orders;
DROP POLICY IF EXISTS "Admin and superadmin can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admin and superadmin can delete orders" ON public.orders;

-- 2. Create new policies using has_role function
CREATE POLICY "Public can insert orders"
ON public.orders
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin roles can view orders"
ON public.orders
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Admin roles can update orders"
ON public.orders
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Admin roles can delete orders"
ON public.orders
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- 3. Revoke unnecessary permissions and grant insert to anon
REVOKE ALL ON public.orders FROM anon;
GRANT INSERT ON public.orders TO anon;