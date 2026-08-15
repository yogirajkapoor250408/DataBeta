import { apiClient } from '../lib/apiClient';
import { KPIGoals } from '../types';

export const goalService = {
  async getBusinessGoals(businessId: string): Promise<KPIGoals> {
    const defaultGoals: KPIGoals = {
      targetRevenue: 100000,
      targetProfitMarginPct: 25.0,
      maxExpenseCap: 50000,
    };

    const res = await apiClient.get<any>('/finance/goals', businessId);
    if (res.data) {
      return {
        targetRevenue: Number(res.data.targetRevenue || defaultGoals.targetRevenue),
        targetProfitMarginPct: Number(res.data.targetProfitMarginPct || defaultGoals.targetProfitMarginPct),
        maxExpenseCap: Number(res.data.maxExpenseCap || defaultGoals.maxExpenseCap),
      };
    }

    return defaultGoals;
  },

  async updateBusinessGoals(businessId: string, goals: KPIGoals): Promise<{ error: Error | null }> {
    const res = await apiClient.put(
      '/finance/goals',
      {
        targetRevenue: goals.targetRevenue,
        targetProfitMarginPct: goals.targetProfitMarginPct,
        maxExpenseCap: goals.maxExpenseCap,
      },
      businessId
    );

    return { error: res.error };
  },
};
