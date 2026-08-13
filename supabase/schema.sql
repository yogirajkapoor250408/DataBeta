-- DataBeta PostgreSQL Database Schema & Row Level Security Policies

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Businesses Table (Multi-tenant organizations)
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  country TEXT,
  currency TEXT DEFAULT 'USD',
  logo_url TEXT,
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Business Memberships (User-to-Business RBAC mapping)
CREATE TABLE IF NOT EXISTS public.business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'accountant', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_business_user UNIQUE (business_id, user_id)
);

-- 5. Datasets Metadata
CREATE TABLE IF NOT EXISTS public.datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  row_count INT,
  mapping JSONB,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Transactions (Canonical Financial Model)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  dataset_id UUID REFERENCES public.datasets(id) ON DELETE SET NULL,
  date DATE,
  type TEXT,
  revenue NUMERIC(12, 2) DEFAULT 0,
  expense NUMERIC(12, 2) DEFAULT 0,
  profit NUMERIC(12, 2) DEFAULT 0,
  category TEXT,
  customer_name TEXT,
  product_name TEXT,
  quantity NUMERIC(10, 2) DEFAULT 1,
  unit_price NUMERIC(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  notes TEXT,
  external_id TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  total_spent NUMERIC(12, 2) DEFAULT 0,
  order_count INT DEFAULT 0,
  first_purchase DATE,
  last_purchase DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_business_customer_name UNIQUE (business_id, name)
);

-- 8. Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  revenue NUMERIC(12, 2) DEFAULT 0,
  units_sold NUMERIC(10, 2) DEFAULT 0,
  unit_cost NUMERIC(12, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_business_product_name UNIQUE (business_id, name)
);

-- 9. CRM Deals
CREATE TABLE IF NOT EXISTS public.crm_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  stage TEXT NOT NULL DEFAULT 'in_touch' CHECK (stage IN ('in_touch', 'offer_sent', 'discussion', 'closed_won', 'closed_lost')),
  deal_value NUMERIC(12, 2) DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  assigned_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CRM Activities
CREATE TABLE IF NOT EXISTS public.crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Business Goals
CREATE TABLE IF NOT EXISTS public.business_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  target_revenue NUMERIC(12, 2) DEFAULT 100000,
  target_profit_margin_pct NUMERIC(5, 2) DEFAULT 25.00,
  max_expense_cap NUMERIC(12, 2) DEFAULT 50000,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Reports
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

-- 13. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_transactions_business_date ON public.transactions(business_id, date);
CREATE INDEX IF NOT EXISTS idx_crm_deals_business_stage ON public.crm_deals(business_id, stage);
CREATE INDEX IF NOT EXISTS idx_business_members_user ON public.business_members(user_id);

-- =================================================================
-- SECURITY: ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================

-- Enable RLS on all tables
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

-- Helper Security Function: Get user's authorized business IDs
CREATE OR REPLACE FUNCTION public.get_user_business_ids()
RETURNS TABLE (b_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT business_id FROM public.business_members WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper Security Function: Check if user is owner or admin of a business
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

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Businesses Policies
CREATE POLICY "Members can view their business" ON public.businesses
  FOR SELECT USING (id IN (SELECT get_user_business_ids()) OR (auth.uid() IS NOT NULL AND created_by = auth.uid()));
CREATE POLICY "Owners and Admins can update business" ON public.businesses
  FOR UPDATE USING (is_business_owner_or_admin(id));
CREATE POLICY "Authenticated users can create businesses" ON public.businesses
  FOR INSERT TO authenticated WITH CHECK (true);

-- Business Members Policies
CREATE POLICY "Members can view team members" ON public.business_members
  FOR SELECT USING (business_id IN (SELECT get_user_business_ids()));
CREATE POLICY "Users can insert their own membership" ON public.business_members
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners and Admins can manage members" ON public.business_members
  FOR ALL USING (is_business_owner_or_admin(business_id));

-- Multi-Tenant RLS Policies for Business-Owned Entities
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
