import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ColumnMapping, NormalizedRecord, Dataset } from '../types';
import { autoDetectColumns } from './columnMatcher';
import { parseISO, isValid, parse as parseDateWithFormat } from 'date-fns';

export function parseCSV(csvString: string): { headers: string[]; rawRows: Record<string, any>[] } {
  const results = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
  });

  const rawRows = (results.data as Record<string, any>[]).filter(
    (row) => row && Object.values(row).some((v) => v !== null && v !== undefined && String(v).trim() !== '')
  );

  const headers = results.meta.fields || Object.keys(rawRows[0] || {});
  return { headers, rawRows };
}

export function cleanNumber(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  
  const str = String(val).trim();
  if (!str) return null;
  
  // Remove currency signs, letters, commas, keeping digits, dots, minus
  const cleaned = str.replace(/[^0-9.-]/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '.') return null;
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

export function parseDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isValid(val) ? val : null;

  // Handle Excel serial date numbers
  if (typeof val === 'number') {
    const dateObj = XLSX.SSF.parse_date_code(val);
    if (dateObj) {
      const d = new Date(Date.UTC(dateObj.y, dateObj.m - 1, dateObj.d, dateObj.H || 0, dateObj.M || 0, dateObj.S || 0));
      return isValid(d) ? d : null;
    }
  }

  const str = String(val).trim();
  if (!str) return null;

  // Try standard JS Date parsing
  const d1 = new Date(str);
  if (isValid(d1) && d1.getFullYear() > 1990 && d1.getFullYear() < 2100) {
    return d1;
  }

  // Try ISO parse
  const dISO = parseISO(str);
  if (isValid(dISO)) return dISO;

  // Common date format fallbacks
  const formats = [
    'yyyy-MM-dd',
    'MM/dd/yyyy',
    'dd/MM/yyyy',
    'yyyy/MM/dd',
    'dd-MM-yyyy',
    'MM-dd-yyyy'
  ];

  for (const fmt of formats) {
    try {
      const dFmt = parseDateWithFormat(str, fmt, new Date());
      if (isValid(dFmt)) return dFmt;
    } catch {
      // Continue
    }
  }

  return null;
}

export function normalizeRows(
  rawRows: Record<string, any>[],
  mapping: ColumnMapping
): NormalizedRecord[] {
  return rawRows.map((row, idx) => {
    const rawDateVal = mapping.date ? row[mapping.date] : null;
    const parsedDate = parseDate(rawDateVal);
    const dateString = parsedDate ? parsedDate.toISOString().split('T')[0] : (rawDateVal ? String(rawDateVal) : 'N/A');

    const rev = mapping.revenue ? cleanNumber(row[mapping.revenue]) : null;
    const exp = mapping.expense ? cleanNumber(row[mapping.expense]) : null;

    let prof = mapping.profit ? cleanNumber(row[mapping.profit]) : null;
    if (prof === null && rev !== null && exp !== null) {
      prof = rev - exp;
    }

    const cat = mapping.category && row[mapping.category] ? String(row[mapping.category]).trim() : undefined;
    const prod = mapping.product && row[mapping.product] ? String(row[mapping.product]).trim() : undefined;
    const cust = mapping.customer && row[mapping.customer] ? String(row[mapping.customer]).trim() : undefined;
    const qty = mapping.quantity ? cleanNumber(row[mapping.quantity]) || undefined : undefined;

    return {
      id: `row-${idx + 1}`,
      date: parsedDate,
      dateString,
      revenue: rev,
      expense: exp,
      profit: prof,
      category: cat,
      product: prod,
      customer: cust,
      quantity: qty,
      raw: row,
    };
  });
}

export async function parseFile(file: File): Promise<{
  headers: string[];
  rawRows: Record<string, any>[];
  suggestedMapping: ColumnMapping;
  fileName: string;
  fileSize: number;
}> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: 'greedy',
        dynamicTyping: false,
        complete: (results) => {
          if (results.errors.length > 0 && results.data.length === 0) {
            return reject(new Error(results.errors[0].message || 'Failed to parse CSV file.'));
          }

          const rawRows = (results.data as Record<string, any>[]).filter(
            row => row && Object.values(row).some(v => v !== null && v !== undefined && String(v).trim() !== '')
          );

          if (rawRows.length === 0) {
            return reject(new Error('The uploaded CSV file is empty or contains no valid rows.'));
          }

          const headers = results.meta.fields || Object.keys(rawRows[0] || {});
          const suggestedMapping = autoDetectColumns(headers);

          resolve({
            headers,
            rawRows,
            suggestedMapping,
            fileName: file.name,
            fileSize: file.size,
          });
        },
        error: (err) => {
          reject(new Error(err.message || 'Error parsing CSV file.'));
        }
      });
    });
  } else if (extension === 'xlsx' || extension === 'xls') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });

          if (workbook.SheetNames.length === 0) {
            return reject(new Error('The Excel file contains no worksheets.'));
          }

          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

          if (!rawRows || rawRows.length === 0) {
            return reject(new Error('The selected Excel sheet is empty.'));
          }

          const headers = Object.keys(rawRows[0]);
          const suggestedMapping = autoDetectColumns(headers);

          resolve({
            headers,
            rawRows,
            suggestedMapping,
            fileName: file.name,
            fileSize: file.size,
          });
        } catch (err: any) {
          reject(new Error(err?.message || 'Failed to read Excel file. Please ensure it is a valid .xlsx or .xls document.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file from disk.'));
      reader.readAsArrayBuffer(file);
    });
  } else {
    throw new Error('Unsupported file format. DataBeta supports CSV (.csv) and Excel (.xlsx, .xls) files.');
  }
}
