import React from 'react';
import { X, User, Mail, Phone, MapPin, ShoppingBag, DollarSign, Calendar, TrendingUp, Tag, ArrowUpRight } from 'lucide-react';
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
      c.company.toLowerCase().includes(customer.name.toLowerCase()) ||
      c.name.toLowerCase().includes(customer.name.toLowerCase())
  );

  // Unique products purchased
  const productSet = new Set<string>();
  customerTxs.forEach((t) => {
    if (t.product) productSet.add(t.product);
  });
  const purchasedProducts = Array.from(productSet);

  const aov = customer.orderCount > 0 ? customer.totalSpent / customer.orderCount : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end transition-opacity duration-200">
      <div className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white w-full max-w-xl h-full border-l border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-slideInRight">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-zinc-900 flex items-start justify-between bg-white dark:bg-zinc-950">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-600/20 border border-rose-200 dark:border-rose-600/40 text-rose-600 dark:text-rose-500 font-black text-xl flex items-center justify-center shadow-md">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{customer.name}</h2>
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  Active Buyer
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Customer 360 Intelligence Dossier</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs scrollbar-none">
          {/* Key Financial KPIs Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-center shadow-xs">
              <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Lifetime Value</div>
              <div className="text-base font-black text-rose-600 dark:text-rose-500 mt-1">
                {formatCurrency(customer.totalSpent, currency)}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-center shadow-xs">
              <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Total Orders</div>
              <div className="text-base font-black text-slate-900 dark:text-white mt-1">{customer.orderCount}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-center shadow-xs">
              <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Avg Order Value</div>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(aov, currency)}
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-2.5">
            <h4 className="font-extrabold text-slate-700 dark:text-zinc-400 text-xs uppercase tracking-wider">Contact Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                <Mail className="w-4 h-4 text-rose-600 dark:text-rose-500 shrink-0" />
                <span className="truncate">{customer.email || 'No email registered'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                <Phone className="w-4 h-4 text-rose-600 dark:text-rose-500 shrink-0" />
                <span>{customer.phone || 'No phone registered'}</span>
              </div>
              {customer.location && (
                <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                  <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-500 shrink-0" />
                  <span>{customer.location}</span>
                </div>
              )}
              {customer.lastPurchase && (
                <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                  <Calendar className="w-4 h-4 text-rose-600 dark:text-rose-500 shrink-0" />
                  <span>Last: {customer.lastPurchase}</span>
                </div>
              )}
            </div>
          </div>

          {/* Products Purchased Section */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-rose-600 dark:text-rose-500" />
              <span>Products & Services Purchased ({purchasedProducts.length})</span>
            </h4>
            {purchasedProducts.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {purchasedProducts.map((p) => (
                  <span
                    key={p}
                    className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 font-bold text-[11px]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 dark:text-zinc-500 text-xs italic">No explicit product names logged in transactions.</p>
            )}
          </div>

          {/* CRM Pipeline Opportunities */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
              <Tag className="w-4 h-4 text-rose-600 dark:text-rose-500" />
              <span>Associated CRM Pipeline Opportunities ({customerDeals.length})</span>
            </h4>
            {customerDeals.length > 0 ? (
              <div className="space-y-2">
                {customerDeals.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{d.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase font-mono mt-0.5">Stage: {d.stage.replace('_', ' ')}</div>
                    </div>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                      {formatCurrency(d.dealValue, currency)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 dark:text-zinc-500 text-xs italic">No active CRM deals linked to this account.</p>
            )}
          </div>

          {/* Recent Transaction Log Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-600 dark:text-rose-500" />
              <span>Transaction History Log ({customerTxs.length})</span>
            </h4>
            <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Product / Category</th>
                    <th className="p-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                  {customerTxs.length > 0 ? (
                    customerTxs.slice(0, 10).map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                        <td className="p-3 text-slate-500 dark:text-zinc-400 font-mono">{t.dateString}</td>
                        <td className="p-3 font-medium text-slate-900 dark:text-white">{t.product || t.category || 'Sale'}</td>
                        <td className="p-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(t.revenue || 0, currency)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-slate-400 dark:text-zinc-500">No transactions recorded</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-900 dark:text-white font-extrabold rounded-full border border-slate-200 dark:border-zinc-800 active:scale-95 transition-all text-xs"
          >
            Close Customer Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
