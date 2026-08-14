import React, { useState, useMemo } from 'react';
import { NormalizedRecord, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Table,
  Download,
  Trash2,
  Calendar,
  X,
  CheckCircle2,
  FileSpreadsheet,
  FileJson,
  Layers,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react';

interface DataTableViewProps {
  records: NormalizedRecord[];
  currency: CurrencyCode;
  onAddManualRecord?: (rec: NormalizedRecord) => void;
}

type DatePreset = 'all' | '7d' | '30d' | 'quarter' | 'year';

export const DataTableView: React.FC<DataTableViewProps> = ({
  records,
  currency,
  onAddManualRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'revenue' | 'expense'>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<'date' | 'revenue' | 'expense' | 'profit'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Manual Transaction Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [mDate, setMDate] = useState(new Date().toISOString().split('T')[0]);
  const [mType, setMType] = useState<'revenue' | 'expense'>('revenue');
  const [mAmount, setMAmount] = useState<number | ''>(150);
  const [mCategory, setMCategory] = useState('Software');
  const [mCustomer, setMCustomer] = useState('');
  const [mProduct, setMProduct] = useState('');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.category && r.category.trim()) set.add(r.category.trim());
    });
    return Array.from(set).sort();
  }, [records]);

  // Date Filter helper
  const now = new Date();
  const dateThreshold = useMemo(() => {
    if (datePreset === '7d') {
      const d = new Date();
      d.setDate(now.getDate() - 7);
      return d;
    }
    if (datePreset === '30d') {
      const d = new Date();
      d.setDate(now.getDate() - 30);
      return d;
    }
    if (datePreset === 'quarter') {
      const d = new Date();
      d.setDate(now.getDate() - 90);
      return d;
    }
    if (datePreset === 'year') {
      const d = new Date();
      d.setDate(now.getDate() - 365);
      return d;
    }
    return null;
  }, [datePreset]);

  // Filter & Sort
  const processedRecords = useMemo(() => {
    let result = [...records];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (r) =>
          (r.customer && r.customer.toLowerCase().includes(q)) ||
          (r.product && r.product.toLowerCase().includes(q)) ||
          (r.category && r.category.toLowerCase().includes(q)) ||
          (r.dateString && r.dateString.includes(q)) ||
          (typeof r.date === 'string' && r.date.includes(q))
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter((r) => r.category === categoryFilter);
    }

    if (typeFilter === 'revenue') {
      result = result.filter((r) => (r.revenue || 0) > 0);
    } else if (typeFilter === 'expense') {
      result = result.filter((r) => (r.expense || 0) > 0);
    }

    if (dateThreshold) {
      result = result.filter((r) => {
        if (!r.date) return false;
        const d = r.date instanceof Date ? r.date : new Date(r.date);
        return d >= dateThreshold;
      });
    }

    result.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortField === 'date') {
        valA = a.date instanceof Date ? a.date.getTime() : new Date(a.date || 0).getTime();
        valB = b.date instanceof Date ? b.date.getTime() : new Date(b.date || 0).getTime();
      } else if (sortField === 'revenue') {
        valA = a.revenue || 0;
        valB = b.revenue || 0;
      } else if (sortField === 'expense') {
        valA = a.expense || 0;
        valB = b.expense || 0;
      } else if (sortField === 'profit') {
        valA = a.profit || 0;
        valB = b.profit || 0;
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [records, searchTerm, categoryFilter, typeFilter, dateThreshold, sortField, sortOrder]);

  // Summary Metrics of the current filtered set
  const filteredMetrics = useMemo(() => {
    let rev = 0;
    let exp = 0;
    processedRecords.forEach((r) => {
      rev += r.revenue || 0;
      exp += r.expense || 0;
    });
    return {
      revenue: rev,
      expense: exp,
      profit: rev - exp,
      count: processedRecords.length,
    };
  }, [processedRecords]);

  // Pagination
  const totalPages = Math.ceil(processedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedRecords.slice(start, start + pageSize);
  }, [processedRecords, currentPage, pageSize]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddManualRecord) return;

    const amt = Number(mAmount) || 0;
    const isRev = mType === 'revenue';

    const newRecord: NormalizedRecord = {
      id: `man-${Date.now()}`,
      date: new Date(mDate),
      dateString: mDate,
      revenue: isRev ? amt : 0,
      expense: isRev ? 0 : amt,
      profit: isRev ? amt : -amt,
      category: mCategory || 'General',
      customer: mCustomer.trim() || undefined,
      product: mProduct.trim() || undefined,
      quantity: 1,
    };

    onAddManualRecord(newRecord);
    setShowManualModal(false);
    setMCustomer('');
    setMProduct('');
    setMAmount(150);
  };

  // Export Filtered Set to CSV
  const handleExportCSV = () => {
    if (processedRecords.length === 0) return;
    const headers = ['Date', 'Category', 'Customer', 'Product', 'Revenue', 'Expense', 'Profit'];
    const rows = processedRecords.map((r) => [
      `"${r.dateString || (typeof r.date === 'string' ? r.date : r.date instanceof Date ? r.date.toISOString().split('T')[0] : '')}"`,
      `"${(r.category || '').replace(/"/g, '""')}"`,
      `"${(r.customer || '').replace(/"/g, '""')}"`,
      `"${(r.product || '').replace(/"/g, '""')}"`,
      r.revenue || 0,
      r.expense || 0,
      r.profit || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `databeta-transactions-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Filtered Set to JSON
  const handleExportJSON = () => {
    if (processedRecords.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(processedRecords, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `databeta-transactions-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSortToggle = (field: 'date' | 'revenue' | 'expense' | 'profit') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white p-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-500 uppercase tracking-widest mb-1">
            <Table className="w-4 h-4 text-rose-600" />
            <span>Master Transaction Ledger</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Transactions Studio
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
            Filter, search, inspect, sort, and export every line-item transaction in your business records.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onAddManualRecord && (
            <button
              onClick={() => setShowManualModal(true)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-full shadow-md shadow-rose-600/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Transaction</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            title="Download Filtered CSV"
            className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-extrabold text-xs rounded-full border border-slate-200 dark:border-zinc-800 flex items-center gap-2 transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            title="Download Filtered JSON"
            className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-extrabold text-xs rounded-full border border-slate-200 dark:border-zinc-800 flex items-center gap-2 transition-all active:scale-95"
          >
            <FileJson className="w-4 h-4 text-indigo-500" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Filtered Subset KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Filtered Entries</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            {filteredMetrics.count.toLocaleString()}
            <span className="text-xs text-slate-400 font-normal ml-1">/ {records.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Total Revenue (Subset)</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatCurrency(filteredMetrics.revenue, currency)}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Total Expenses (Subset)</div>
          <div className="text-xl font-black text-slate-700 dark:text-zinc-300 mt-0.5">
            {formatCurrency(filteredMetrics.expense, currency)}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Net Profit (Subset)</div>
          <div className={`text-xl font-black mt-0.5 ${filteredMetrics.profit >= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-500'}`}>
            {formatCurrency(filteredMetrics.profit, currency)}
          </div>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer, product, category, or date..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full pl-9 pr-9 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="all">All Transaction Types</option>
              <option value="revenue">Revenue Only (+)</option>
              <option value="expense">Expenses Only (-)</option>
            </select>
          </div>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-zinc-900">
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date:
            </span>
            {[
              { key: 'all', label: 'All Time' },
              { key: '7d', label: 'Last 7 Days' },
              { key: '30d', label: 'Last 30 Days' },
              { key: 'quarter', label: 'Last 90 Days' },
              { key: 'year', label: 'Past 12 Months' },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => {
                  setDatePreset(p.key as DatePreset);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  datePreset === p.key
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
            Showing {paginatedRecords.length} of {processedRecords.length} records
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-zinc-800">
                <th
                  onClick={() => handleSortToggle('date')}
                  className="p-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Customer / Client</th>
                <th className="p-3.5">Product / Item</th>
                <th
                  onClick={() => handleSortToggle('revenue')}
                  className="p-3.5 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Revenue</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('expense')}
                  className="p-3.5 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Expense</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('profit')}
                  className="p-3.5 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Net Profit</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-900 font-medium">
              {paginatedRecords.map((r) => {
                const profit = r.profit !== null ? r.profit : (r.revenue || 0) - (r.expense || 0);
                const isPositive = profit >= 0;
                return (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="p-3.5 font-mono text-slate-500 dark:text-zinc-400">
                      {r.dateString || (typeof r.date === 'string' ? r.date : r.date instanceof Date ? r.date.toISOString().split('T')[0] : '—')}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-bold border border-slate-200 dark:border-zinc-700">
                        {r.category || 'General'}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{r.customer || '—'}</td>
                    <td className="p-3.5 text-slate-600 dark:text-zinc-300">{r.product || '—'}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {r.revenue ? formatCurrency(r.revenue, currency) : '—'}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-700 dark:text-zinc-400">
                      {r.expense ? formatCurrency(r.expense, currency) : '—'}
                    </td>
                    <td className="p-3.5 text-right font-mono font-black">
                      <span className={isPositive ? 'text-rose-600 dark:text-rose-400' : 'text-amber-500'}>
                        {formatCurrency(profit, currency)}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {paginatedRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 dark:text-zinc-500 text-xs">
                    No transactions match your current search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between text-xs">
            <div className="text-slate-500 dark:text-zinc-400 font-mono">
              Page {currentPage} of {totalPages}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-bold text-slate-700 dark:text-zinc-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-bold text-slate-700 dark:text-zinc-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Transaction Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl max-w-md w-full p-6 relative space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base">Add New Transaction</h3>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-zinc-900 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setMType('revenue')}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    mType === 'revenue' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  + Revenue
                </button>
                <button
                  type="button"
                  onClick={() => setMType('expense')}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    mType === 'expense' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  - Expense
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Amount ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  autoFocus
                  value={mAmount}
                  onChange={(e) => setMAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={mDate}
                    onChange={(e) => setMDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Sales, Marketing, Payroll"
                    value={mCategory}
                    onChange={(e) => setMCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Customer / Client</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={mCustomer}
                    onChange={(e) => setMCustomer(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Product / Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Enterprise License"
                    value={mProduct}
                    onChange={(e) => setMProduct(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-full text-slate-500 dark:text-zinc-400 font-bold hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-full shadow-md shadow-rose-600/30 transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
