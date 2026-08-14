-- ============================================================================
-- DataBeta Production Hardening Migration
-- 2026-08-15: Multi-tenant CRM tables, Invoices, Import Jobs & RLS Isolation
-- ============================================================================

-- 1. Contacts Table
CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_name TEXT,
  role_title TEXT DEFAULT 'Decision Maker',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CRM Tasks Table
CREATE TABLE IF NOT EXISTS public.crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  contact_name TEXT,
  due_date DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'high' CHECK (priority IN ('urgent', 'high', 'normal')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  assigned_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.crm_deals(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'due_soon' CHECK (status IN ('draft', 'sent', 'due_soon', 'overdue', 'paid', 'disputed')),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC(15, 4) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  amount_paid NUMERIC(15, 4) NOT NULL DEFAULT 0,
  balance_due NUMERIC(15, 4) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_biz_invoice_number UNIQUE (business_id, invoice_number)
);

-- 4. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount NUMERIC(15, 4) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'Direct Bank Transfer',
  reference_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Import Jobs Table (Durable Batch Import Tracking)
CREATE TABLE IF NOT EXISTS public.import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  total_rows INT NOT NULL DEFAULT 0,
  valid_rows INT NOT NULL DEFAULT 0,
  error_rows INT NOT NULL DEFAULT 0,
  reconciled_sum NUMERIC(15, 4) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('processing', 'completed', 'failed', 'rolled_back')),
  error_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Upgrade CRM Deals Stages & Columns
ALTER TABLE public.crm_deals
  DROP CONSTRAINT IF EXISTS crm_deals_stage_check;

ALTER TABLE public.crm_deals
  ADD CONSTRAINT crm_deals_stage_check
  CHECK (stage IN ('lead', 'qualified', 'discovery', 'proposal_sent', 'negotiation', 'won', 'lost', 'in_touch', 'offer_sent', 'discussion', 'closed_won', 'closed_lost'));

ALTER TABLE public.crm_deals
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS expected_close_date DATE,
  ADD COLUMN IF NOT EXISTS probability_pct NUMERIC(5, 2) DEFAULT 50,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Direct',
  ADD COLUMN IF NOT EXISTS owner_name TEXT DEFAULT 'Account Executive',
  ADD COLUMN IF NOT EXISTS next_step TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Enable RLS on newly created tables
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;

-- Multi-Tenant RLS Policies for Contacts
CREATE POLICY "Tenant isolation for crm_contacts"
ON public.crm_contacts FOR ALL
USING (business_id IN (SELECT b_id FROM public.get_user_business_ids()))
WITH CHECK (business_id IN (SELECT b_id FROM public.get_user_business_ids()));

-- Multi-Tenant RLS Policies for Tasks
CREATE POLICY "Tenant isolation for crm_tasks"
ON public.crm_tasks FOR ALL
USING (business_id IN (SELECT b_id FROM public.get_user_business_ids()))
WITH CHECK (business_id IN (SELECT b_id FROM public.get_user_business_ids()));

-- Multi-Tenant RLS Policies for Invoices
CREATE POLICY "Tenant isolation for invoices"
ON public.invoices FOR ALL
USING (business_id IN (SELECT b_id FROM public.get_user_business_ids()))
WITH CHECK (business_id IN (SELECT b_id FROM public.get_user_business_ids()));

-- Multi-Tenant RLS Policies for Payments
CREATE POLICY "Tenant isolation for payments"
ON public.payments FOR ALL
USING (business_id IN (SELECT b_id FROM public.get_user_business_ids()))
WITH CHECK (business_id IN (SELECT b_id FROM public.get_user_business_ids()));

-- Multi-Tenant RLS Policies for Import Jobs
CREATE POLICY "Tenant isolation for import_jobs"
ON public.import_jobs FOR ALL
USING (business_id IN (SELECT b_id FROM public.get_user_business_ids()))
WITH CHECK (business_id IN (SELECT b_id FROM public.get_user_business_ids()));

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_crm_contacts_biz ON public.crm_contacts(business_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_biz_due ON public.crm_tasks(business_id, due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_biz_due ON public.invoices(business_id, due_date);
CREATE INDEX IF NOT EXISTS idx_payments_biz ON public.payments(business_id);
CREATE INDEX IF NOT EXISTS idx_import_jobs_biz ON public.import_jobs(business_id);
