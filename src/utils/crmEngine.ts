import { CRMContact, CRMActivity, CRMPipelineSummary, CRMStage, NormalizedRecord } from '../types';

const CRM_STORAGE_KEY = 'databeta_crm_contacts_v1';
const CRM_ACTIVITY_KEY = 'databeta_crm_activities_v1';

export const DEFAULT_CRM_CONTACTS: CRMContact[] = [];

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
