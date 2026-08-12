import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { KPIGoals } from '../types';

export const goalService = {
  async getBusinessGoals(businessId: string): Promise<KPIGoals> {
    const defaultGoals: KPIGoals = {
      targetRevenue: 100000,
      targetProfitMarginPct: 25.0,
      maxExpenseCap: 50000,
    };

    if (!isSupabaseConfigured()) return defaultGoals;

    const { data, error } = await supabase
      .from('business_goals')
      .select('*')
      .eq('business_id', businessId)
      .maybeSingle();

    if (error || !data) return defaultGoals;

    return {
      targetRevenue: Number(data.target_revenue || 100000),
      targetProfitMarginPct: Number(data.target_profit_margin_pct || 25.0),
      maxExpenseCap: Number(data.max_expense_cap || 50000),
    };
  },

  async updateBusinessGoals(businessId: string, goals: KPIGoals): Promise<{ error: Error | null }> {
    if (!isSupabaseConfigured()) return { error: null };

    const { error } = await supabase
      .from('business_goals')
      .upsert(
        {
          business_id: businessId,
          target_revenue: goals.targetRevenue,
          target_profit_margin_pct: goals.targetProfitMarginPct,
          max_expense_cap: goals.maxExpenseCap,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'business_id' }
      );

    return { error };
  },
};
