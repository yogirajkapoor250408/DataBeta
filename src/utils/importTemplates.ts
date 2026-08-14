import { ImportEntityType } from '../types';

export const IMPORT_TEMPLATES: Record<ImportEntityType, { fileName: string; csvContent: string; description: string }> = {
  contacts: {
    fileName: 'databeta_contacts_template.csv',
    description: 'Import client names, emails, phone numbers, companies, and roles.',
    csvContent: `Name,Email,Phone,Company,Role,Tags,Notes
Sarah Chen,schen@nexusdynamics.com,+1 (555) 234-5678,Nexus Dynamics,VP of Engineering,Decision Maker,Requested SOC2 questionnaire
Marcus Brody,mbrody@vanguard.com,+1 (555) 345-6789,Vanguard Logistics,COO,Procurement,Evaluating multi-hub rollout
Elena Rostova,elena@horizondigital.io,+1 (555) 456-7890,Horizon Digital Media,Partner,Fast Mover,Proposal review in progress`,
  },
  companies: {
    fileName: 'databeta_companies_template.csv',
    description: 'Import commercial accounts, domains, industries, and tiers.',
    csvContent: `Name,Domain,Industry,Tier,Phone,Website,Address
Nexus Dynamics,nexusdynamics.com,Enterprise SaaS,Enterprise,+1 (555) 234-5678,https://nexusdynamics.com,"Austin, TX"
Vanguard Logistics,vanguard.com,Supply Chain,Enterprise,+1 (555) 345-6789,https://vanguard.com,"Chicago, IL"
Horizon Digital,horizondigital.io,Marketing Agency,Mid-Market,+1 (555) 456-7890,https://horizondigital.io,"New York, NY"`,
  },
  deals: {
    fileName: 'databeta_deals_template.csv',
    description: 'Import sales opportunities, stages, amounts, and expected close dates.',
    csvContent: `Title,Company,Contact Name,Contact Email,Stage,Amount,Expected Close Date,Probability,Next Step
Platform License,Nexus Dynamics,Sarah Chen,schen@nexusdynamics.com,negotiation,85000,2026-03-31,85,MSA review
Multi-Hub Rollout,Vanguard Logistics,Marcus Brody,mbrody@vanguard.com,proposal_sent,64000,2026-04-15,70,Follow up call
Performance Suite,Horizon Digital,Elena Rostova,elena@horizondigital.io,proposal_sent,28000,2026-03-15,70,Send scope brief`,
  },
  tasks: {
    fileName: 'databeta_tasks_template.csv',
    description: 'Import sales follow-ups, calls, and action items with due dates.',
    csvContent: `Title,Contact Name,Due Date,Priority,Status
Follow up on proposal review,Elena Rostova,2026-03-10,urgent,pending
Send updated SOC2 compliance brief,Sarah Chen,2026-03-08,high,pending
Confirm PO receipt,David Sterling,2026-03-12,normal,pending`,
  },
  invoices: {
    fileName: 'databeta_invoices_template.csv',
    description: 'Import customer billing, due dates, invoice amounts, and payment statuses.',
    csvContent: `Invoice Number,Customer Name,Issue Date,Due Date,Amount,Amount Paid,Status,Notes
INV-2026-001,Nexus Dynamics,2026-01-05,2026-02-05,22500,0,overdue,Phase 1 Implementation
INV-2026-002,Cobalt BioTech,2026-01-20,2026-03-05,30000,15000,due_soon,Milestone 2
INV-2026-003,Vanguard Logistics,2026-01-10,2026-01-25,18000,18000,paid,Discovery Workshop`,
  },
  transactions: {
    fileName: 'databeta_ledger_template.csv',
    description: 'Import historical revenue and expense transactions with categories.',
    csvContent: `Date,Type,Category,Customer or Product,Amount,Payment Method,Notes
2026-01-10,revenue,Consulting Services,Vanguard Logistics,18000,Wire Transfer,Invoice #003
2026-01-15,expense,Software & Cloud Hosting,AWS Database,3400,Corporate Card,Monthly infra
2026-01-20,revenue,Software License,Cobalt BioTech,15000,ACH Transfer,Milestone 1`,
  },
  products: {
    fileName: 'databeta_products_template.csv',
    description: 'Import product/service offerings, SKUs, prices, and unit costs.',
    csvContent: `Name,SKU,Category,Unit Price,Unit Cost,Description
Enterprise Platform License,SKU-PL-01,Software,25000,5000,Annual cloud instance
Implementation & Onboarding,SKU-IMP-01,Services,12000,4000,Dedicated engineering setup
Premium SLA Support Tier,SKU-SLA-01,Support,8000,1500,24/7 incident response`,
  },
};

export function downloadTemplate(type: ImportEntityType): void {
  const tpl = IMPORT_TEMPLATES[type];
  if (!tpl) return;

  const blob = new Blob([tpl.csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = tpl.fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
