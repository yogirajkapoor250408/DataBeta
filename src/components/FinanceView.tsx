import React, { useState, useMemo } from 'react';
import {
  Invoice,
  Deal,
  NormalizedRecord,
  Transaction,
  CurrencyCode,
  CoreTab,
  InvoiceStatus,
} from '../types';
import { calculateCashOutlook, calculateCollectionRate } from '../utils/provenanceEngine';
import { formatCurrency } from '../utils/currencyFormatter';
import {
  DollarSign,
  Receipt,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Plus,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Download,
  AlertCircle,
  Copy,
  Check,
  Building2,
  FileSpreadsheet,
  X,
} from 'lucide-react';

interface FinanceViewProps {
  invoices: Invoice[];
  deals: Deal[];
  records: NormalizedRecord[];
  currency: CurrencyCode;
  workspaceId?: string;
  onInvoicesChange: (invoices: Invoice[]) => void;
  onOpenAddInvoice: () => void;
  onOpenUpload: () => void;
  onNavigateTab: (tab: CoreTab) => void;
}

type FinanceSubtab = 'invoices' | 'cash_outlook' | 'ledger';

export const FinanceView: React.FC<FinanceViewProps> = ({
  invoices,
  deals,
  records,
  currency,
  workspaceId = 'default-workspace',
  onInvoicesChange,
  onOpenAddInvoice,
  onOpenUpload,
  onNavigateTab,
}) => {
  const [subtab, setSubtab] = useState<FinanceSubtab>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'overdue' | 'paid'>('all');
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);

  // Cash Outlook Calculation
  const cashOutlook = useMemo(
    () => calculateCashOutlook(invoices, deals, records, currency),
    [invoices, deals, records, currency]
  );

  // Collection Rate
  const collectionRate = useMemo(() => calculateCollectionRate(invoices), [invoices]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        searchQuery === '' ||
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'unpaid') return inv.status !== 'paid';
      if (statusFilter === 'overdue') return inv.status === 'overdue';
      if (statusFilter === 'paid') return inv.status === 'paid';
      return true;
    });
  }, [invoices, searchQuery, statusFilter]);

  // Overdue total
  const overdueTotal = useMemo(() => {
    return invoices
      .filter((i) => i.status === 'overdue')
      .reduce((sum, i) => sum + (i.balanceDue || i.amount || 0), 0);
  }, [invoices]);

  // Mark invoice as paid
  const handleMarkAsPaid = (invoiceId: string) => {
    const updated = invoices.map((inv) => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'paid' as InvoiceStatus,
          amountPaid: inv.amount,
          balanceDue: 0,
          updatedAt: new Date().toISOString(),
        };
      }
      return inv;
    });
    onInvoicesChange(updated);
  };

  // Copy payment request script
  const handleCopyPaymentRequest = (inv: Invoice) => {
    const text = `Hi ${inv.customerName}, gentle reminder regarding Invoice #${inv.invoiceNumber} for ${formatCurrency(inv.balanceDue || inv.amount, inv.currency)} due on ${inv.dueDate}. Please let us know once the transfer is initiated. Thank you!`;
    navigator.clipboard.writeText(text);
    setCopiedInvoiceId(inv.id);
    setTimeout(() => setCopiedInvoiceId(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-white dark:bg-zinc-950 p-5 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/60 px-2.5 py-0.5 rounded-full">
                Cash & Collections Hub
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
                • {invoices.length} Invoices • {records.length} Ledger entries
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Receivables, Cash Inflows & Outflows
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
              Track invoices, collect overdue receivables, and forecast 30-day cash flow grounded strictly in real records.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
            <button
              onClick={onOpenUpload}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 rounded-xl text-xs font-bold border border-slate-200/60 dark:border-zinc-800 transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Import Ledger</span>
            </button>
            <button
              onClick={onOpenAddInvoice}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Invoice</span>
            </button>
          </div>
        </div>

        {/* Financial KPI Pulse Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-zinc-900">
          <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Committed Invoices</span>
            <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {cashOutlook.committedInvoicesInflow.formattedValue}
            </div>
            <p className="text-[10px] text-slate-400">{invoices.filter((i) => i.status !== 'paid').length} unpaid receivables</p>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Overdue Invoices</span>
            <div className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">
              {formatCurrency(overdueTotal, currency)}
            </div>
            <p className="text-[10px] text-slate-400">{invoices.filter((i) => i.status === 'overdue').length} overdue for collection</p>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Collection Rate</span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              {collectionRate.formattedValue}
            </div>
            <p className="text-[10px] text-slate-400">Total historical collection efficiency</p>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Net 30-Day Outlook</span>
            <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {cashOutlook.netCashOutlook.formattedValue}
            </div>
            <p className="text-[10px] text-slate-400">Inflows minus expected outflows</p>
          </div>
        </div>
      </div>

      {/* Subtab Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-950 p-2.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setSubtab('invoices')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              subtab === 'invoices'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Invoices & Receivables ({invoices.length})</span>
          </button>

          <button
            onClick={() => setSubtab('cash_outlook')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              subtab === 'cash_outlook'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>30-Day Cash Calendar</span>
          </button>

          <button
            onClick={() => setSubtab('ledger')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              subtab === 'ledger'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Historical Ledger ({records.length})</span>
          </button>
        </div>

        {subtab === 'invoices' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  statusFilter === 'all' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('unpaid')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  statusFilter === 'unpaid' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
                }`}
              >
                Unpaid
              </button>
              <button
                onClick={() => setStatusFilter('overdue')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  statusFilter === 'overdue' ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Overdue
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Subtab 1: Invoices List */}
      {subtab === 'invoices' && (
        <div className="space-y-4">
          {filteredInvoices.length === 0 ? (
            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-8 text-center space-y-3">
              <Receipt className="w-8 h-8 text-slate-300 dark:text-zinc-700 mx-auto" />
              <div className="text-sm font-bold text-slate-900 dark:text-white">No invoices matching filter</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create an invoice or import your receivables list to track cash collection dates.
              </p>
              <button
                onClick={onOpenAddInvoice}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs min-h-[44px]"
              >
                + Create Invoice
              </button>
            </div>
          ) : (
            <>
              {/* MOBILE INVOICE CARDS (md:hidden) */}
              <div className="md:hidden space-y-3">
                {filteredInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                            {inv.invoiceNumber}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                              inv.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : inv.status === 'overdue'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {inv.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                          {inv.customerName}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-mono font-black text-slate-900 dark:text-white">
                          {formatCurrency(inv.amount, inv.currency)}
                        </div>
                        {inv.balanceDue > 0 && inv.status !== 'paid' && (
                          <div className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400">
                            Due: {formatCurrency(inv.balanceDue, inv.currency)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-1">
                      <span>Issued: {inv.issueDate}</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">Due: {inv.dueDate}</span>
                    </div>

                    {/* Mobile Actions: WhatsApp Reminder & Mark as Paid */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-900">
                      {inv.status !== 'paid' && (
                        <>
                          <button
                            onClick={() => handleCopyPaymentRequest(inv)}
                            className="flex-1 py-2.5 bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 min-h-[44px]"
                          >
                            {copiedInvoiceId === inv.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span>{copiedInvoiceId === inv.id ? 'Copied script!' : 'WhatsApp'}</span>
                          </button>

                          <button
                            onClick={() => handleMarkAsPaid(inv.id)}
                            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold min-h-[44px] shadow-2xs"
                          >
                            ✓ Mark Paid
                          </button>
                        </>
                      )}
                      {inv.status === 'paid' && (
                        <div className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Fully Paid & Reconciled</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP INVOICE TABLE (hidden md:block) */}
              <div className="hidden md:block bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100/60 dark:bg-zinc-900 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200/80 dark:border-zinc-800">
                        <th className="p-3.5">Invoice #</th>
                        <th className="p-3.5">Customer</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Issue Date</th>
                        <th className="p-3.5">Due Date</th>
                        <th className="p-3.5">Total Amount</th>
                        <th className="p-3.5">Balance Due</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                      {filteredInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                          <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                            {inv.invoiceNumber}
                          </td>
                          <td className="p-3.5 font-bold text-slate-900 dark:text-white">{inv.customerName}</td>
                          <td className="p-3.5">
                            <span
                              className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                inv.status === 'paid'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : inv.status === 'overdue'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {inv.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-slate-500">{inv.issueDate}</td>
                          <td className="p-3.5 font-mono text-slate-700 dark:text-zinc-300 font-bold">{inv.dueDate}</td>
                          <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                            {formatCurrency(inv.amount, inv.currency)}
                          </td>
                          <td className="p-3.5 font-mono font-bold text-rose-600 dark:text-rose-400">
                            {formatCurrency(inv.balanceDue, inv.currency)}
                          </td>
                          <td className="p-3.5 text-right space-x-1.5">
                            {inv.status !== 'paid' && (
                              <>
                                <button
                                  onClick={() => handleCopyPaymentRequest(inv)}
                                  className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-bold"
                                  title="Copy polite reminder text to clipboard"
                                >
                                  {copiedInvoiceId === inv.id ? 'Copied script!' : 'Copy Reminder'}
                                </button>
                                <button
                                  onClick={() => handleMarkAsPaid(inv.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-2xs"
                                >
                                  ✓ Mark Paid
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Subtab 2: Cash Calendar & Forecast */}
      {subtab === 'cash_outlook' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              30-Day Liquidity & Inflow/Outflow Breakdown
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Committed Invoices */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800/70 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">1. Committed Inflows</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {cashOutlook.committedInvoicesInflow.formattedValue}
                </div>
                <p className="text-xs text-slate-500">Unpaid customer invoices due within the next 30 days.</p>
              </div>

              {/* Weighted Pipeline */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800/70 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">2. Weighted Pipeline</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {cashOutlook.weightedPipelineInflow.formattedValue}
                </div>
                <p className="text-xs text-slate-500">Open deals weighted by stage win probabilities closing this month.</p>
              </div>

              {/* Operating Expenses */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800/70 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">3. Expected Outflows</span>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                  -{cashOutlook.expectedOutflow.formattedValue}
                </div>
                <p className="text-xs text-slate-500">Recurring SaaS, vendor invoices, and operating costs from ledger.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Historical Ledger */}
      {subtab === 'ledger' && (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs overflow-hidden">
          {records.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <FileSpreadsheet className="w-8 h-8 text-slate-300 dark:text-zinc-700 mx-auto" />
              <div className="text-sm font-bold text-slate-900 dark:text-white">No historical ledger imported</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload your CSV or Excel file to analyze past revenue, expense categories, and customer profit margins.
              </p>
              <button
                onClick={onOpenUpload}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Import CSV / Excel
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/60 dark:bg-zinc-900 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200/80 dark:border-zinc-800">
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Customer / Description</th>
                    <th className="p-3.5">Revenue</th>
                    <th className="p-3.5">Expense</th>
                    <th className="p-3.5">Payment Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                  {records.slice(0, 50).map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                      <td className="p-3.5 font-mono text-slate-500">{r.date}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{r.category || 'General'}</td>
                      <td className="p-3.5 text-slate-600 dark:text-zinc-400">{r.customer || r.product || '—'}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {r.revenue && r.revenue > 0 ? formatCurrency(r.revenue, currency) : '—'}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-rose-600 dark:text-rose-400">
                        {r.expense && r.expense > 0 ? formatCurrency(r.expense, currency) : '—'}
                      </td>
                      <td className="p-3.5 text-slate-500">{r.paymentMethod || 'Direct'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
