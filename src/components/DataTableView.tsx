import React, { useState, useMemo } from 'react';
import { NormalizedRecord, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';
import { Search, Filter, ArrowUpDown, Plus, Table, Download, Trash2 } from 'lucide-react';

interface DataTableViewProps {
  records: NormalizedRecord[];
  currency: CurrencyCode;
  onAddManualRecord?: (rec: NormalizedRecord) => void;
}

export const DataTableView: React.FC<DataTableViewProps> = ({
  records,
  currency,
  onAddManualRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [sortField, setSortField] = useState<'date' | 'revenue' | 'expense' | 'profit'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Manual Transaction Form Modal
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
      if (r.category) set.add(r.category);
    });
    return Array.from(set);
  }, [records]);

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
          r.dateString.includes(q)
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter((r) => r.category === categoryFilter);
    }

    result.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortField === 'date') {
        valA = a.date ? a.date.getTime() : 0;
        valB = b.date ? b.date.getTime() : 0;
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
  }, [records, searchTerm, categoryFilter, sortField, sortOrder]);

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
      expense: !isRev ? amt : 0,
      profit: isRev ? amt : -amt,
      category: mCategory || 'General',
      product: mProduct || (isRev ? 'Sale Item' : 'Expense Item'),
      customer: mCustomer || undefined,
      quantity: 1,
    };

    onAddManualRecord(newRecord);
    setShowManualModal(false);
    setMCustomer('');
    setMProduct('');
    setMAmount(150);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white p-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-500 uppercase tracking-widest mb-1">
            Operational Data Entry & Ledger Studio
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Transactions Studio</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
            Inspect, search, sort, and record individual business sales and operational expenses.
          </p>
        </div>

        <button
          onClick={() => setShowManualModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-full shadow-md shadow-rose-600/30 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Record Transaction</span>
        </button>
      </div>

      {/* Controls Bar: Search, Category Filter, Sort */}
      <div className="bg-white dark:bg-zinc-950 p-4 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, product, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-3 py-1.5 text-xs text-slate-900 dark:text-white">
            <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-black text-slate-900 dark:text-white">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-black text-slate-900 dark:text-white">{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Total records indicator */}
        <div className="text-xs font-mono text-slate-500 dark:text-zinc-400">
          Showing {paginatedRecords.length} of {processedRecords.length} Transactions
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
        {paginatedRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-zinc-800">
                  <th className="p-4 cursor-pointer" onClick={() => { setSortField('date'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                    Date {sortField === 'date' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="p-4">Customer Account</th>
                  <th className="p-4">Product / Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right cursor-pointer" onClick={() => { setSortField('revenue'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                    Revenue {sortField === 'revenue' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="p-4 text-right cursor-pointer" onClick={() => { setSortField('expense'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                    Expense {sortField === 'expense' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="p-4 text-right cursor-pointer" onClick={() => { setSortField('profit'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                    Net Profit {sortField === 'profit' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                {paginatedRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors">
                    <td className="p-4 text-slate-500 dark:text-zinc-400 font-mono">{r.dateString}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{r.customer || 'Direct Client'}</td>
                    <td className="p-4 font-medium text-slate-600 dark:text-zinc-300">{r.product || 'Standard Line Item'}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-bold text-slate-600 dark:text-zinc-300 uppercase">
                        {r.category || 'General'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                      {r.revenue ? formatCurrency(r.revenue, currency) : '—'}
                    </td>
                    <td className="p-4 text-right font-extrabold text-slate-500 dark:text-zinc-400">
                      {r.expense ? formatCurrency(r.expense, currency) : '—'}
                    </td>
                    <td className="p-4 text-right font-extrabold text-rose-600 dark:text-rose-500">
                      {formatCurrency(r.profit || 0, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-500 flex items-center justify-center mx-auto">
              <Table className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">No Transactions Found</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
              Import a CSV or Excel spreadsheet, or click "Record Transaction" to create your first manual entry.
            </p>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200/80 dark:border-zinc-800 text-xs shadow-xs">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-bold text-slate-700 dark:text-zinc-300 disabled:opacity-50 active:scale-95 transition-all"
          >
            Previous
          </button>
          <span className="font-mono text-slate-500 dark:text-zinc-400">Page {currentPage} of {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-bold text-slate-700 dark:text-zinc-300 disabled:opacity-50 active:scale-95 transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 max-w-md w-full space-y-4 animate-fadeIn shadow-2xl">
            <h3 className="text-xl font-black tracking-tight">Record Manual Transaction</h3>

            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-zinc-400 mb-1">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMType('revenue')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      mType === 'revenue'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                        : 'bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800'
                    }`}
                  >
                    Sale (Revenue)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMType('expense')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      mType === 'expense'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                        : 'bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800'
                    }`}
                  >
                    Operational Expense
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-zinc-400 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={mDate}
                  onChange={(e) => setMDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-zinc-400 mb-1">Amount</label>
                <input
                  type="number"
                  required
                  placeholder="150"
                  value={mAmount}
                  onChange={(e) => setMAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-zinc-400 mb-1">Customer / Client</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={mCustomer}
                  onChange={(e) => setMCustomer(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-zinc-400 mb-1">Product / Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise Plan"
                  value={mProduct}
                  onChange={(e) => setMProduct(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-zinc-400 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="Software / Advertising / Operations"
                  value={mCategory}
                  onChange={(e) => setMCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-full shadow-md shadow-rose-600/30 active:scale-95 transition-all"
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
