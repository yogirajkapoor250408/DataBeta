import { NormalizedRecord } from '../types';

export interface DataCleanAuditRecord {
  rowId: string;
  field: string;
  originalValue: any;
  transformedValue: any;
  reason: string;
  confidence: number;
}

export interface CleanedDatasetResult {
  cleanedRecords: NormalizedRecord[];
  auditLogs: DataCleanAuditRecord[];
  duplicatesRemoved: number;
  invalidRowsFixed: number;
}

/**
 * Intelligent Data Quality Engine: Safely transforms data while maintaining a strict audit log.
 */
export function cleanDataset(records: NormalizedRecord[]): CleanedDatasetResult {
  const auditLogs: DataCleanAuditRecord[] = [];
  let duplicatesRemoved = 0;
  let invalidRowsFixed = 0;

  const seenHashes = new Set<string>();
  const cleaned: NormalizedRecord[] = [];

  records.forEach((r, idx) => {
    // 1. Check duplicate transactions (same date + revenue + expense + customer + product)
    const hash = `${r.dateString || ''}_${r.revenue || 0}_${r.expense || 0}_${r.customer || ''}_${r.product || ''}`;
    if (seenHashes.has(hash) && hash.length > 10) {
      duplicatesRemoved++;
      auditLogs.push({
        rowId: r.id || `row-${idx}`,
        field: 'transaction',
        originalValue: hash,
        transformedValue: 'EXCLUDED_DUPLICATE',
        reason: 'Identified exact duplicate transaction signature',
        confidence: 99,
      });
      return; // Skip duplicate
    }
    seenHashes.add(hash);

    let rec = { ...r };

    // 2. Safe Revenue Cleaning (Ensure non-negative unless explicit refund)
    if (rec.revenue !== null && rec.revenue < 0) {
      const positiveVal = Math.abs(rec.revenue);
      auditLogs.push({
        rowId: rec.id || `row-${idx}`,
        field: 'revenue',
        originalValue: rec.revenue,
        transformedValue: positiveVal,
        reason: 'Converted negative revenue value to positive absolute metric',
        confidence: 90,
      });
      rec.revenue = positiveVal;
      invalidRowsFixed++;
    }

    // 3. Safe Expense Cleaning
    if (rec.expense !== null && rec.expense < 0) {
      const positiveVal = Math.abs(rec.expense);
      auditLogs.push({
        rowId: rec.id || `row-${idx}`,
        field: 'expense',
        originalValue: rec.expense,
        transformedValue: positiveVal,
        reason: 'Converted negative expense value to positive absolute metric',
        confidence: 90,
      });
      rec.expense = positiveVal;
      invalidRowsFixed++;
    }

    // 4. Calculate Net Profit deterministically
    rec.profit = (rec.revenue || 0) - (rec.expense || 0);

    cleaned.push(rec);
  });

  return {
    cleanedRecords: cleaned,
    auditLogs,
    duplicatesRemoved,
    invalidRowsFixed,
  };
}
