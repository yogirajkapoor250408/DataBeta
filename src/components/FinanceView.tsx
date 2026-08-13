import React, { useState, useMemo } from 'react';
import { NormalizedRecord, CurrencyCode } from '../types';
import { calculateMetrics } from '../utils/metricsCalculator';
import { calculateTaxDeductions } from '../utils/taxEstimator';
import { calculateCashRunway } from '../intelligence/cashRunwayEngine';
import { formatCurrency } from '../utils/currencyFormatter';
import { exportToCSV, exportToJSON } from '../utils/exportData';
import {
  Table,
  Receipt,
  Clock,
  Search,
  Download,
  Plus,
  Printer,
  Sliders,
  CheckCircle2,
  X,
} from 'lucide-react';

interface FinanceViewProps {
  records: NormalizedRecord[];
  currency: CurrencyCode;
  onAddManualRecord: (rec: NormalizedRecord) => void;
}

type FinanceSubtab = 'ledger' | 'tax' | 'runway';

export const FinanceView: React.FC<FinanceViewProps> = ({
  records,
  currency,
  onAddManualRecord,
}) => {
  const [subtab, setSubtab] = useState<FinanceSubtab>('ledger');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'revenue' | 'expense'>('all');

  // Tax State
  const [taxRatePct, setTaxRatePct] = useState<number>(24);

  // Runway Cash Balance Input State
  const [cashBalanceInput, setCashBalanceInput] = useState<number | ''>(50000);

  // Quick Manual Transaction Modal
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [qType, setQType] = useState<'revenue' | 'expense'>('revenue');
  const [qAmount, setQAmount] = useState<number | ''>(250);
  const [qCategory, setQCategory] = useState('Sales');
  const [qCustomer, setQCustomer] = useState('');
  const [qProduct, setQProduct] = useState('');
  const [qDate, setQDate] = useState(new Date().toISOString().split('T')[0]);

  const metrics = useMemo(() => calculateMetrics(records), [records]);
  const taxSummary = useMemo(() => calculateTaxDeductions(records), [records]);
  const runway = useMemo(() => calculateCashRunway(records), [records]);

  // Tax calculations
  const netIncome = Math.max(0, metrics.estimatedProfit || 0);
  const estimatedTaxLiability = (netIncome * taxRatePct) / 100;
  const dynamicTaxSavings = (taxSummary.totalDeductibleExpense * taxRatePct) / 100;
  const quarterlyInstallment = estimatedTaxLiability / 4;

  // Custom cash balance runway calculation
  const customRunwayMonths = useMemo(() => {
    const bal = Number(cashBalanceInput) || 0;
    if (runway.monthlyBurnRate <= 0) return 99;
    return bal / runway.monthlyBurnRate;
  }, [cashBalanceInput, runway.monthlyBurnRate]);

  // Available categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set);
  }, [records]);

  // Filtered transactions
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        !searchTerm ||
        (r.customer && r.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.product && r.product.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.category && r.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.dateString && r.dateString.includes(searchTerm));

      const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;

      const matchesType =
        typeFilter === 'all' ||
        (typeFilter === 'revenue' && r.revenue && r.revenue > 0) ||
        (typeFilter === 'expense' && r.expense && r.expense > 0);

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [records, searchTerm, categoryFilter, typeFilter]);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(qAmount) || 0;
    if (amt <= 0) return;

    const newRecord: NormalizedRecord = {
      id: `manual-${Date.now()}`,
      date: new Date(qDate),
      dateString: qDate,
      revenue: qType === 'revenue' ? amt : 0,
      expense: qType === 'expense' ? amt : 0,
      profit: qType === 'revenue' ? amt : -amt,
      category: qCategory || (qType === 'revenue' ? 'Sales' : 'Operations'),
      customer: qCustomer.trim() || undefined,
      product: qProduct.trim() || undefined,
      quantity: 1,
    };

    onAddManualRecord(newRecord);
    setShowQuickModal(false);
    setQAmount(250);
    setQCustomer('');
    setQProduct('');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Finance Studio Top Header */}
      <div className="bg-white dark:bg-zinc-950 p-4 sm:p-6 lg:p-7 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/60 px-2 py-0.5 rounded-md">
              General Ledger & Tax Engine
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400 dark:text-zinc-500 font-mono">
              • {records.length} transactions synchronized
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Ledger & Tax Studio
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 max-w-xl hidden sm:block">
            Verified line-item transactions, automated Schedule C tax deductions, and liquidity runway.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => exportToCSV(records, 'databeta_ledger_export')}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100/80 dark:bg-zinc-900/80 hover:bg-slate-200/70 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-slate-200/60 dark:border-zinc-800 touch-manipulation active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowQuickModal(true)}
            className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Transaction</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Pulse Metric Cards (2x2 on Mobile, 4-Col on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="bg-white dark:bg-zinc-950 p-3.5 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs space-y-0.5 sm:space-y-1">
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Gross Income</span>
          <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums truncate">
            {metrics.totalRevenue !== null ? formatCurrency(metrics.totalRevenue, currency) : '—'}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500 font-mono truncate">{metrics.transactionCount} entries</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-3.5 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs space-y-0.5 sm:space-y-1">
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Gross Outflow</span>
          <div className="text-lg sm:text-2xl font-black text-slate-700 dark:text-zinc-300 font-mono tabular-nums truncate">
            {metrics.totalExpenses !== null ? formatCurrency(metrics.totalExpenses, currency) : '—'}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500 truncate">Expenditures</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-3.5 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs space-y-0.5 sm:space-y-1">
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Net Profit</span>
          <div className="text-lg sm:text-2xl font-black text-rose-600 dark:text-rose-500 font-mono tabular-nums truncate">
            {metrics.estimatedProfit !== null ? formatCurrency(metrics.estimatedProfit, currency) : '—'}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500 truncate">
            {metrics.profitMargin !== null ? `${metrics.profitMargin.toFixed(1)}% margin` : 'Bottom line'}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-3.5 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs space-y-0.5 sm:space-y-1">
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Tax Savings</span>
          <div className="text-lg sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono tabular-nums truncate">
            {formatCurrency(dynamicTaxSavings, currency)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500 truncate">Schedule C deductions</p>
        </div>
      </div>

      {/* Subtab Navigation Bar + Filter Controls */}
      <div className="bg-white dark:bg-zinc-950 p-2 rounded-2xl border border-slate-200/70 dark:border-zinc-800/70 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => setSubtab('ledger')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 touch-manipulation ${
              subtab === 'ledger'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Table className="w-3.5 h-3.5" />
              <span>Ledger ({filteredRecords.length})</span>
            </div>
          </button>

          <button
            onClick={() => setSubtab('tax')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 touch-manipulation ${
              subtab === 'tax'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" />
              <span>Tax Estimator</span>
            </div>
          </button>

          <button
            onClick={() => setSubtab('runway')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 touch-manipulation ${
              subtab === 'runway'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Cash Runway</span>
            </div>
          </button>
        </div>

        {subtab === 'ledger' && (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-zinc-200"
            >
              <option value="all">All Types</option>
              <option value="revenue">Revenue (+)</option>
              <option value="expense">Expense (-)</option>
            </select>

            <div className="relative flex-1 sm:w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search ledger..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Subtab 1: Transaction Ledger (Adaptive: Cards on Phone, Table on Desktop) */}
      {subtab === 'ledger' && (
        <div className="space-y-3">
          {/* Mobile Phone Ledger Cards (sm:hidden) */}
          <div className="sm:hidden space-y-2">
            {filteredRecords.map((r) => (
              <div key={r.id} className="bg-white dark:bg-zinc-950 p-3.5 rounded-xl border border-slate-200/70 dark:border-zinc-800 shadow-2xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate min-w-0 pr-2">
                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {r.customer || r.product || r.category || 'Transaction'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {r.dateString || '—'}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-800 shrink-0">
                    {r.category || 'General'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-900 text-xs font-mono">
                  <span className="text-slate-400 text-[11px]">{r.product || 'Standard Entry'}</span>
                  <div className="font-bold">
                    {r.revenue && r.revenue > 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">+{formatCurrency(r.revenue, currency)}</span>
                    ) : r.expense && r.expense > 0 ? (
                      <span className="text-slate-600 dark:text-zinc-400">-{formatCurrency(r.expense, currency)}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredRecords.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-zinc-600 bg-white dark:bg-zinc-950 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                No matching transactions found.
              </div>
            )}
          </div>

          {/* Desktop/Tablet Table (hidden sm:block) */}
          <div className="hidden sm:block bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/70 dark:border-zinc-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/60 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase text-[10px] border-b border-slate-200/70 dark:border-zinc-800">
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Customer / Payee</th>
                    <th className="p-3.5">Product / Item</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-right">Revenue</th>
                    <th className="p-3.5 text-right">Expense</th>
                    <th className="p-3.5 text-right">Net Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                  {filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="p-3.5 font-mono text-slate-500">{r.dateString || '—'}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{r.customer || '—'}</td>
                      <td className="p-3.5 text-slate-700 dark:text-zinc-300">{r.product || 'General Transaction'}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-800">
                          {r.category || 'General'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {r.revenue ? formatCurrency(r.revenue, currency) : '—'}
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-600 dark:text-zinc-400 font-mono">
                        {r.expense ? formatCurrency(r.expense, currency) : '—'}
                      </td>
                      <td className="p-3.5 text-right font-bold font-mono">
                        {r.profit !== null && r.profit > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">+{formatCurrency(r.profit, currency)}</span>
                        ) : r.profit !== null && r.profit < 0 ? (
                          <span className="text-rose-600 dark:text-rose-500">-{formatCurrency(Math.abs(r.profit), currency)}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Schedule C Tax Estimator */}
      {subtab === 'tax' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-950 p-4 sm:p-6 rounded-2xl border border-slate-200/70 dark:border-zinc-800 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-900">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Schedule C Estimated Tax Liability</h3>
                <p className="text-xs text-slate-400 mt-0.5">Automated business deduction calculation based on IRS Schedule C categories.</p>
              </div>

              {/* Tax Rate Slider Control */}
              <div className="flex items-center gap-3 bg-slate-100 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-zinc-800 self-start sm:self-auto">
                <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Effective Bracket:</span>
                <input
                  type="range"
                  min="10"
                  max="40"
                  value={taxRatePct}
                  onChange={(e) => setTaxRatePct(Number(e.target.value))}
                  className="w-20 accent-rose-600 cursor-pointer"
                />
                <span className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400">{taxRatePct}%</span>
              </div>
            </div>

            {/* Tax Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taxable Net Profit</div>
                <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{formatCurrency(netIncome, currency)}</div>
                <p className="text-[11px] text-slate-400">Revenue minus deductible costs</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Annual Estimated Tax</div>
                <div className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">{formatCurrency(estimatedTaxLiability, currency)}</div>
                <p className="text-[11px] text-slate-400">At {taxRatePct}% effective bracket</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quarterly Installment</div>
                <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{formatCurrency(quarterlyInstallment, currency)}</div>
                <p className="text-[11px] text-slate-400">Estimated 1040-ES payment</p>
              </div>
            </div>

            {/* Deductions Breakdown Table */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Eligible Schedule C Deduction Categories</div>
              <div className="border border-slate-200/70 dark:border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100/60 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold uppercase text-[10px] border-b border-slate-200/70 dark:border-zinc-800">
                      <th className="p-3">Category</th>
                      <th className="p-3">Schedule C Line</th>
                      <th className="p-3 text-right">Deduction Rate</th>
                      <th className="p-3 text-right">Eligible Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                    {taxSummary.breakdown.map((cat, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">{cat.categoryName}</td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">{cat.taxScheduleCategory}</td>
                        <td className="p-3 text-right font-mono">{cat.deductiblePct}%</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(cat.estimatedDeduction, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Cash Runway */}
      {subtab === 'runway' && (
        <div className="bg-white dark:bg-zinc-950 p-4 sm:p-6 rounded-2xl border border-slate-200/70 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-900">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Liquidity & Cash Runway Horizon</h3>
              <p className="text-xs text-slate-400 mt-0.5">Calculated from trailing operating burn and current cash reserves.</p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Cash Balance:</label>
              <input
                type="number"
                value={cashBalanceInput}
                onChange={(e) => setCashBalanceInput(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-28 bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Runway Horizon</div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {customRunwayMonths > 50 ? '50+ Mo' : `${customRunwayMonths.toFixed(1)} Months`}
              </div>
              <p className="text-[11px] text-slate-400">Buffer at current burn</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Burn Rate</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {formatCurrency(runway.monthlyBurnRate, currency)}
              </div>
              <p className="text-[11px] text-slate-400">Average monthly outflows</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Velocity</div>
              <div className="text-2xl font-black text-slate-700 dark:text-zinc-300 font-mono">
                {formatCurrency(runway.dailyVelocity, currency)}
              </div>
              <p className="text-[11px] text-slate-400">Daily operational overhead</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Manual Transaction Modal */}
      {showQuickModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-950 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 max-w-md w-full border-t sm:border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4 animate-slideUpMobile sm:animate-fadeIn pb-safe">
            <div className="sm:hidden flex justify-center pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-900">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Quick Entry</h3>
              <button onClick={() => setShowQuickModal(false)} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAdd} className="space-y-3.5">
              <div className="flex rounded-lg bg-slate-100 dark:bg-zinc-900 p-1 border border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setQType('revenue')}
                  className={`flex-1 py-1.5 rounded-md font-bold text-xs transition-colors touch-manipulation ${
                    qType === 'revenue' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  Income / Revenue
                </button>
                <button
                  type="button"
                  onClick={() => setQType('expense')}
                  className={`flex-1 py-1.5 rounded-md font-bold text-xs transition-colors touch-manipulation ${
                    qType === 'expense' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  Operating Expense
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Amount ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={qAmount}
                  onChange={(e) => setQAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={qCategory}
                    onChange={(e) => setQCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={qDate}
                    onChange={(e) => setQDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Customer / Client</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={qCustomer}
                  onChange={(e) => setQCustomer(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs transition-colors"
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
