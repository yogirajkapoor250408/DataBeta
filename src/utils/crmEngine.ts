import { CRMContact, CRMPipelineSummary, CRMStage } from '../types';

export function calculatePipelineSummary(contacts: CRMContact[]): CRMPipelineSummary {
  let totalPipelineValue = 0;
  let closedWonCount = 0;
  const stageCounts: Record<CRMStage, number> = {
    lead: 0,
    qualified: 0,
    proposal: 0,
    negotiation: 0,
    closed_won: 0,
    closed_lost: 0,
    in_touch: 0,
    offer_sent: 0,
    discussion: 0,
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
