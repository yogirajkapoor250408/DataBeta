import { Dataset } from '../types';

export const DEMO_DATASET: Dataset = {
  meta: {
    fileName: 'demo_business_data_2026.csv',
    fileSize: 4096,
    rowCount: 36,
    headers: ['Date', 'Category', 'Product_Service', 'Revenue', 'Expense', 'Customer', 'Quantity'],
    isDemo: true,
    uploadedAt: new Date(),
    mapping: {
      date: 'Date',
      revenue: 'Revenue',
      expense: 'Expense',
      profit: null,
      category: 'Category',
      product: 'Product_Service',
      customer: 'Customer',
      quantity: 'Quantity'
    }
  },
  records: [
    // January 2026
    { id: 'demo-1', date: new Date('2026-01-05'), dateString: '2026-01-05', revenue: 1450.00, expense: null, profit: 1450.00, category: 'E-Commerce Sales', product: 'Wireless Mechanical Keyboard', customer: 'Acme Corp', quantity: 10, raw: {} },
    { id: 'demo-2', date: new Date('2026-01-08'), dateString: '2026-01-08', revenue: null, expense: 450.00, profit: -450.00, category: 'Digital Marketing', product: 'Google Ads Campaign', customer: 'Google Ads', quantity: 1, raw: {} },
    { id: 'demo-3', date: new Date('2026-01-12'), dateString: '2026-01-12', revenue: 2800.00, expense: null, profit: 2800.00, category: 'SaaS Subscriptions', product: 'Enterprise Pro License', customer: 'Nexus Systems', quantity: 2, raw: {} },
    { id: 'demo-4', date: new Date('2026-01-15'), dateString: '2026-01-15', revenue: null, expense: 850.00, profit: -850.00, category: 'Inventory & Fulfillment', product: 'Packaging Materials', customer: 'PackShip Direct', quantity: 500, raw: {} },
    { id: 'demo-5', date: new Date('2026-01-22'), dateString: '2026-01-22', revenue: 3200.00, expense: null, profit: 3200.00, category: 'E-Commerce Sales', product: 'Ergonomic Desk Chairs', customer: 'Starlight Media', quantity: 8, raw: {} },
    { id: 'demo-6', date: new Date('2026-01-28'), dateString: '2026-01-28', revenue: null, expense: 220.00, profit: -220.00, category: 'Cloud Infrastructure', product: 'AWS Server Hosting', customer: 'Amazon Web Services', quantity: 1, raw: {} },

    // February 2026
    { id: 'demo-7', date: new Date('2026-02-03'), dateString: '2026-02-03', revenue: 1950.00, expense: null, profit: 1950.00, category: 'Digital Products', product: 'UI Design Masterclass Course', customer: 'Individual Learners', quantity: 15, raw: {} },
    { id: 'demo-8', date: new Date('2026-02-09'), dateString: '2026-02-09', revenue: null, expense: 600.00, profit: -600.00, category: 'Digital Marketing', product: 'Meta Ad Retargeting', customer: 'Meta Platforms', quantity: 1, raw: {} },
    { id: 'demo-9', date: new Date('2026-02-14'), dateString: '2026-02-14', revenue: 4100.00, expense: null, profit: 4100.00, category: 'E-Commerce Sales', product: 'Ultrawide 4K Monitors', customer: 'Innovate Tech LLC', quantity: 6, raw: {} },
    { id: 'demo-10', date: new Date('2026-02-18'), dateString: '2026-02-18', revenue: null, expense: 1200.00, profit: -1200.00, category: 'Inventory & Fulfillment', product: 'Keyboard Component Stock', customer: 'Global Logistics', quantity: 200, raw: {} },
    { id: 'demo-11', date: new Date('2026-02-24'), dateString: '2026-02-24', revenue: 2900.00, expense: null, profit: 2900.00, category: 'SaaS Subscriptions', product: 'Business Analytics Plan', customer: 'Vanguard Retail', quantity: 3, raw: {} },
    { id: 'demo-12', date: new Date('2026-02-27'), dateString: '2026-02-27', revenue: null, expense: 240.00, profit: -240.00, category: 'Cloud Infrastructure', product: 'Database Cluster Nodes', customer: 'DigitalOcean', quantity: 2, raw: {} },

    // March 2026
    { id: 'demo-13', date: new Date('2026-03-04'), dateString: '2026-03-04', revenue: 3800.00, expense: null, profit: 3800.00, category: 'E-Commerce Sales', product: 'Wireless Mechanical Keyboard', customer: 'Apex Solutions', quantity: 25, raw: {} },
    { id: 'demo-14', date: new Date('2026-03-10'), dateString: '2026-03-10', revenue: null, expense: 750.00, profit: -750.00, category: 'Digital Marketing', product: 'Search Engine Marketing', customer: 'Google Ads', quantity: 1, raw: {} },
    { id: 'demo-15', date: new Date('2026-03-16'), dateString: '2026-03-16', revenue: 5200.00, expense: null, profit: 5200.00, category: 'SaaS Subscriptions', product: 'Enterprise Pro License', customer: 'Quantum Dynamics', quantity: 4, raw: {} },
    { id: 'demo-16', date: new Date('2026-03-21'), dateString: '2026-03-21', revenue: null, expense: 350.00, profit: -350.00, category: 'Office & Supplies', product: 'Software Tool Subscriptions', customer: 'SaaS Suite', quantity: 4, raw: {} },
    { id: 'demo-17', date: new Date('2026-03-26'), dateString: '2026-03-26', revenue: 2600.00, expense: null, profit: 2600.00, category: 'Digital Products', product: 'E-Book Bundle', customer: 'Online Store Customers', quantity: 52, raw: {} },
    { id: 'demo-18', date: new Date('2026-03-29'), dateString: '2026-03-29', revenue: null, expense: 1400.00, profit: -1400.00, category: 'Inventory & Fulfillment', product: 'International Express Freight', customer: 'DHL Express', quantity: 1, raw: {} },

    // April 2026
    { id: 'demo-19', date: new Date('2026-04-02'), dateString: '2026-04-02', revenue: 4900.00, expense: null, profit: 4900.00, category: 'E-Commerce Sales', product: 'Ergonomic Desk Chairs', customer: 'Horizon Studios', quantity: 12, raw: {} },
    { id: 'demo-20', date: new Date('2026-04-07'), dateString: '2026-04-07', revenue: null, expense: 900.00, profit: -900.00, category: 'Digital Marketing', product: 'Influencer Marketing Campaign', customer: 'Creator Network', quantity: 2, raw: {} },
    { id: 'demo-21', date: new Date('2026-04-14'), dateString: '2026-04-14', revenue: 6100.00, expense: null, profit: 6100.00, category: 'SaaS Subscriptions', product: 'Enterprise Pro License', customer: 'BlueShift Inc', quantity: 5, raw: {} },
    { id: 'demo-22', date: new Date('2026-04-19'), dateString: '2026-04-19', revenue: null, expense: 280.00, profit: -280.00, category: 'Cloud Infrastructure', product: 'AWS Bandwidth & Storage', customer: 'Amazon Web Services', quantity: 1, raw: {} },
    { id: 'demo-23', date: new Date('2026-04-24'), dateString: '2026-04-24', revenue: 3400.00, expense: null, profit: 3400.00, category: 'Digital Products', product: 'Template Asset Pack', customer: 'Design Agency Co', quantity: 34, raw: {} },

    // May 2026
    { id: 'demo-24', date: new Date('2026-05-03'), dateString: '2026-05-03', revenue: 5600.00, expense: null, profit: 5600.00, category: 'E-Commerce Sales', product: 'Ultrawide 4K Monitors', customer: 'Peak Creative', quantity: 8, raw: {} },
    { id: 'demo-25', date: new Date('2026-05-08'), dateString: '2026-05-08', revenue: null, expense: 1100.00, profit: -1100.00, category: 'Digital Marketing', product: 'Google Ads Search Campaign', customer: 'Google Ads', quantity: 1, raw: {} },
    { id: 'demo-26', date: new Date('2026-05-15'), dateString: '2026-05-15', revenue: 6800.00, expense: null, profit: 6800.00, category: 'SaaS Subscriptions', product: 'Annual Team License', customer: 'Solstice Group', quantity: 3, raw: {} },
    { id: 'demo-27', date: new Date('2026-05-20'), dateString: '2026-05-20', revenue: null, expense: 1800.00, profit: -1800.00, category: 'Inventory & Fulfillment', product: 'Raw Material Restock', customer: 'Precision Manufacturing', quantity: 500, raw: {} },
    { id: 'demo-28', date: new Date('2026-05-27'), dateString: '2026-05-27', revenue: 4200.00, expense: null, profit: 4200.00, category: 'E-Commerce Sales', product: 'Wireless Mechanical Keyboard', customer: 'Catalyst Labs', quantity: 28, raw: {} },

    // June 2026
    { id: 'demo-29', date: new Date('2026-06-02'), dateString: '2026-06-02', revenue: 6400.00, expense: null, profit: 6400.00, category: 'E-Commerce Sales', product: 'Ergonomic Desk Chairs', customer: 'Metro Office Supply', quantity: 16, raw: {} },
    { id: 'demo-30', date: new Date('2026-06-06'), dateString: '2026-06-06', revenue: null, expense: 1250.00, profit: -1250.00, category: 'Digital Marketing', product: 'Summer Promo Ad Spend', customer: 'Meta & Google Ads', quantity: 2, raw: {} },
    { id: 'demo-31', date: new Date('2026-06-12'), dateString: '2026-06-12', revenue: 7500.00, expense: null, profit: 7500.00, category: 'SaaS Subscriptions', product: 'Enterprise Pro License', customer: 'Aura Logistics', quantity: 6, raw: {} },
    { id: 'demo-32', date: new Date('2026-06-17'), dateString: '2026-06-17', revenue: null, expense: 310.00, profit: -310.00, category: 'Cloud Infrastructure', product: 'CDN & Firewall Services', customer: 'Cloudflare', quantity: 1, raw: {} },
    { id: 'demo-33', date: new Date('2026-06-22'), dateString: '2026-06-22', revenue: 5100.00, expense: null, profit: 5100.00, category: 'Digital Products', product: 'Masterclass Bundle Access', customer: 'Online Store Customers', quantity: 68, raw: {} },
    { id: 'demo-34', date: new Date('2026-06-28'), dateString: '2026-06-28', revenue: null, expense: 950.00, profit: -950.00, category: 'Office & Supplies', product: 'Legal & Accounting Consultation', customer: 'Brighton Advisors', quantity: 1, raw: {} },
  ]
};
