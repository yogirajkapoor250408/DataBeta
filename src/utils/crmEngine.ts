import { CRMContact, CRMActivity, CRMPipelineSummary, CRMStage, NormalizedRecord } from '../types';

const CRM_STORAGE_KEY = 'databeta_crm_contacts_v1';
const CRM_ACTIVITY_KEY = 'databeta_crm_activities_v1';

export const DEFAULT_CRM_CONTACTS: CRMContact[] = [
  {
    id: 'crm-1',
    name: 'SecurePath Admin',
    company: 'SecurePath',
    email: 'contact@securepath.io',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    stage: 'in_touch',
    dealValue: 15400,
    tags: ['New', 'Priority'],
    notes: 'Cybersecurity auditing and data protection services for enterprises.',
    managerName: 'Helena Mcneil',
    lastContactDate: '17 July',
    createdAt: '2026-07-01',
    totalSpent: 15400,
    orderCount: 4,
    commentsCount: 5,
    attachmentsCount: 2,
  },
  {
    id: 'crm-2',
    name: 'AutoPilot Ops',
    company: 'AutoPilot Systems',
    email: 'info@autopilotsystems.com',
    phone: '+1 (555) 876-5432',
    location: '350 5th Ave, New York, NY',
    stage: 'offer_sent',
    dealValue: 28900,
    tags: ['Priority'],
    notes: 'Process automation and software integration for operational teams.',
    managerName: 'Helena Mcneil',
    lastContactDate: '5 July',
    createdAt: '2026-06-15',
    totalSpent: 28900,
    orderCount: 7,
    commentsCount: 12,
    attachmentsCount: 5,
  },
  {
    id: 'crm-3',
    name: 'SalesOrbit Team',
    company: 'SalesOrbit',
    email: 'hello@salesorbit.com',
    phone: '+1 (555) 345-6789',
    location: 'Austin, TX',
    stage: 'discussion',
    dealValue: 18200,
    tags: ['Repeat'],
    notes: 'Lead generation, CRM implementation and sales workflow optimization.',
    managerName: 'Alex Rivera',
    lastContactDate: '13 July',
    createdAt: '2026-06-20',
    totalSpent: 18200,
    orderCount: 5,
    commentsCount: 3,
    attachmentsCount: 1,
  },
  {
    id: 'crm-4',
    name: 'MedNova Health',
    company: 'MedNova',
    email: 'support@mednova.org',
    phone: '+1 (555) 901-2345',
    location: 'Boston, MA',
    stage: 'in_touch',
    dealValue: 12500,
    tags: ['Repeat'],
    notes: 'Digital healthcare tools and remote patient support services.',
    managerName: 'Sarah Chen',
    lastContactDate: '10 July',
    createdAt: '2026-06-10',
    totalSpent: 12500,
    orderCount: 3,
    commentsCount: 2,
    attachmentsCount: 1,
  },
  {
    id: 'crm-5',
    name: 'GreenPulse Energy',
    company: 'GreenPulse',
    email: 'contact@greenpulse.io',
    phone: '+1 (555) 678-9012',
    location: 'Seattle, WA',
    stage: 'discussion',
    dealValue: 24000,
    tags: ['New', 'High Value'],
    notes: 'Sustainable energy consulting and efficiency optimization for business.',
    managerName: 'Sarah Chen',
    lastContactDate: '8 July',
    createdAt: '2026-07-05',
    totalSpent: 24000,
    orderCount: 6,
    commentsCount: 4,
    attachmentsCount: 3,
  },
];

export function getStoredCRMContacts(): CRMContact[] {
  try {
    const raw = localStorage.getItem(CRM_STORAGE_KEY);
    if (!raw) return DEFAULT_CRM_CONTACTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CRM_CONTACTS;
  } catch {
    return DEFAULT_CRM_CONTACTS;
  }
}

export function saveCRMContacts(contacts: CRMContact[]): void {
  try {
    localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(contacts));
  } catch {
    // LocalStorage fallback
  }
}

export function syncContactsFromTransactions(
  records: NormalizedRecord[],
  existingContacts: CRMContact[]
): CRMContact[] {
  if (!records || records.length === 0) return existingContacts;

  const customerMap: Record<string, { totalRevenue: number; orderCount: number; lastDate: Date | null }> = {};

  for (const r of records) {
    const name = r.customer || r.category || 'Direct Account';
    if (!customerMap[name]) {
      customerMap[name] = { totalRevenue: 0, orderCount: 0, lastDate: null };
    }

    if (r.revenue !== null && r.revenue > 0) {
      customerMap[name].totalRevenue += r.revenue;
    }
    customerMap[name].orderCount += 1;

    if (r.date) {
      if (!customerMap[name].lastDate || r.date > customerMap[name].lastDate) {
        customerMap[name].lastDate = r.date;
      }
    }
  }

  const updatedContacts = [...existingContacts];

  for (const [custName, stats] of Object.entries(customerMap)) {
    const idx = updatedContacts.findIndex(
      (c) => c.company.toLowerCase() === custName.toLowerCase() || c.name.toLowerCase() === custName.toLowerCase()
    );

    if (idx >= 0) {
      updatedContacts[idx] = {
        ...updatedContacts[idx],
        totalSpent: Math.max(updatedContacts[idx].totalSpent, stats.totalRevenue),
        orderCount: Math.max(updatedContacts[idx].orderCount, stats.orderCount),
        dealValue: updatedContacts[idx].dealValue || stats.totalRevenue,
      };
    } else {
      updatedContacts.push({
        id: `crm-auto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: custName,
        company: custName,
        email: `${custName.toLowerCase().replace(/[^a-z0-9]/g, '')}@account.com`,
        stage: stats.totalRevenue > 20000 ? 'closed_won' : 'in_touch',
        dealValue: stats.totalRevenue || 5000,
        tags: stats.orderCount > 3 ? ['Repeat', 'High Value'] : ['New'],
        notes: `Auto-linked customer account from uploaded transactions dataset.`,
        lastContactDate: 'Recent',
        createdAt: new Date().toISOString().split('T')[0],
        totalSpent: stats.totalRevenue,
        orderCount: stats.orderCount,
        commentsCount: 1,
        attachmentsCount: 0,
      });
    }
  }

  saveCRMContacts(updatedContacts);
  return updatedContacts;
}

export function calculatePipelineSummary(contacts: CRMContact[]): CRMPipelineSummary {
  let totalPipelineValue = 0;
  let closedWonCount = 0;
  const stageCounts: Record<CRMStage, number> = {
    in_touch: 0,
    offer_sent: 0,
    discussion: 0,
    closed_won: 0,
    closed_lost: 0,
  };

  for (const c of contacts) {
    totalPipelineValue += c.dealValue || 0;
    stageCounts[c.stage] = (stageCounts[c.stage] || 0) + 1;
    if (c.stage === 'closed_won') {
      closedWonCount++;
    }
  }

  const totalDeals = contacts.length;
  const winRatePct = totalDeals > 0 ? (closedWonCount / totalDeals) * 100 : 0;
  const avgDealSize = totalDeals > 0 ? totalPipelineValue / totalDeals : 0;

  return {
    totalPipelineValue,
    totalDeals,
    winRatePct,
    avgDealSize,
    stageCounts,
  };
}
