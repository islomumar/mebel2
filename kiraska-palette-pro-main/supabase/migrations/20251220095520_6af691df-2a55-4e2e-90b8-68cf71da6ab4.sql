-- Add SELECT policy for orders table to restrict read access to admin roles only
CREATE POLICY "Only admins can view orders" 
ON public.orders 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'superadmin'::app_role) OR
  has_role(auth.uid(), 'manager'::app_role)
);