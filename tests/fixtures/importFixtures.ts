/**
 * Test fixtures for Import Normalization & Money Model Pipeline
 */

export const FIXTURE_SIGNED_AMOUNT_CSV = `Date,Description,Amount,Type,Category,Customer
2026-08-01,Enterprise Subscription,₹15000,revenue,SaaS,Acme Corp
2026-08-02,AWS Cloud Hosting,₹5000,expense,Infrastructure,Amazon AWS
2026-08-03,Consulting Fee,₹25000,income,Services,Stark Enterprises
2026-08-04,Office Supplies,₹1200,debit,Operations,Staples Inc
2026-08-05,Marketing Campaign,-₹3000,expense,Marketing,Google Ads
`;

export const FIXTURE_SEPARATE_COLUMNS_CSV = `Date,Description,Revenue,Expense,Category,Customer
2026-08-01,Software License,$10000,,SaaS,Beta Corp
2026-08-02,Server Renewal,,$2500,Hosting,Vercel
2026-08-03,Custom Integration,$18500.50,,Professional Services,Cyberdyne
2026-08-04,Accounting Audit,,$4000.00,Legal,KPMG
`;

export const FIXTURE_DIRTY_ACCOUNTING_CSV = `Date,Description,Amount,Type,Category
2026-08-10,Customer Payment 1," 1,50,000.00 ",credit,Enterprise
2026-08-11,Software Refund,(12,500.00),expense,Returns
2026-08-12,Vendor Payout,-5000,outflow,Vendors
2026-08-13,Retainer Fee,€20000,revenue,Consulting
`;

export const FIXTURE_INVALID_ROWS_CSV = `Date,Description,Amount,Type,Category
2026-08-01,Valid Deal,10000,revenue,SaaS
2026-08-02,Corrupt Deal,N/A,revenue,SaaS
,Missing Date,5000,expense,Ops
2026-08-04,Invalid Amount Text,FREE_TRIAL,revenue,SaaS
`;

export const FIXTURE_DEALS_CSV = `Title,Company,Contact,Amount,Stage,Expected Close Date,Next Step
Acme Cloud Migration,Acme Corp,John Doe,₹45000,negotiation,2026-09-15,Send revised SLA
BioTech Analytics,BioTech Labs,Sarah Connor,₹85000,proposal_sent,2026-09-30,Follow up on security audit
Stark Security Suite,Stark Industries,Tony Stark,₹120000,discovery,2026-10-15,Technical deep dive
`;

export const FIXTURE_INVOICES_CSV = `Invoice Number,Customer Name,Amount,Issue Date,Due Date,Status,Amount Paid
INV-2026-001,Acme Corp,₹15000,2026-08-01,2026-08-15,due_soon,0
INV-2026-002,BioTech Labs,₹35000,2026-07-01,2026-07-20,overdue,0
INV-2026-003,Stark Industries,₹50000,2026-07-15,2026-08-01,paid,₹50000
`;
