import { NormalizedRecord, CustomerAnalytics, ProductAnalytics } from '../types';

export function calculateCustomerAnalytics(records: NormalizedRecord[]): CustomerAnalytics {
  const customerMap: Record<string, { totalRevenue: number; orderCount: number }> = {};
  let overallRevenue = 0;

  for (const r of records) {
    if (r.customer && r.revenue && r.revenue > 0) {
      const name = r.customer.trim();
      if (!customerMap[name]) {
        customerMap[name] = { totalRevenue: 0, orderCount: 0 };
      }
      customerMap[name].totalRevenue += r.revenue;
      customerMap[name].orderCount += 1;
      overallRevenue += r.revenue;
    }
  }

  const customerEntries = Object.entries(customerMap).map(([name, data]) => ({
    name,
    totalRevenue: data.totalRevenue,
    orderCount: data.orderCount,
  })).sort((a, b) => b.totalRevenue - a.totalRevenue);

  const totalUniqueCustomers = customerEntries.length;

  if (totalUniqueCustomers === 0) {
    return {
      totalUniqueCustomers: 0,
      topCustomerName: null,
      topCustomerRevenue: 0,
      topCustomerSharePct: 0,
      paretoRatioPct: 0,
      topCustomersList: [],
    };
  }

  const topCustomer = customerEntries[0];
  const topCustomerSharePct = overallRevenue > 0 ? (topCustomer.totalRevenue / overallRevenue) * 100 : 0;

  // Compute Pareto 80/20 rule ratio
  const top20Count = Math.max(1, Math.ceil(totalUniqueCustomers * 0.2));
  const top20Revenue = customerEntries.slice(0, top20Count).reduce((sum, c) => sum + c.totalRevenue, 0);
  const paretoRatioPct = overallRevenue > 0 ? (top20Revenue / overallRevenue) * 100 : 0;

  return {
    totalUniqueCustomers,
    topCustomerName: topCustomer.name,
    topCustomerRevenue: topCustomer.totalRevenue,
    topCustomerSharePct,
    paretoRatioPct,
    topCustomersList: customerEntries.slice(0, 10),
  };
}

export function calculateProductAnalytics(records: NormalizedRecord[]): ProductAnalytics {
  const productMap: Record<string, { revenue: number; quantity: number }> = {};

  for (const r of records) {
    if (r.product) {
      const name = r.product.trim();
      if (!productMap[name]) {
        productMap[name] = { revenue: 0, quantity: 0 };
      }
      if (r.revenue) productMap[name].revenue += r.revenue;
      if (r.quantity) productMap[name].quantity += r.quantity;
      else productMap[name].quantity += 1;
    }
  }

  const leaderboard = Object.entries(productMap).map(([name, data]) => {
    const qty = data.quantity || 1;
    const avgPrice = data.revenue > 0 ? data.revenue / qty : 0;
    return {
      name,
      revenue: data.revenue,
      quantity: qty,
      avgPrice,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const totalProducts = leaderboard.length;

  if (totalProducts === 0) {
    return {
      totalProducts: 0,
      topProductByRevenue: null,
      topProductByMargin: null,
      productLeaderboard: [],
    };
  }

  const topByRev = leaderboard[0];
  const topByPrice = [...leaderboard].sort((a, b) => b.avgPrice - a.avgPrice)[0];

  return {
    totalProducts,
    topProductByRevenue: topByRev,
    topProductByMargin: topByPrice ? { name: topByPrice.name, avgPrice: topByPrice.avgPrice, marginPct: 65 } : null,
    productLeaderboard: leaderboard.slice(0, 10),
  };
}
