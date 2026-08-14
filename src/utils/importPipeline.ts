import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import {
  ImportEntityType,
  ImportPreviewResult,
  ImportRowError,
  NormalizedRecord,
  Deal,
  Contact,
  Invoice,
  Task,
  CurrencyCode,
  DealStage,
  InvoiceStatus,
} from '../types';
import { parseMoneyAmount } from './moneyModel';

// ============================================================================
// ZOD SCHEMAS FOR ENTITY VALIDATION
// ============================================================================

export const NormalizedTransactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  revenue: z.number().min(0),
  expense: z.number().min(0),
  profit: z.number(),
  category: z.string(),
  customer: z.string().optional(),
  product: z.string().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

export const NormalizedDealSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  title: z.string().min(1, 'Deal Title is required'),
  companyName: z.string().min(1, 'Company Name is required'),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  stage: z.enum(['lead', 'qualified', 'discovery', 'proposal_sent', 'negotiation', 'won', 'lost']),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string(),
  expectedCloseDate: z.string(),
  probabilityPct: z.number().min(0).max(100),
  nextStep: z.string().optional(),
  tags: z.array(z.string()),
});

export const NormalizedContactSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string().min(1, 'Contact Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  roleTitle: z.string().optional(),
  tags: z.array(z.string()),
  notes: z.string().optional(),
});

export const NormalizedInvoiceSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  invoiceNumber: z.string().min(1, 'Invoice Number is required'),
  customerName: z.string().min(1, 'Customer Name is required'),
  status: z.enum(['draft', 'sent', 'due_soon', 'overdue', 'paid', 'disputed']),
  issueDate: z.string(),
  dueDate: z.string(),
  amount: z.number().min(0),
  currency: z.string(),
  amountPaid: z.number().min(0),
  balanceDue: z.number().min(0),
});

// ============================================================================
// PARSER & NORMALIZATION PIPELINE
// ============================================================================

export interface ImportPipelineOutput {
  preview: ImportPreviewResult;
  normalizedTransactions: NormalizedRecord[];
  normalizedDeals: Deal[];
  normalizedContacts: Contact[];
  normalizedInvoices: Invoice[];
  totals: {
    totalRevenue: number;
    totalExpense: number;
    netProfit: number;
    totalAmount: number;
    validCount: number;
    errorCount: number;
  };
  errors: ImportRowError[];
}

/**
 * Standardize keys to lowercase and trim spaces
 */
function normalizeRowKeys(raw: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const key of Object.keys(raw)) {
    const cleanKey = key.trim().toLowerCase().replace(/[\s_-]+/g, '');
    clean[cleanKey] = raw[key];
    clean[key.trim()] = raw[key]; // keep original trimmed key as fallback
  }
  return clean;
}

/**
 * Parse date values safely from Excel serials or string formats
 */
export function parseDateSafe(val: any): string {
  if (!val) return new Date().toISOString().split('T')[0];
  
  // If Excel serial number (e.g. 45321)
  if (typeof val === 'number' && val > 20000 && val < 60000) {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + val * 86400000);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }

  const str = String(val).trim();
  if (!str) return new Date().toISOString().split('T')[0];

  // Try standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Try DD/MM/YYYY or MM/DD/YYYY
  const parts = str.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    } else if (parts[2].length === 4) {
      // DD-MM-YYYY or MM-DD-YYYY
      const d = new Date(str);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    }
  }

  const parsed = new Date(str);
  return !isNaN(parsed.getTime()) ? parsed.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
}

/**
 * Execute unified parsing and validation pipeline
 */
export async function executeImportPipeline(
  file: File,
  entityType: ImportEntityType,
  workspaceId: string = 'workspace-current',
  currency: CurrencyCode = 'USD'
): Promise<ImportPipelineOutput> {
  const fileName = file.name;
  let rawRows: Record<string, any>[] = [];

  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  } else {
    const text = await file.text();
    const result = Papa.parse(text, { header: true, skipEmptyLines: 'greedy' });
    rawRows = (result.data as Record<string, any>[]).filter((row) =>
      Object.values(row).some((v) => v !== null && v !== undefined && String(v).trim() !== '')
    );
  }

  const errors: ImportRowError[] = [];
  const normalizedTransactions: NormalizedRecord[] = [];
  const normalizedDeals: Deal[] = [];
  const normalizedContacts: Contact[] = [];
  const normalizedInvoices: Invoice[] = [];

  let totalRev = 0;
  let totalExp = 0;
  let totalAmt = 0;

  rawRows.forEach((raw, idx) => {
    const rowIndex = idx + 1;
    const row = normalizeRowKeys(raw);

    switch (entityType) {
      // ----------------------------------------------------------------------
      // TRANSACTIONS / LEDGER
      // ----------------------------------------------------------------------
      case 'transactions': {
        const dateStr = parseDateSafe(
          row.date || row.transactiondate || row.timestamp || raw.Date || raw.date
        );
        const description =
          row.description || row.desc || row.narration || row.details || raw.Description || '';
        const category =
          row.category || row.categoryname || row.typecategory || raw.Category || 'General';
        const customer =
          row.customer || row.customername || row.client || raw.Customer || raw['Customer Name'] || undefined;
        const product =
          row.product || row.productname || row.item || raw.Product || undefined;
        const paymentMethod =
          row.paymentmethod || row.mode || row.method || raw['Payment Method'] || 'Direct';

        // Check if separate Revenue & Expense columns exist
        const explicitRev = parseMoneyAmount(row.revenue || raw.Revenue || raw.Income);
        const explicitExp = parseMoneyAmount(row.expense || raw.Expense || raw.Cost);

        let finalRev = 0;
        let finalExp = 0;

        if (explicitRev !== null || explicitExp !== null) {
          finalRev = explicitRev !== null ? Math.max(0, explicitRev) : 0;
          finalExp = explicitExp !== null ? Math.max(0, explicitExp) : 0;
        } else {
          // Single Amount column with Type or Sign
          const singleAmountRaw = row.amount || row.value || row.total || raw.Amount;
          const parsedAmount = parseMoneyAmount(singleAmountRaw);

          if (parsedAmount === null) {
            errors.push({
              rowIndex,
              field: 'Amount',
              value: singleAmountRaw,
              reason: 'Invalid or missing numeric amount (no silent zero conversion allowed)',
            });
            return;
          }

          const rawType = String(
            row.type || row.transactiontype || row.creditdebit || raw.Type || ''
          ).toLowerCase();

          if (
            rawType.includes('exp') ||
            rawType.includes('deb') ||
            rawType.includes('out') ||
            rawType.includes('cost') ||
            parsedAmount < 0
          ) {
            finalRev = 0;
            finalExp = Math.abs(parsedAmount);
          } else {
            finalRev = Math.abs(parsedAmount);
            finalExp = 0;
          }
        }

        const profit = Math.round((finalRev - finalExp) * 100) / 100;
        totalRev += finalRev;
        totalExp += finalExp;

        normalizedTransactions.push({
          id: `rec-imp-${Date.now()}-${rowIndex}`,
          date: dateStr,
          dateString: dateStr,
          revenue: finalRev,
          expense: finalExp,
          profit,
          category,
          customer,
          product,
          paymentMethod,
          notes: description,
          currency,
          raw,
        });
        break;
      }

      // ----------------------------------------------------------------------
      // CRM DEALS
      // ----------------------------------------------------------------------
      case 'deals': {
        const title =
          row.title || row.dealname || row.deal || raw.Title || row.company || raw.Company || '';
        const companyName =
          row.company || row.companyname || row.account || raw.Company || title || 'Commercial Client';
        const contactName =
          row.contact || row.contactname || row.lead || raw.Contact || undefined;
        const contactEmail = row.email || row.contactemail || raw.Email || '';
        const contactPhone = row.phone || row.contactphone || raw.Phone || '';

        if (!title.trim()) {
          errors.push({
            rowIndex,
            field: 'Title',
            value: '',
            reason: 'Deal Title or Company Name is required',
          });
          return;
        }

        const rawAmount = row.amount || row.dealvalue || row.value || raw.Amount || 0;
        const amount = parseMoneyAmount(rawAmount);

        if (amount === null || amount < 0) {
          errors.push({
            rowIndex,
            field: 'Amount',
            value: rawAmount,
            reason: 'Deal amount must be a valid positive number',
          });
          return;
        }

        totalAmt += amount;

        let stage: DealStage = 'lead';
        const rawStage = String(row.stage || row.dealstage || raw.Stage || '').toLowerCase();
        if (rawStage.includes('won') || rawStage.includes('closed won')) stage = 'won';
        else if (rawStage.includes('lost') || rawStage.includes('closed lost')) stage = 'lost';
        else if (rawStage.includes('neg') || rawStage.includes('review')) stage = 'negotiation';
        else if (rawStage.includes('prop') || rawStage.includes('sent')) stage = 'proposal_sent';
        else if (rawStage.includes('disc') || rawStage.includes('meet')) stage = 'discovery';
        else if (rawStage.includes('qual')) stage = 'qualified';

        const probabilityPct =
          stage === 'won'
            ? 100
            : stage === 'negotiation'
            ? 85
            : stage === 'proposal_sent'
            ? 70
            : stage === 'discovery'
            ? 50
            : stage === 'qualified'
            ? 30
            : stage === 'lost'
            ? 0
            : 20;

        const expectedCloseDate = parseDateSafe(
          row.expectedclosedate || row.closedate || row.targetdate || raw['Expected Close Date']
        );
        const nextStep =
          row.nextstep || row.action || row.nextaction || raw['Next Step'] || undefined;

        normalizedDeals.push({
          id: `deal-imp-${Date.now()}-${rowIndex}`,
          workspaceId,
          title: title.trim(),
          companyName: companyName.trim(),
          contactName: contactName?.trim(),
          contactEmail,
          contactPhone,
          stage,
          amount,
          currency,
          expectedCloseDate,
          probabilityPct,
          nextStep,
          tags: ['Imported CSV'],
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString(),
        });
        break;
      }

      // ----------------------------------------------------------------------
      // CRM CONTACTS
      // ----------------------------------------------------------------------
      case 'contacts': {
        const name =
          row.name || row.fullname || row.contactname || raw.Name || raw['Full Name'] || '';
        const email = row.email || row.emailaddress || raw.Email || '';
        const phone = row.phone || row.phonenumber || row.mobile || raw.Phone || '';
        const companyName =
          row.company || row.companyname || row.organization || raw.Company || '';
        const roleTitle = row.role || row.roletitle || row.jobtitle || raw.Role || 'Stakeholder';
        const notes = row.notes || row.note || row.memo || raw.Notes || '';

        if (!name.trim()) {
          errors.push({
            rowIndex,
            field: 'Name',
            value: '',
            reason: 'Contact Name is required',
          });
          return;
        }

        normalizedContacts.push({
          id: `contact-imp-${Date.now()}-${rowIndex}`,
          workspaceId,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          companyName: companyName.trim() || undefined,
          roleTitle: roleTitle.trim(),
          tags: ['Imported Contact'],
          notes: notes.trim() || undefined,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString(),
        });
        break;
      }

      // ----------------------------------------------------------------------
      // INVOICES & RECEIVABLES
      // ----------------------------------------------------------------------
      case 'invoices': {
        const invoiceNumber =
          row.invoicenumber || row.invoiceno || row.invnumber || raw['Invoice Number'] || raw.InvoiceNumber || `INV-${rowIndex}`;
        const customerName =
          row.customer || row.customername || row.client || raw.Customer || raw['Customer Name'] || '';
        const rawAmount = row.amount || row.total || row.invoiceamount || raw.Amount || 0;
        const amount = parseMoneyAmount(rawAmount);

        if (!customerName.trim()) {
          errors.push({
            rowIndex,
            field: 'Customer Name',
            value: '',
            reason: 'Customer Name is required for invoices',
          });
          return;
        }

        if (amount === null || amount <= 0) {
          errors.push({
            rowIndex,
            field: 'Amount',
            value: rawAmount,
            reason: 'Invoice amount must be a positive number',
          });
          return;
        }

        totalAmt += amount;
        const issueDate = parseDateSafe(row.issuedate || row.invoicedate || raw['Issue Date']);
        const dueDate = parseDateSafe(row.duedate || row.paymentdue || raw['Due Date']);

        let status: InvoiceStatus = 'due_soon';
        const rawStatus = String(row.status || raw.Status || '').toLowerCase();
        if (rawStatus.includes('paid')) status = 'paid';
        else if (rawStatus.includes('overdue')) status = 'overdue';
        else if (rawStatus.includes('draft')) status = 'draft';
        else {
          const isOverdue = new Date(dueDate) < new Date();
          status = isOverdue ? 'overdue' : 'due_soon';
        }

        const rawPaid = row.amountpaid || row.paid || raw['Amount Paid'];
        const amountPaid = parseMoneyAmount(rawPaid) || (status === 'paid' ? amount : 0);
        const balanceDue = Math.max(0, Math.round((amount - amountPaid) * 100) / 100);

        normalizedInvoices.push({
          id: `inv-imp-${Date.now()}-${rowIndex}`,
          workspaceId,
          invoiceNumber: String(invoiceNumber).trim(),
          customerName: customerName.trim(),
          status,
          issueDate,
          dueDate,
          amount,
          currency,
          amountPaid,
          balanceDue,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString(),
        });
        break;
      }

      default:
        break;
    }
  });

  const validCount =
    entityType === 'transactions'
      ? normalizedTransactions.length
      : entityType === 'deals'
      ? normalizedDeals.length
      : entityType === 'contacts'
      ? normalizedContacts.length
      : normalizedInvoices.length;

  const totalRows = rawRows.length;
  const errorCount = errors.length;

  const sampleRows =
    entityType === 'transactions'
      ? normalizedTransactions.slice(0, 5)
      : entityType === 'deals'
      ? normalizedDeals.slice(0, 5)
      : entityType === 'contacts'
      ? normalizedContacts.slice(0, 5)
      : normalizedInvoices.slice(0, 5);

  const preview: ImportPreviewResult = {
    entityType,
    fileName,
    totalRows,
    validRowsCount: validCount,
    errorRowsCount: errorCount,
    proposedCreates: validCount,
    proposedUpdates: 0,
    proposedSkips: errorCount,
    sampleRows: sampleRows as any[],
    errors,
  };

  return {
    preview,
    normalizedTransactions,
    normalizedDeals,
    normalizedContacts,
    normalizedInvoices,
    totals: {
      totalRevenue: Math.round(totalRev * 100) / 100,
      totalExpense: Math.round(totalExp * 100) / 100,
      netProfit: Math.round((totalRev - totalExp) * 100) / 100,
      totalAmount: Math.round(totalAmt * 100) / 100,
      validCount,
      errorCount,
    },
    errors,
  };
}

/**
 * Post-Import Reconciliation
 * Verifies that persisted record count and monetary sums match preflight preview totals.
 */
export function reconcileImport(
  persistedRecords: any[],
  expectedTotals: {
    validCount: number;
    totalRevenue?: number;
    totalExpense?: number;
    totalAmount?: number;
  }
): {
  isReconciled: boolean;
  discrepancyMessage?: string;
} {
  if (persistedRecords.length !== expectedTotals.validCount) {
    return {
      isReconciled: false,
      discrepancyMessage: `Row count mismatch: expected ${expectedTotals.validCount} rows, persisted ${persistedRecords.length} rows.`,
    };
  }

  if (expectedTotals.totalRevenue !== undefined) {
    const actualRevenue = persistedRecords.reduce(
      (sum, r) => sum + (Number(r.revenue) || 0),
      0
    );
    const diff = Math.abs(actualRevenue - expectedTotals.totalRevenue);
    if (diff > 0.05) {
      return {
        isReconciled: false,
        discrepancyMessage: `Revenue total discrepancy: preview calculated ${expectedTotals.totalRevenue}, persisted records total ${actualRevenue}.`,
      };
    }
  }

  if (expectedTotals.totalExpense !== undefined) {
    const actualExpense = persistedRecords.reduce(
      (sum, r) => sum + (Number(r.expense) || 0),
      0
    );
    const diff = Math.abs(actualExpense - expectedTotals.totalExpense);
    if (diff > 0.05) {
      return {
        isReconciled: false,
        discrepancyMessage: `Expense total discrepancy: preview calculated ${expectedTotals.totalExpense}, persisted records total ${actualExpense}.`,
      };
    }
  }

  return {
    isReconciled: true,
  };
}
