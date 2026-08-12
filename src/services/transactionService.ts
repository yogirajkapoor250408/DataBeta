import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { NormalizedRecord, ColumnMapping, DatasetMeta } from '../types';

export const transactionService = {
  async getBusinessTransactions(businessId: string): Promise<NormalizedRecord[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('business_id', businessId)
      .order('date', { ascending: false });

    if (error || !data) return [];

    return data.map((t: any) => ({
      id: t.id,
      date: t.date ? new Date(t.date) : null,
      dateString: t.date || new Date().toISOString().split('T')[0],
      revenue: t.revenue !== null ? Number(t.revenue) : null,
      expense: t.expense !== null ? Number(t.expense) : null,
      profit: t.profit !== null ? Number(t.profit) : null,
      category: t.category,
      product: t.product_name,
      customer: t.customer_name,
      quantity: t.quantity ? Number(t.quantity) : 1,
    }));
  },

  async importDataset(
    businessId: string,
    meta: DatasetMeta,
    records: NormalizedRecord[]
  ): Promise<{ datasetId: string | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { datasetId: `local-ds-${Date.now()}`, error: null };
    }

    // 1. Create Dataset metadata entry
    const { data: ds, error: dsError } = await supabase
      .from('datasets')
      .insert({
        business_id: businessId,
        file_name: meta.fileName,
        file_size: meta.fileSize,
        row_count: meta.rowCount,
        mapping: meta.mapping as any,
      })
      .select('id')
      .single();

    if (dsError || !ds) {
      return { datasetId: null, error: dsError || new Error('Failed to create dataset metadata') };
    }

    // 2. Prepare transaction rows for batch insertion
    const dbRows = records.map((r) => ({
      business_id: businessId,
      dataset_id: ds.id,
      date: r.date ? r.date.toISOString().split('T')[0] : null,
      revenue: r.revenue !== null ? r.revenue : 0,
      expense: r.expense !== null ? r.expense : 0,
      profit: r.profit !== null ? r.profit : (r.revenue || 0) - (r.expense || 0),
      category: r.category || 'General',
      customer_name: r.customer || null,
      product_name: r.product || null,
      quantity: r.quantity || 1,
    }));

    // Batch insert in chunks of 500 to avoid payload limits
    const BATCH_SIZE = 500;
    for (let i = 0; i < dbRows.length; i += BATCH_SIZE) {
      const batch = dbRows.slice(i, i + BATCH_SIZE);
      const { error: batchError } = await supabase.from('transactions').insert(batch);
      if (batchError) {
        return { datasetId: ds.id, error: batchError };
      }
    }

    // 3. Upsert Customers & Products summary tables asynchronously
    await this.syncCustomersAndProducts(businessId, records);

    return { datasetId: ds.id, error: null };
  },

  async addSingleTransaction(
    businessId: string,
    rec: NormalizedRecord
  ): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) return { error: null };

    const { error } = await supabase.from('transactions').insert({
      business_id: businessId,
      date: rec.date ? rec.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      revenue: rec.revenue !== null ? rec.revenue : 0,
      expense: rec.expense !== null ? rec.expense : 0,
      profit: rec.profit !== null ? rec.profit : (rec.revenue || 0) - (rec.expense || 0),
      category: rec.category || 'General',
      customer_name: rec.customer || null,
      product_name: rec.product || null,
      quantity: rec.quantity || 1,
    });

    if (!error) {
      await this.syncCustomersAndProducts(businessId, [rec]);
    }

    return { error };
  },

  async clearBusinessTransactions(businessId: string): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) return { error: null };

    const { error } = await supabase.from('transactions').delete().eq('business_id', businessId);
    return { error };
  },

  async syncCustomersAndProducts(businessId: string, records: NormalizedRecord[]) {
    if (!isSupabaseConfigured()) return;

    // Extract unique customers
    const customerMap: Record<string, { total: number; count: number; date: string }> = {};
    const productMap: Record<string, { total: number; count: number; category: string }> = {};

    records.forEach((r) => {
      const dateStr = r.date ? r.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      if (r.customer) {
        const c = r.customer.trim();
        if (!customerMap[c]) customerMap[c] = { total: 0, count: 0, date: dateStr };
        customerMap[c].total += r.revenue || 0;
        customerMap[c].count += 1;
      }
      if (r.product) {
        const p = r.product.trim();
        if (!productMap[p]) productMap[p] = { total: 0, count: 0, category: r.category || 'General' };
        productMap[p].total += r.revenue || 0;
        productMap[p].count += r.quantity || 1;
      }
    });

    const custInserts = Object.entries(customerMap).map(([name, val]) => ({
      business_id: businessId,
      name,
      total_spent: val.total,
      order_count: val.count,
      last_purchase: val.date,
    }));

    if (custInserts.length > 0) {
      try {
        await supabase.from('customers').upsert(custInserts, { onConflict: 'id' });
      } catch {}
    }

    const prodInserts = Object.entries(productMap).map(([name, val]) => ({
      business_id: businessId,
      name,
      category: val.category,
      revenue: val.total,
      units_sold: val.count,
    }));

    if (prodInserts.length > 0) {
      try {
        await supabase.from('products').upsert(prodInserts, { onConflict: 'id' });
      } catch {}
    }
  },
};
