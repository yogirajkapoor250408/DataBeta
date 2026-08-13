import { NormalizedRecord } from '../types';

export function exportToCSV(records: NormalizedRecord[], filenamePrefix = 'databeta_transactions'): void {
  if (!records || records.length === 0) return;

  const headers = ['ID', 'Date', 'Customer', 'Product', 'Category', 'Revenue', 'Expense', 'Profit', 'Quantity'];
  const rows = records.map((r) => [
    `"${r.id}"`,
    `"${r.dateString || ''}"`,
    `"${(r.customer || '').replace(/"/g, '""')}"`,
    `"${(r.product || '').replace(/"/g, '""')}"`,
    `"${(r.category || '').replace(/"/g, '""')}"`,
    r.revenue !== null && r.revenue !== undefined ? r.revenue.toFixed(2) : '',
    r.expense !== null && r.expense !== undefined ? r.expense.toFixed(2) : '',
    r.profit !== null && r.profit !== undefined ? r.profit.toFixed(2) : '',
    r.quantity || 1,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(records: NormalizedRecord[], filenamePrefix = 'databeta_transactions'): void {
  if (!records || records.length === 0) return;

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
