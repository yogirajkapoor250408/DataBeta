-- 1. Add subscription_status and is_admin columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'paid')),
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Helper function for Admins to view everything (Optional - override RLS if you want admin to query via Supabase Client instead of just aggregate counts)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Optional: Add policies allowing admins to SELECT any profile/business
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (is_super_admin());
CREATE POLICY "Admins can view all businesses" ON public.businesses
  FOR SELECT USING (is_super_admin() OR (id IN (SELECT get_user_business_ids()) OR (auth.uid() IS NOT NULL AND created_by = auth.uid())));
CREATE POLICY "Admins can view all datasets" ON public.datasets
  FOR SELECT USING (is_super_admin() OR (business_id IN (SELECT get_user_business_ids())));

-- 3. Helper function to completely delete a dataset and its records (transactions)
CREATE OR REPLACE FUNCTION delete_dataset(target_dataset_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete the dataset (cascade will automatically delete associated transactions)
  DELETE FROM public.datasets WHERE id = target_dataset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
