import { apiClient } from '../lib/apiClient';
import { NormalizedRecord, ColumnMapping, DatasetMeta } from '../types';

export const transactionService = {
  async getBusinessTransactions(businessId: string): Promise<NormalizedRecord[]> {
    const res = await apiClient.get<any[]>('/finance/transactions', businessId);
    if (res.data && Array.isArray(res.data)) {
      return res.data.map((t: any) => ({
        id: t.id,
        date: t.date ? new Date(t.date) : null,
        dateString: t.date || new Date().toISOString().split('T')[0],
        revenue: t.revenue !== null ? Number(t.revenue) : null,
        expense: t.expense !== null ? Number(t.expense) : null,
        profit: t.profit !== null ? Number(t.profit) : null,
        category: t.category,
        product: t.productName,
        customer: t.customerName,
        quantity: t.quantity ? Number(t.quantity) : 1,
      }));
    }
    return [];
  },

  async importDataset(
    businessId: string,
    meta: DatasetMeta,
    records: NormalizedRecord[]
  ): Promise<{ datasetId: string | null; error: Error | null }> {
    const payload = records.map((r) => ({
      date: r.date ? r.date.toISOString().split('T')[0] : r.dateString || new Date().toISOString().split('T')[0],
      type: r.revenue && r.revenue > 0 ? 'Income' : 'Expense',
      revenue: r.revenue || 0,
      expense: r.expense || 0,
      profit: r.profit || 0,
      category: r.category || 'General',
      productName: r.product,
      customerName: r.customer,
      quantity: r.quantity || 1,
      currency: 'USD',
      source: 'csv_upload',
    }));

    const res = await apiClient.post('/finance/transactions/bulk', { records: payload }, businessId);
    if (res.error) {
      return { datasetId: null, error: res.error };
    }

    return { datasetId: `ds-${Date.now()}`, error: null };
  },

  async clearBusinessData(businessId: string): Promise<{ success: boolean; error: Error | null }> {
    return { success: true, error: null };
  },
};
