import { PlatformPresetConfig, PlatformPreset } from '../types';

export const PLATFORM_PRESETS: PlatformPresetConfig[] = [
  {
    id: 'shopify',
    name: 'Shopify Orders Export',
    description: 'Auto-maps Shopify CSV columns (Created at, Total, Shipping, Customer, Lineitem name)',
    iconName: 'ShoppingBag',
    mapping: {
      date: 'Created at',
      revenue: 'Total',
      expense: 'Shipping',
      profit: 'Subtotal',
      category: 'Vendor',
      product: 'Lineitem name',
      customer: 'Billing Name',
      quantity: 'Lineitem quantity',
    },
  },
  {
    id: 'stripe',
    name: 'Stripe Payments Export',
    description: 'Auto-maps Stripe transaction logs (Created UTC, Amount, Fee, Net, Customer Email)',
    iconName: 'CreditCard',
    mapping: {
      date: 'Created (UTC)',
      revenue: 'Amount',
      expense: 'Fee',
      profit: 'Net',
      category: 'Type',
      product: 'Description',
      customer: 'Customer Email',
      quantity: null,
    },
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce Orders',
    description: 'Auto-maps WooCommerce CSV export columns',
    iconName: 'ShoppingCart',
    mapping: {
      date: 'Order Date',
      revenue: 'Order Total',
      expense: 'Order Shipping',
      profit: null,
      category: 'Category',
      product: 'Order Items',
      customer: 'Billing First Name',
      quantity: 'Item Qty',
    },
  },
  {
    id: 'square',
    name: 'Square POS Sales',
    description: 'Auto-maps Square Register and POS CSV files',
    iconName: 'Square',
    mapping: {
      date: 'Date',
      revenue: 'Total Collected',
      expense: 'Fees',
      profit: 'Net Sales',
      category: 'Category',
      product: 'Item',
      customer: 'Customer Name',
      quantity: 'Qty',
    },
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks Online Export',
    description: 'Auto-maps QuickBooks transaction and ledger CSV reports',
    iconName: 'BookOpen',
    mapping: {
      date: 'Date',
      revenue: 'Amount',
      expense: 'Expense Amount',
      profit: null,
      category: 'Class',
      product: 'Memo/Description',
      customer: 'Name',
      quantity: null,
    },
  },
  {
    id: 'paypal',
    name: 'PayPal Activity Statement',
    description: 'Auto-maps PayPal activity report columns (Gross, Fee, Net)',
    iconName: 'DollarSign',
    mapping: {
      date: 'Date',
      revenue: 'Gross',
      expense: 'Fee',
      profit: 'Net',
      category: 'Type',
      product: 'Item Title',
      customer: 'Name',
      quantity: 'Quantity',
    },
  },
];

export function getPresetMapping(presetId: PlatformPreset): PlatformPresetConfig | null {
  return PLATFORM_PRESETS.find((p) => p.id === presetId) || null;
}
