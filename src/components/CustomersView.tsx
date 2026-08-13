import React, { useState, useMemo } from 'react';
import { NormalizedRecord, CurrencyCode, CRMContact } from '../types';
import { calculateCustomerAnalytics } from '../utils/customerProductAnalytics';
import { formatCurrency } from '../utils/currencyFormatter';
import { Customer360Drawer, CustomerDetail } from './Customer360Drawer';
import { Users, Search, ArrowUpDown, ChevronRight, UserCheck, ShoppingBag } from 'lucide-react';

interface CustomersViewProps {
  records: NormalizedRecord[];
  crmDeals: CRMContact[];
  currency: CurrencyCode;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ records, crmDeals, currency }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const customerStats = useMemo(() => calculateCustomerAnalytics(records), [records]);

  // Aggregate rich customer items list
  const customersList: CustomerDetail[] = useMemo(() => {
    const map: Record<string, { total: number; count: number; first: string; last: string }> = {};

    records.forEach((r) => {
      if (r.customer && r.customer.trim()) {
        const name = r.customer.trim();
        const dateStr = r.dateString || (r.date ? r.date.toISOString().split('T')[0] : '');
        if (!map[name]) {
          map[name] = { total: 0, count: 0, first: dateStr, last: dateStr };
        }
        map[name].total += r.revenue || 0;
        map[name].count += 1;
        if (dateStr && dateStr < map[name].first) map[name].first = dateStr;
        if (dateStr && dateStr > map[name].last) map[name].last = dateStr;
      }
    });

    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        totalSpent: data.total,
        orderCount: data.count,
        firstPurchase: data.first,
        lastPurchase: data.last,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [records]);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customersList;
    return customersList.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase().trim()));
  }, [customersList, searchTerm]);

  const handleOpen360 = (cust: CustomerDetail) => {
    setSelectedCustomer(cust);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white p-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-500 uppercase tracking-widest mb-1">
            Customer Intelligence & Accounts
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Active Customer Directory</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
            View lifetime value, order frequency, and deep 360 customer dossiers derived from your operational transaction history.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 px-5 py-3 rounded-2xl text-xs font-bold shrink-0">
          <div>
            <div className="text-slate-400 dark:text-zinc-400 text-[10px] uppercase font-mono">Unique Buyers</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{customerStats.totalUniqueCustomers}</div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-zinc-800" />
          <div>
            <div className="text-slate-400 dark:text-zinc-400 text-[10px] uppercase font-mono">Top Client Share</div>
            <div className="text-xl font-black text-rose-600 dark:text-rose-500">{customerStats.topCustomerSharePct.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white dark:bg-zinc-950 p-4 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customers by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="text-xs font-mono text-slate-500 dark:text-zinc-400">
          Showing {filteredCustomers.length} of {customersList.length} Accounts
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
        {filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-zinc-800">
                  <th className="p-4">Customer Account Name</th>
                  <th className="p-4 text-right">Lifetime Value (LTV)</th>
                  <th className="p-4 text-center">Total Orders</th>
                  <th className="p-4 text-right">Avg Order Value (AOV)</th>
                  <th className="p-4">Last Purchase Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                {filteredCustomers.map((cust) => {
                  const aov = cust.orderCount > 0 ? cust.totalSpent / cust.orderCount : 0;

                  return (
                    <tr
                      key={cust.name}
                      onClick={() => handleOpen360(cust)}
                      className="hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer group"
                    >
                      <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-500 font-bold text-xs flex items-center justify-center border border-rose-200 dark:border-rose-900/60">
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{cust.name}</span>
                      </td>
                      <td className="p-4 text-right font-extrabold text-rose-600 dark:text-rose-500">
                        {formatCurrency(cust.totalSpent, currency)}
                      </td>
                      <td className="p-4 text-center font-mono text-slate-600 dark:text-zinc-300">{cust.orderCount}</td>
                      <td className="p-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(aov, currency)}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-zinc-400 font-mono">{cust.lastPurchase || 'N/A'}</td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-500 group-hover:translate-x-1 transition-transform">
                          <span>View 360</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-500 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">No Customer Accounts Found</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
              Customers will automatically populate as transaction spreadsheets are uploaded or manual entries are recorded.
            </p>
          </div>
        )}
      </div>

      {/* Customer 360 Slide-Over Panel */}
      <Customer360Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        customer={selectedCustomer}
        records={records}
        crmDeals={crmDeals}
        currency={currency}
      />
    </div>
  );
};
