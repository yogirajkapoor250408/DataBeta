import React, { useState, useMemo } from 'react';
import { NormalizedRecord, CurrencyCode, CRMContact } from '../types';
import { calculateCustomerAnalytics } from '../utils/customerProductAnalytics';
import { formatCurrency } from '../utils/currencyFormatter';
import { Customer360Drawer, CustomerDetail } from './Customer360Drawer';
import {
  Users,
  Search,
  ArrowUpDown,
  ChevronRight,
  UserCheck,
  ShoppingBag,
  Award,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Plus,
  Filter,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface CustomersViewProps {
  records: NormalizedRecord[];
  crmDeals: CRMContact[];
  currency: CurrencyCode;
}

type CustomerSegmentFilter = 'all' | 'champions' | 'loyal' | 'recent' | 'at_risk';

export const CustomersView: React.FC<CustomersViewProps> = ({ records, crmDeals, currency }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<CustomerSegmentFilter>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const customerStats = useMemo(() => calculateCustomerAnalytics(records), [records]);

  // Aggregate rich customer items list
  const customersList: (CustomerDetail & {
    segment: 'champion' | 'loyal' | 'active' | 'at_risk';
    avgOrderValue: number;
    daysSinceLastOrder: number;
  })[] = useMemo(() => {
    const map: Record<string, { total: number; count: number; first: string; last: string }> = {};

    records.forEach((r) => {
      if (r.customer && r.customer.trim()) {
        const name = r.customer.trim();
        const dateStr = r.dateString || (typeof r.date === 'string' ? r.date : r.date instanceof Date ? r.date.toISOString().split('T')[0] : '');
        if (!map[name]) {
          map[name] = { total: 0, count: 0, first: dateStr, last: dateStr };
        }
        map[name].total += r.revenue || 0;
        map[name].count += 1;
        if (dateStr && (!map[name].first || dateStr < map[name].first)) map[name].first = dateStr;
        if (dateStr && (!map[name].last || dateStr > map[name].last)) map[name].last = dateStr;
      }
    });

    const now = new Date().getTime();

    return Object.entries(map)
      .map(([name, data]) => {
        const lastDate = data.last ? new Date(data.last).getTime() : 0;
        const daysSinceLast = lastDate ? Math.floor((now - lastDate) / (1000 * 60 * 60 * 24)) : 999;
        const avgOrder = data.count > 0 ? data.total / data.count : 0;

        let segment: 'champion' | 'loyal' | 'active' | 'at_risk' = 'active';
        if (data.total >= 5000 || data.count >= 5) segment = 'champion';
        else if (data.count >= 3) segment = 'loyal';
        else if (daysSinceLast > 60) segment = 'at_risk';

        return {
          name,
          totalSpent: data.total,
          orderCount: data.count,
          firstPurchase: data.first,
          lastPurchase: data.last,
          segment,
          avgOrderValue: avgOrder,
          daysSinceLastOrder: daysSinceLast,
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [records]);

  // Segment Counts
  const segmentCounts = useMemo(() => {
    return {
      all: customersList.length,
      champions: customersList.filter((c) => c.segment === 'champion').length,
      loyal: customersList.filter((c) => c.segment === 'loyal').length,
      recent: customersList.filter((c) => c.daysSinceLastOrder <= 30).length,
      at_risk: customersList.filter((c) => c.daysSinceLastOrder > 60).length,
    };
  }, [customersList]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    let result = customersList;

    if (segmentFilter === 'champions') {
      result = result.filter((c) => c.segment === 'champion');
    } else if (segmentFilter === 'loyal') {
      result = result.filter((c) => c.segment === 'loyal');
    } else if (segmentFilter === 'recent') {
      result = result.filter((c) => c.daysSinceLastOrder <= 30);
    } else if (segmentFilter === 'at_risk') {
      result = result.filter((c) => c.daysSinceLastOrder > 60);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }

    return result;
  }, [customersList, segmentFilter, searchTerm]);

  // Overall Customer Metrics
  const avgLTV = useMemo(() => {
    if (customersList.length === 0) return 0;
    const totalSpent = customersList.reduce((acc, c) => acc + c.totalSpent, 0);
    return totalSpent / customersList.length;
  }, [customersList]);

  const repeatCustomerRate = useMemo(() => {
    if (customersList.length === 0) return 0;
    const repeatCount = customersList.filter((c) => c.orderCount > 1).length;
    return (repeatCount / customersList.length) * 100;
  }, [customersList]);

  const handleOpen360 = (cust: CustomerDetail) => {
    setSelectedCustomer(cust);
    setIsDrawerOpen(true);
  };

  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) return;
    const headers = ['Customer Name', 'Total Revenue Spent', 'Order Count', 'Avg Order Value', 'First Purchase', 'Last Purchase', 'Segment'];
    const rows = filteredCustomers.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      c.totalSpent,
      c.orderCount,
      c.avgOrderValue.toFixed(2),
      `"${c.firstPurchase}"`,
      `"${c.lastPurchase}"`,
      `"${c.segment}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `databeta-customers-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white p-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-500 uppercase tracking-widest mb-1">
            <Users className="w-4 h-4 text-rose-600" />
            <span>Customer Intelligence & Accounts</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Active Customer Directory</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
            View lifetime value (LTV), order frequency, retention health, and open deep 360 customer dossiers.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-extrabold text-xs rounded-full border border-slate-200 dark:border-zinc-800 flex items-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Export Directory</span>
        </button>
      </div>

      {/* 4 Customer Intelligence Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Total Buyer Accounts</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {customersList.length.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">Unique entities</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Average Customer LTV</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(avgLTV, currency)}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">Lifetime value per client</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Repeat Buyer Rate</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-500">
            {repeatCustomerRate.toFixed(1)}%
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">Accounts with 2+ orders</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Top Client Share</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {customerStats.topCustomerSharePct.toFixed(1)}%
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{customerStats.topCustomerName || 'N/A'}</p>
        </div>
      </div>

      {/* Segment Selector & Search Bar */}
      <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        {/* Search */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients by company or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Segment Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
          {[
            { key: 'all', label: `All Clients (${segmentCounts.all})`, icon: Users },
            { key: 'champions', label: `VIP Champions (${segmentCounts.champions})`, icon: Award },
            { key: 'loyal', label: `Loyal Accounts (${segmentCounts.loyal})`, icon: UserCheck },
            { key: 'recent', label: `Recent (<30D) (${segmentCounts.recent})`, icon: Clock },
            { key: 'at_risk', label: `At-Risk (>60D) (${segmentCounts.at_risk})`, icon: AlertTriangle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = segmentFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSegmentFilter(tab.key as CustomerSegmentFilter)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-xs transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-zinc-800">
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Segment Health</th>
                <th className="p-3.5 text-center">Orders</th>
                <th className="p-3.5 text-right">Avg Order Value</th>
                <th className="p-3.5 text-right">Total Lifetime Revenue</th>
                <th className="p-3.5">Last Purchase Date</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-900 font-medium">
              {filteredCustomers.map((cust) => (
                <tr
                  key={cust.name}
                  onClick={() => handleOpen360(cust)}
                  className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors"
                >
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center border border-rose-200 dark:border-rose-900/60 shrink-0">
                        {cust.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{cust.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    {cust.segment === 'champion' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] border border-amber-200 dark:border-amber-900">
                        ⭐ VIP Champion
                      </span>
                    )}
                    {cust.segment === 'loyal' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] border border-blue-200 dark:border-blue-900">
                        Loyal Buyer
                      </span>
                    )}
                    {cust.segment === 'active' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] border border-emerald-200 dark:border-emerald-900">
                        Active Account
                      </span>
                    )}
                    {cust.segment === 'at_risk' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-extrabold text-[10px] border border-rose-200 dark:border-rose-900">
                        ⚠️ At-Risk ({cust.daysSinceLastOrder}d)
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center font-mono text-slate-700 dark:text-zinc-300">
                    {cust.orderCount}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-700 dark:text-zinc-300">
                    {formatCurrency(cust.avgOrderValue, currency)}
                  </td>
                  <td className="p-3.5 text-right font-mono font-black text-rose-600 dark:text-rose-400">
                    {formatCurrency(cust.totalSpent, currency)}
                  </td>
                  <td className="p-3.5 font-mono text-slate-500 dark:text-zinc-400">
                    {cust.lastPurchase || '—'}
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpen360(cust);
                      }}
                      className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-rose-600 hover:text-white rounded-full font-bold text-[10px] text-slate-700 dark:text-zinc-300 transition-colors inline-flex items-center gap-1"
                    >
                      <span>360 Dossier</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 dark:text-zinc-500 text-xs">
                    No customer accounts found matching your segment filter or search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer 360 Drawer */}
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
