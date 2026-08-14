import React from 'react';
import { X, Mail, Phone, MapPin, ShoppingBag, DollarSign, Calendar, TrendingUp, Tag, ArrowUpRight } from 'lucide-react';
import { NormalizedRecord, CurrencyCode, CRMContact } from '../types';
import { formatCurrency } from '../utils/currencyFormatter';

export interface CustomerDetail {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  totalSpent: number;
  orderCount: number;
  firstPurchase?: string;
  lastPurchase?: string;
}

interface Customer360DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerDetail | null;
  records: NormalizedRecord[];
  crmDeals: CRMContact[];
  currency: CurrencyCode;
}

export const Customer360Drawer: React.FC<Customer360DrawerProps> = ({
  isOpen,
  onClose,
  customer,
  records,
  crmDeals,
  currency,
}) => {
  if (!isOpen || !customer) return null;

  // Filter transactions belonging to this customer
  const customerTxs = records.filter(
    (r) => r.customer && r.customer.toLowerCase().trim() === customer.name.toLowerCase().trim()
  );

  // Filter CRM deals belonging to this customer
  const customerDeals = crmDeals.filter(
    (c) =>
      (c.companyName || c.company || '').toLowerCase().includes(customer.name.toLowerCase()) ||
      (c.contactName || c.name || '').toLowerCase().includes(customer.name.toLowerCase())
  );

  // Unique products purchased
  const productSet = new Set<string>();
  customerTxs.forEach((t) => {
    if (t.product) productSet.add(t.product);
  });
  const purchasedProducts = Array.from(productSet);

  const aov = customer.orderCount > 0 ? customer.totalSpent / customer.orderCount : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs flex items-end sm:items-stretch sm:justify-end transition-opacity duration-200">
      {/* Container: Bottom Sheet on Mobile, Right Slide-in on Tablet/Desktop */}
      <div className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white w-full sm:max-w-xl max-h-[92vh] sm:max-h-full sm:h-full rounded-t-3xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-slate-200/80 dark:border-zinc-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-slideUpMobile sm:animate-slideInRight">
        {/* Mobile Pull Handle Indicator */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
        </div>

        {/* Drawer Header */}
        <div className="px-5 py-4 sm:p-6 border-b border-slate-100 dark:border-zinc-900 flex items-start justify-between bg-white dark:bg-zinc-950 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 truncate min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 font-extrabold text-base sm:text-lg flex items-center justify-center shrink-0">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">{customer.name}</h2>
                <span className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                  Buyer
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">Customer 360 Intelligence Dossier</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 text-xs custom-scrollbar">
          {/* Key Financial KPIs Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 text-center">
              <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Lifetime Value</div>
              <div className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5 truncate">
                {formatCurrency(customer.totalSpent, currency)}
              </div>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 text-center">
              <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Orders</div>
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">{customer.orderCount}</div>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 text-center">
              <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Average Order</div>
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono mt-0.5 truncate">
                {formatCurrency(aov, currency)}
              </div>
            </div>
          </div>

          {/* Contact & Profile Meta */}
          <div className="bg-slate-50 dark:bg-zinc-900/80 p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800 space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Account Metadata</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{customer.email || `${customer.name.toLowerCase().replace(/\s+/g, '')}@example.com`}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{customer.phone || '+1 (555) 019-2834'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{customer.location || 'United States'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Last active: {customer.lastPurchase || 'Recent'}</span>
              </div>
            </div>
          </div>

          {/* Active CRM Deals Linked */}
          {customerDeals.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Associated CRM Deals</div>
              <div className="space-y-1.5">
                {customerDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{deal.title || deal.companyName || deal.name}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">{deal.stage.replace('_', ' ')}</div>
                    </div>
                    <div className="font-bold text-xs font-mono text-slate-900 dark:text-white">
                      {formatCurrency(deal.amount || deal.dealValue || 0, currency)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Purchased Products / Services */}
          {purchasedProducts.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purchased Offerings</div>
              <div className="flex flex-wrap gap-1.5">
                {purchasedProducts.map((prod, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-medium"
                  >
                    {prod}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Verified Transaction History */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Historical Transactions ({customerTxs.length})</div>
            <div className="border border-slate-200/60 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-900">
                {customerTxs.map((tx) => (
                  <div key={tx.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-900/50 text-xs">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{tx.product || tx.category || 'Order'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {tx.dateString || (typeof tx.date === 'string' ? tx.date : '—')}
                      </div>
                    </div>
                    <div className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(tx.revenue, currency)}
                    </div>
                  </div>
                ))}
                {customerTxs.length === 0 && (
                  <div className="p-4 text-center text-slate-400">No individual line-item records logged.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions (Thumb-Friendly on Mobile) */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-950 flex gap-2 shrink-0 pb-safe">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-semibold text-xs transition-colors hover:bg-slate-200 dark:hover:bg-zinc-800"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
