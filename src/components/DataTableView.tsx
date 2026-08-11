import React, { useState, useMemo } from 'react';
import { NormalizedRecord, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';
import { Search, ArrowUpDown, Filter, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { format } from 'date-fns';

interface DataTableViewProps {
  records: NormalizedRecord[];
  currency: CurrencyCode;
}

type SortField = 'date' | 'revenue' | 'expense' | 'profit' | 'category' | 'product' | 'customer';

export const DataTableView: React.FC<DataTableViewProps> = ({ records, currency }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showOnlyDuplicates, setShowOnlyDuplicates] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const r of records) {
      if (r.category) set.add(r.category);
    }
    return Array.from(set).sort();
  }, [records]);

  // Identify duplicate rows (same date, category, and revenue/expense amount)
  const processedRecords = useMemo(() => {
    const rowCounts: Record<string, number> = {};
    for (const r of records) {
      const key = `${r.dateString}_${r.category || ''}_${r.revenue || 0}_${r.expense || 0}`;
      rowCounts[key] = (rowCounts[key] || 0) + 1;
    }

    return records.map((r) => {
      const key = `${r.dateString}_${r.category || ''}_${r.revenue || 0}_${r.expense || 0}`;
      const isDuplicate = rowCounts[key] > 1;
      return {
        ...r,
        isDuplicate,
      };
    });
  }, [records]);

  const duplicateCount = useMemo(() => {
    return processedRecords.filter((r) => r.isDuplicate).length;
  }, [processedRecords]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return processedRecords.filter((r) => {
      if (showOnlyDuplicates && !r.isDuplicate) {
        return false;
      }

      if (categoryFilter !== 'all' && r.category !== categoryFilter) {
        return false;
      }

      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesCategory = r.category?.toLowerCase().includes(query);
        const matchesProduct = r.product?.toLowerCase().includes(query);
        const matchesCustomer = r.customer?.toLowerCase().includes(query);
        const matchesDate = r.dateString.toLowerCase().includes(query);
        const matchesRevenue = r.revenue !== null && String(r.revenue).includes(query);

        return matchesCategory || matchesProduct || matchesCustomer || matchesDate || matchesRevenue;
      }

      return true;
    });
  }, [processedRecords, searchTerm, categoryFilter, showOnlyDuplicates]);

  // Sort
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'date') {
        aVal = a.date ? a.date.getTime() : 0;
        bVal = b.date ? b.date.getTime() : 0;
      }

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filteredRecords, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / rowsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return sortedRecords.slice(startIdx, startIdx + rowsPerPage);
  }, [sortedRecords, currentPage, rowsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Processed Dataset & Cleaning Studio</h2>
            {duplicateCount > 0 && (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                {duplicateCount} Duplicate Rows Flagged
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, sort, filter categories, and inspect flagged duplicate entries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {duplicateCount > 0 && (
            <button
              onClick={() => setShowOnlyDuplicates(!showOnlyDuplicates)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                showOnlyDuplicates
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{showOnlyDuplicates ? 'Showing Duplicates' : 'Filter Duplicates'}</span>
            </button>
          )}

          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <th className="p-3 cursor-pointer hover:bg-slate-200/50" onClick={() => handleSort('date')}>
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3 cursor-pointer hover:bg-slate-200/50" onClick={() => handleSort('category')}>
                <div className="flex items-center gap-1">
                  <span>Category</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3 cursor-pointer hover:bg-slate-200/50" onClick={() => handleSort('product')}>
                <div className="flex items-center gap-1">
                  <span>Product / Item</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3 cursor-pointer hover:bg-slate-200/50" onClick={() => handleSort('customer')}>
                <div className="flex items-center gap-1">
                  <span>Customer</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3 text-right cursor-pointer hover:bg-slate-200/50" onClick={() => handleSort('revenue')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Revenue</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3 text-right cursor-pointer hover:bg-slate-200/50" onClick={() => handleSort('expense')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Expense</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3 text-right cursor-pointer hover:bg-slate-200/50" onClick={() => handleSort('profit')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Net Profit</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((r) => (
                <tr
                  key={r.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    r.isDuplicate ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {r.isDuplicate && <Copy className="w-3 h-3 text-amber-600 shrink-0" />}
                      <span>{r.date ? format(r.date, 'yyyy-MM-dd') : r.dateString}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    {r.category ? (
                      <span className="bg-slate-100 text-slate-800 font-medium px-2 py-0.5 rounded text-[11px]">
                        {r.category}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">--</span>
                    )}
                  </td>
                  <td className="p-3 font-medium text-slate-800 max-w-xs truncate">
                    {r.product || <span className="text-slate-400 italic">--</span>}
                  </td>
                  <td className="p-3 text-slate-600 truncate">
                    {r.customer || <span className="text-slate-400 italic">--</span>}
                  </td>
                  <td className="p-3 text-right font-medium text-indigo-600 whitespace-nowrap">
                    {r.revenue !== null ? formatCurrency(r.revenue, currency) : <span className="text-slate-300">--</span>}
                  </td>
                  <td className="p-3 text-right font-medium text-rose-600 whitespace-nowrap">
                    {r.expense !== null ? formatCurrency(r.expense, currency) : <span className="text-slate-300">--</span>}
                  </td>
                  <td className="p-3 text-right font-semibold whitespace-nowrap">
                    {r.profit !== null ? (
                      <span className={r.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {formatCurrency(r.profit, currency)}
                      </span>
                    ) : (
                      <span className="text-slate-300">--</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 text-sm">
                  No matching transaction records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-300 rounded px-2 py-1 font-semibold focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-slate-400 ml-2">
            Showing {sortedRecords.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to{' '}
            {Math.min(currentPage * rowsPerPage, sortedRecords.length)} of {sortedRecords.length} records
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
