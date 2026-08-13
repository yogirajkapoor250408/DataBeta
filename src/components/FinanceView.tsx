import React, { useState, useMemo } from 'react';
import { NormalizedRecord, CurrencyCode } from '../types';
import { calculateMetrics } from '../utils/metricsCalculator';
import { calculateTaxDeductions } from '../utils/taxEstimator';
import { calculateCashRunway } from '../intelligence/cashRunwayEngine';
import { formatCurrency } from '../utils/currencyFormatter';
import { exportToCSV, exportToJSON } from '../utils/exportData';
import {
  Table,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  ShieldCheck,
  Printer,
  Calendar,
  Layers,
  CheckCircle2,
  Sliders,
  Sparkles,
  ArrowRight,
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
        (typeFilter === 'revenue' && (r.revenue || 0) > 0) ||
        (typeFilter === 'expense' && (r.expense || 0) > 0);

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

  const handleExportTaxCSV = () => {
    if (taxSummary.breakdown.length === 0) return;
    const headers = ['Category Name', 'Schedule C Tax Line', 'Deductibility %', 'Gross Total Expense', 'Deductible Amount'];
    const rows = taxSummary.breakdown.map((b) => [
      `"${b.categoryName}"`,
      `"${b.taxScheduleCategory}"`,
      `"${b.deductiblePct}%"`,
      b.totalExpense.toFixed(2),
      b.estimatedDeduction.toFixed(2),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `databeta_tax_deductions_schedule_c_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Finance Studio Top Header */}
      <div className="bg-white dark:bg-zinc-950 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 px-2.5 py-0.5 rounded-full">
              Canonical Financial Intelligence
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
              • {records.length} canonical transactions logged
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Finance & Ledger Studio
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
            Double-entry canonical ledger, Schedule C deduction intelligence, and liquidity cash runway modeling.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => exportToCSV(records)}
            className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-extrabold rounded-full transition-all flex items-center gap-2 border border-slate-200 dark:border-zinc-800 active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowQuickModal(true)}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-full shadow-md shadow-rose-600/30 transition-all flex items-center gap-2 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Log Transaction</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 hover-card-subtle">
          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Gross Inflow</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {metrics.totalRevenue !== null ? formatCurrency(metrics.totalRevenue, currency) : '—'}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">{metrics.transactionCount} transactions</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 hover-card-subtle">
          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Gross Outflow</span>
          <div className="text-2xl font-black text-slate-700 dark:text-zinc-300 font-mono tabular-nums">
            {metrics.totalExpenses !== null ? formatCurrency(metrics.totalExpenses, currency) : '—'}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">Operational expenditures</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 hover-card-subtle">
          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Net Realized Profit</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-500 font-mono tabular-nums">
            {metrics.estimatedProfit !== null ? formatCurrency(metrics.estimatedProfit, currency) : '—'}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">
            {metrics.profitMargin !== null ? `${metrics.profitMargin.toFixed(1)}% margin` : 'Net bottom line'}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1 hover-card-subtle">
          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Tax Savings Identified</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
            {formatCurrency(dynamicTaxSavings, currency)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">Schedule C eligible deductions</p>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="bg-white dark:bg-zinc-950 p-2 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setSubtab('ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              subtab === 'ledger'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Table className="w-3.5 h-3.5" />
              <span>Transaction Ledger ({filteredRecords.length})</span>
            </div>
          </button>

          <button
            onClick={() => setSubtab('tax')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              subtab === 'tax'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Receipt className="w-3.5 h-3.5" />
              <span>Schedule C Tax Estimator</span>
            </div>
          </button>

          <button
            onClick={() => setSubtab('runway')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              subtab === 'runway'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Cash Runway & Burn Rate</span>
            </div>
          </button>
        </div>

        {subtab === 'ledger' && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type selector */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-zinc-200"
            >
              <option value="all">All Types</option>
              <option value="revenue">Revenue (+)</option>
              <option value="expense">Expense (-)</option>
            </select>

            {/* Search */}
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ledger..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Subtab 1: Transaction Ledger */}
      {subtab === 'ledger' && (
        <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-zinc-800">
                  <th className="p-4">Date</th>
                  <th className="p-4">Customer / Payee</th>
                  <th className="p-4">Product / Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Revenue</th>
                  <th className="p-4 text-right">Expense</th>
                  <th className="p-4 text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4 font-mono text-slate-600 dark:text-zinc-400">{r.dateString || '—'}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{r.customer || '—'}</td>
                    <td className="p-4 text-slate-700 dark:text-zinc-300">{r.product || 'General Transaction'}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800">
                        {r.category || 'General'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {r.revenue ? formatCurrency(r.revenue, currency) : '—'}
                    </td>
                    <td className="p-4 text-right font-black text-slate-600 dark:text-zinc-400 font-mono">
                      {r.expense ? formatCurrency(r.expense, currency) : '—'}
                    </td>
                    <td className="p-4 text-right font-black font-mono">
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
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-zinc-500 text-xs">
                      No matching transaction records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: Schedule C Tax Intelligence */}
      {subtab === 'tax' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">IRS Schedule C & Tax Intelligence</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Automated deduction classification and quarterly Form 1040-ES payment schedule</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-zinc-800 text-xs">
                <span className="font-bold text-slate-600 dark:text-zinc-400">Tax Bracket:</span>
                <select
                  value={taxRatePct}
                  onChange={(e) => setTaxRatePct(Number(e.target.value))}
                  className="bg-transparent font-black text-rose-600 dark:text-rose-400 focus:outline-none cursor-pointer"
                >
                  <option value={15}>15% (Low Bracket)</option>
                  <option value={22}>22% (Standard SMB)</option>
                  <option value={24}>24% (Pass-through LLC)</option>
                  <option value={32}>32% (Upper Mid)</option>
                  <option value={37}>37% (Top Tier Federal)</option>
                </select>
              </div>

              <button
                onClick={handleExportTaxCSV}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-full border border-slate-200 dark:border-zinc-800 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CPA Export</span>
              </button>
            </div>
          </div>

          {/* Quarterly 1040-ES Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { q: 'Q1', due: 'April 15', desc: 'Jan 1 – Mar 31' },
              { q: 'Q2', due: 'June 15', desc: 'Apr 1 – May 31' },
              { q: 'Q3', due: 'Sept 15', desc: 'Jun 1 – Aug 31' },
              { q: 'Q4', due: 'Jan 15', desc: 'Sep 1 – Dec 31' },
            ].map((quarter) => (
              <div key={quarter.q} className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-rose-600 dark:text-rose-400">{quarter.q} 1040-ES Due</span>
                  <span className="text-[10px] text-slate-400">{quarter.due}</span>
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {formatCurrency(quarterlyInstallment, currency)}
                </div>
                <p className="text-[10px] text-slate-400">{quarter.desc} income</p>
              </div>
            ))}
          </div>

          {/* Schedule C Breakdown Table */}
          <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-zinc-900 font-extrabold text-xs text-slate-900 dark:text-white">
              Schedule C Deductible Expense Categories
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-zinc-800">
                    <th className="p-4">Expense Category</th>
                    <th className="p-4">Schedule C Tax Form Line</th>
                    <th className="p-4 text-center">Deductibility %</th>
                    <th className="p-4 text-right">Gross Expenditure</th>
                    <th className="p-4 text-right">Tax Deductible Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                  {taxSummary.breakdown.map((item) => (
                    <tr key={item.categoryName} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{item.categoryName}</td>
                      <td className="p-4 text-slate-600 dark:text-zinc-400">{item.taxScheduleCategory}</td>
                      <td className="p-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">{item.deductiblePct}%</td>
                      <td className="p-4 text-right font-mono text-slate-700 dark:text-zinc-300">{formatCurrency(item.totalExpense, currency)}</td>
                      <td className="p-4 text-right font-mono font-black text-rose-600 dark:text-rose-500">{formatCurrency(item.estimatedDeduction, currency)}</td>
                    </tr>
                  ))}
                  {taxSummary.breakdown.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 dark:text-zinc-500">
                        No categorized deductible expenses detected in ledger.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Cash Runway & Burn Rate */}
      {subtab === 'runway' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Working Capital & Runway Engine</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Calculated from trailing 30-day expense velocity</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">Current Cash Reserve ({currency}):</span>
              <input
                type="number"
                value={cashBalanceInput}
                onChange={(e) => setCashBalanceInput(e.target.value === '' ? '' : Number(e.target.value))}
                className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 font-mono font-bold text-xs w-32 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Estimated Cash Runway</span>
              <div className="text-3xl font-black text-rose-600 dark:text-rose-500 font-mono">
                {customRunwayMonths.toFixed(1)} <span className="text-sm font-normal text-slate-500">Months</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {customRunwayMonths >= 6 ? 'Healthy working capital buffer' : 'Tight liquidity — consider reducing fixed overhead'}
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Monthly Burn Rate</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {formatCurrency(runway.monthlyBurnRate, currency)}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Average monthly operational outflow</p>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Daily Net Cashflow</span>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {formatCurrency(runway.dailyVelocity, currency)}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Average daily operational velocity</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Manual Entry Modal */}
      {showQuickModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-900">
              <h3 className="font-black text-slate-900 dark:text-white text-lg">Log Transaction Entry</h3>
              <button onClick={() => setShowQuickModal(false)} className="p-1 rounded-full text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAdd} className="space-y-3 text-xs">
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-zinc-900 rounded-full font-bold">
                <button
                  type="button"
                  onClick={() => setQType('revenue')}
                  className={`flex-1 py-1.5 rounded-full transition-all ${qType === 'revenue' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-zinc-400'}`}
                >
                  Revenue (+)
                </button>
                <button
                  type="button"
                  onClick={() => setQType('expense')}
                  className={`flex-1 py-1.5 rounded-full transition-all ${qType === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-600 dark:text-zinc-400'}`}
                >
                  Expense (-)
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Amount ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={qAmount}
                  onChange={(e) => setQAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Customer / Client</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={qCustomer}
                    onChange={(e) => setQCustomer(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Product / Item</label>
                  <input
                    type="text"
                    placeholder="e.g. Consulting"
                    value={qProduct}
                    onChange={(e) => setQProduct(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Software, Sales"
                    value={qCategory}
                    onChange={(e) => setQCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={qDate}
                    onChange={(e) => setQDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl px-3 py-2 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl transition-all shadow-md shadow-rose-600/30 text-xs mt-2"
              >
                Save Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
