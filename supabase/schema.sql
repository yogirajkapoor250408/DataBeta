-- =================================================================
-- DataBeta Technologies — Production-Ready Database Schema
-- Apply this in your Supabase SQL Editor (one-time setup)
-- =================================================================

-- 1. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Businesses
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'General',
  country TEXT NOT NULL DEFAULT 'United States',
  currency TEXT NOT NULL DEFAULT 'USD',
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Business Members (Multi-Tenancy Join Table)
CREATE TABLE IF NOT EXISTS public.business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'accountant', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (business_id, user_id)
);

-- 4. Datasets (Uploaded file metadata)
CREATE TABLE IF NOT EXISTS public.datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  row_count INT DEFAULT 0,
  mapping JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Transactions (Canonical Financial Ledger)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  dataset_id UUID REFERENCES public.datasets(id) ON DELETE SET NULL,
  date DATE,
  type TEXT,
  revenue NUMERIC(15, 4) DEFAULT 0,
  expense NUMERIC(15, 4) DEFAULT 0,
  profit NUMERIC(15, 4) DEFAULT 0,
  category TEXT,
  customer_name TEXT,
  product_name TEXT,
  quantity NUMERIC(10, 2) DEFAULT 1,
  unit_price NUMERIC(15, 4) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  notes TEXT,
  external_id TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Customers (Summary Table)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  total_spent NUMERIC(15, 4) DEFAULT 0,
  order_count INT DEFAULT 0,
  first_purchase DATE,
  last_purchase DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_business_customer_name UNIQUE (business_id, name)
);

-- 7. Products (Summary Table)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  revenue NUMERIC(15, 4) DEFAULT 0,
  units_sold NUMERIC(10, 2) DEFAULT 0,
  unit_cost NUMERIC(15, 4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_business_product_name UNIQUE (business_id, name)
);

-- 8. CRM Deals
CREATE TABLE IF NOT EXISTS public.crm_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  stage TEXT NOT NULL DEFAULT 'in_touch' CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'in_touch', 'offer_sent', 'discussion')),
  deal_value NUMERIC(15, 4) DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  assigned_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CRM Activities
CREATE TABLE IF NOT EXISTS public.crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Business Goals (ONE per business)
CREATE TABLE IF NOT EXISTS public.business_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  target_revenue NUMERIC(15, 4) DEFAULT 100000,
  target_profit_margin_pct NUMERIC(5, 2) DEFAULT 25.00,
  max_expense_cap NUMERIC(15, 4) DEFAULT 50000,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  summary_data JSONB,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- PERFORMANCE INDEXES
-- =================================================================

CREATE INDEX IF NOT EXISTS idx_transactions_business_date ON public.transactions(business_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_business_id ON public.transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_business_stage ON public.crm_deals(business_id, stage);
CREATE INDEX IF NOT EXISTS idx_business_members_user ON public.business_members(user_id);
CREATE INDEX IF NOT EXISTS idx_business_members_business ON public.business_members(business_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_business ON public.audit_logs(business_id);

-- =================================================================
-- SECURITY: ROW LEVEL SECURITY (RLS)
-- =================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- HELPER SECURITY FUNCTIONS (SECURITY DEFINER to bypass RLS)
-- =================================================================

-- Returns all business IDs the current user is a member of
CREATE OR REPLACE FUNCTION public.get_user_business_ids()
RETURNS TABLE (b_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT business_id FROM public.business_members WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Returns TRUE if the current user is an owner or admin of a given business
CREATE OR REPLACE FUNCTION public.is_business_owner_or_admin(b_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = b_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Returns TRUE if the current user has is_admin = true in their profile
-- SECURITY DEFINER needed because profiles RLS only allows self-read
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =================================================================
-- RLS POLICIES
-- =================================================================

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_super_admin());

-- Businesses
-- FIXED: Removed the broken "created_by" column reference which doesn't exist
DROP POLICY IF EXISTS "Members can view their business" ON public.businesses;
DROP POLICY IF EXISTS "Owners and Admins can update business" ON public.businesses;
DROP POLICY IF EXISTS "Authenticated users can create businesses" ON public.businesses;
DROP POLICY IF EXISTS "Admins can view all businesses" ON public.businesses;

CREATE POLICY "Members can view their business" ON public.businesses
  FOR SELECT USING (id IN (SELECT get_user_business_ids()));
CREATE POLICY "Owners and Admins can update business" ON public.businesses
  FOR UPDATE USING (is_business_owner_or_admin(id));
CREATE POLICY "Authenticated users can create businesses" ON public.businesses
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can view all businesses" ON public.businesses
  FOR SELECT USING (public.is_super_admin());

-- Business Members
DROP POLICY IF EXISTS "Members can view team members" ON public.business_members;
DROP POLICY IF EXISTS "Users can insert their own membership" ON public.business_members;
DROP POLICY IF EXISTS "Owners and Admins can manage members" ON public.business_members;

CREATE POLICY "Members can view team members" ON public.business_members
  FOR SELECT USING (business_id IN (SELECT get_user_business_ids()));
CREATE POLICY "Users can insert their own membership" ON public.business_members
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners and Admins can manage members" ON public.business_members
  FOR ALL USING (is_business_owner_or_admin(business_id));

-- All business-owned entities: strict multi-tenant isolation
DROP POLICY IF EXISTS "Multi-tenant transactions access" ON public.transactions;
DROP POLICY IF EXISTS "Multi-tenant datasets access" ON public.datasets;
DROP POLICY IF EXISTS "Multi-tenant customers access" ON public.customers;
DROP POLICY IF EXISTS "Multi-tenant products access" ON public.products;
DROP POLICY IF EXISTS "Multi-tenant crm_deals access" ON public.crm_deals;
DROP POLICY IF EXISTS "Multi-tenant crm_activities access" ON public.crm_activities;
DROP POLICY IF EXISTS "Multi-tenant business_goals access" ON public.business_goals;
DROP POLICY IF EXISTS "Multi-tenant reports access" ON public.reports;
DROP POLICY IF EXISTS "Multi-tenant audit_logs access" ON public.audit_logs;

CREATE POLICY "Multi-tenant transactions access" ON public.transactions
  FOR ALL USING (business_id IN (SELECT get_user_business_ids()));
CREATE POLICY "Multi-tenant datasets access" ON public.datasets
  FOR ALL USING (business_id IN (SELECT get_user_business_ids()));
CREATE POLICY "Multi-tenant customers access" ON public.customers
  FOR ALL USING (business_id IN (SELECT get_user_business_ids()));
CREATE POLICY "Multi-tenant products access" ON public.products
  FOR ALL USING (business_id IN (SELECT get_user_business_ids()));
CREATE POLICY "Multi-tenant crm_deals access" ON public.crm_deals
  FOR ALL USING (business_id IN (SELECT get_user_business_ids()));
CREATE POLICY "Multi-tenant crm_activities access" ON public.crm_activities
  FOR ALL USING (business_id IN (SELECT get_user_business_ids()));
CREATE POLICY "Multi-tenant business_goals access" ON public.business_goals
  FOR ALL USING (business_id IN (SELECT get_user_business_ids()));
CREATE POLICY "Multi-tenant reports access" ON public.reports
  FOR ALL USING (business_id IN (SELECT get_user_business_ids()));
CREATE POLICY "Multi-tenant audit_logs access" ON public.audit_logs
  FOR ALL USING (business_id IN (SELECT get_user_business_ids()));

-- Admin override policies for all entities
CREATE POLICY "Admin read all transactions" ON public.transactions
  FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Admin read all crm_deals" ON public.crm_deals
  FOR SELECT USING (public.is_super_admin());
CREATE POLICY "Admin read all datasets" ON public.datasets
  FOR SELECT USING (public.is_super_admin());

-- =================================================================
-- TRIGGER: Auto-create profile on new user signup
-- =================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
