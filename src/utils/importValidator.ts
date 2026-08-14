import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ImportEntityType, ImportPreviewResult, ImportRowError } from '../types';

export async function parseAndValidateImport(
  file: File,
  entityType: ImportEntityType
): Promise<ImportPreviewResult> {
  const fileName = file.name;
  let rawRows: Record<string, any>[] = [];

  // Parse CSV or Excel
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    rawRows = XLSX.utils.sheet_to_json(sheet);
  } else {
    const text = await file.text();
    const result = Papa.parse(text, { header: true, skipEmptyLines: true });
    rawRows = result.data as Record<string, any>[];
  }

  const totalRows = rawRows.length;
  const errors: ImportRowError[] = [];
  const validRows: Record<string, any>[] = [];

  rawRows.forEach((row, idx) => {
    const rowIndex = idx + 1;
    let hasError = false;

    // Entity-Specific Validation Rules
    switch (entityType) {
      case 'contacts':
        if (!row.Name && !row.name && !row['Full Name']) {
          errors.push({ rowIndex, field: 'Name', value: '', reason: 'Contact Name is required' });
          hasError = true;
        }
        break;

      case 'deals':
        if (!row.Title && !row.title && !row.Company && !row.company) {
          errors.push({ rowIndex, field: 'Title', value: '', reason: 'Deal Title or Company Name is required' });
          hasError = true;
        }
        const amt = Number(row.Amount || row.amount || row['Deal Value'] || 0);
        if (isNaN(amt) || amt < 0) {
          errors.push({ rowIndex, field: 'Amount', value: row.Amount, reason: 'Amount must be a valid positive number' });
          hasError = true;
        }
        break;

      case 'invoices':
        if (!row['Invoice Number'] && !row.invoice_number && !row.InvoiceNumber) {
          errors.push({ rowIndex, field: 'Invoice Number', value: '', reason: 'Invoice Number is required' });
          hasError = true;
        }
        if (!row['Customer Name'] && !row.customer_name && !row.Customer) {
          errors.push({ rowIndex, field: 'Customer Name', value: '', reason: 'Customer Name is required' });
          hasError = true;
        }
        break;

      case 'tasks':
        if (!row.Title && !row.title) {
          errors.push({ rowIndex, field: 'Title', value: '', reason: 'Task Title is required' });
          hasError = true;
        }
        break;

      case 'transactions':
        const rev = Number(row.Revenue || row.revenue || row.Amount || 0);
        const exp = Number(row.Expense || row.expense || 0);
        if (isNaN(rev) && isNaN(exp)) {
          errors.push({ rowIndex, field: 'Amount', value: row.Revenue || row.Expense, reason: 'Revenue or Expense must be numeric' });
          hasError = true;
        }
        break;

      default:
        break;
    }

    if (!hasError) {
      validRows.push(row);
    }
  });

  return {
    entityType,
    fileName,
    totalRows,
    validRowsCount: validRows.length,
    errorRowsCount: totalRows - validRows.length,
    proposedCreates: validRows.length,
    proposedUpdates: 0,
    proposedSkips: totalRows - validRows.length,
    sampleRows: validRows.slice(0, 5),
    errors,
  };
}
