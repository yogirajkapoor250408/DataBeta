// ============================================================================
// DataBeta: Next Best Action & Prioritization Engine
// Answers: "Who should I contact today, and why?" with actionable rationale
// ============================================================================

import { Deal, Contact, Task, Invoice, NextBestAction } from '../types';
import { formatCurrency } from './currencyFormatter';

export function generateNextBestActions(
  deals: Deal[],
  contacts: Contact[],
  tasks: Task[],
  invoices: Invoice[]
): NextBestAction[] {
  const actions: NextBestAction[] = [];
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 1. Overdue Invoices Requiring Collections Follow-up
  const overdueInvoices = invoices.filter((inv) => {
    if (inv.status === 'paid') return false;
    if (inv.status === 'overdue') return true;
    if (inv.dueDate && inv.dueDate < todayStr && (inv.balanceDue || inv.amount) > 0) return true;
    return false;
  });

  for (const inv of overdueInvoices) {
    const overdueDays = Math.max(
      1,
      Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24))
    );
    const amountDue = inv.balanceDue || inv.amount;

    actions.push({
      id: `act-inv-${inv.id}`,
      type: 'overdue_invoice',
      priority: 'urgent',
      title: `Collect Payment: Invoice #${inv.invoiceNumber}`,
      description: `${inv.customerName} is ${overdueDays} days past due for ${formatCurrency(amountDue, inv.currency)}.`,
      reason: `Invoice due date was ${inv.dueDate}. Follow up on promised payment or send a polite reminder.`,
      entityId: inv.id,
      entityType: 'invoice',
      dealValue: amountDue,
      actionLabel: 'Send Reminder',
      contactName: inv.customerName,
    });
  }

  // 2. Overdue or Today's Priority Follow-up Tasks
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  for (const task of pendingTasks) {
    const isOverdue = task.dueDate < todayStr;
    const isDueToday = task.dueDate === todayStr;

    if (isOverdue || isDueToday) {
      actions.push({
        id: `act-task-${task.id}`,
        type: 'overdue_followup',
        priority: isOverdue || task.priority === 'urgent' ? 'urgent' : 'high',
        title: task.title,
        description: `Scheduled follow-up for ${task.contactName || task.dealTitle || 'client'}.`,
        reason: isOverdue ? `Overdue since ${task.dueDate}` : 'Due today for immediate execution',
        entityId: task.id,
        entityType: 'task',
        actionLabel: 'Complete Task',
        contactName: task.contactName,
      });
    }
  }

  // 3. Stale Proposals (Proposal Sent > 3 days ago with no activity)
  const proposalDeals = deals.filter((d) => d.stage === 'proposal_sent');
  for (const deal of proposalDeals) {
    const daysSince = deal.lastActivityAt
      ? Math.floor((now.getTime() - new Date(deal.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24))
      : 3;

    if (daysSince >= 3) {
      actions.push({
        id: `act-stale-${deal.id}`,
        type: 'stale_deal',
        priority: deal.amount > 10000 ? 'urgent' : 'high',
        title: `Proposal Follow-up: ${deal.companyName || deal.title}`,
        description: `Proposal sent ${daysSince} days ago for ${formatCurrency(deal.amount, deal.currency)}.`,
        reason: `No activity recorded in ${daysSince} days. Review proposal status and address objections.`,
        entityId: deal.id,
        entityType: 'deal',
        dealValue: deal.amount,
        actionLabel: 'Log Call / Check-in',
        contactName: deal.contactName,
        contactPhone: deal.contactPhone,
        contactEmail: deal.contactEmail,
      });
    }
  }

  // 4. Deals at Risk (Past expected close date or missing next step)
  const openDeals = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost');
  for (const deal of openDeals) {
    const closePassed = deal.expectedCloseDate && deal.expectedCloseDate < todayStr;
    const missingNextStep = !deal.nextStep || deal.nextStep.trim() === '';

    if (closePassed) {
      actions.push({
        id: `act-risk-close-${deal.id}`,
        type: 'closing_opportunity',
        priority: 'high',
        title: `Update Close Date: ${deal.title}`,
        description: `Target close date of ${deal.expectedCloseDate} has passed (${formatCurrency(deal.amount, deal.currency)}).`,
        reason: 'Re-align with buyer on real closing timeline and update forecasted month.',
        entityId: deal.id,
        entityType: 'deal',
        dealValue: deal.amount,
        actionLabel: 'Adjust Target Date',
        contactName: deal.contactName,
      });
    } else if (missingNextStep && (deal.stage === 'discovery' || deal.stage === 'negotiation')) {
      actions.push({
        id: `act-risk-step-${deal.id}`,
        type: 'stale_deal',
        priority: 'medium',
        title: `Set Next Action: ${deal.title}`,
        description: `Deal is in ${deal.stage.replace('_', ' ')} stage with no explicit next step.`,
        reason: 'Opportunities without next steps are 3.8x more likely to stall.',
        entityId: deal.id,
        entityType: 'deal',
        dealValue: deal.amount,
        actionLabel: 'Schedule Next Step',
        contactName: deal.contactName,
      });
    }
  }

  // 5. Uncontacted Fresh Leads
  const freshLeads = deals.filter((d) => d.stage === 'lead');
  for (const lead of freshLeads) {
    actions.push({
      id: `act-lead-${lead.id}`,
      type: 'uncontacted_lead',
      priority: 'medium',
      title: `First Discovery Call: ${lead.contactName || lead.companyName}`,
      description: `New lead created for ${formatCurrency(lead.amount, lead.currency)}.`,
      reason: 'Reaching out within 24 hours increases discovery-to-proposal conversion rate by 60%.',
      entityId: lead.id,
      entityType: 'deal',
      dealValue: lead.amount,
      actionLabel: 'Call Lead',
      contactName: lead.contactName,
      contactPhone: lead.contactPhone,
      contactEmail: lead.contactEmail,
    });
  }

  // Sort actions: Urgent first, then High, then Medium, with higher deal values first
  const priorityScore = { urgent: 3, high: 2, medium: 1 };
  return actions.sort((a, b) => {
    const scoreDiff = priorityScore[b.priority] - priorityScore[a.priority];
    if (scoreDiff !== 0) return scoreDiff;
    return (b.dealValue || 0) - (a.dealValue || 0);
  });
}
