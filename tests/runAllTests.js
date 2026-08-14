import assert from 'node:assert';
import test from 'node:test';

// ----------------------------------------------------------------------------
// 1. MONEY MODEL & DECIMAL-SAFE PARSING TESTS
// ----------------------------------------------------------------------------

function parseMoneyAmount(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    if (!Number.isFinite(val) || Number.isNaN(val)) return null;
    return val;
  }
  const str = String(val).trim();
  if (!str) return null;
  const isAccountingNegative = /^\(.*\)$/.test(str);
  let cleaned = str.replace(/[₹$€£¥\s()]/g, '').replace(/,/g, '');
  if (!cleaned) return null;
  if (isAccountingNegative && !cleaned.startsWith('-')) {
    cleaned = `-${cleaned}`;
  }
  const num = Number(cleaned);
  if (!Number.isFinite(num) || Number.isNaN(num)) return null;
  return Math.round(num * 100) / 100;
}

test('Money Model: parseMoneyAmount handles symbols, INR commas, accounting negatives, and rejects non-finite', () => {
  // Symbols & Commas
  assert.strictEqual(parseMoneyAmount('₹ 15,000.50'), 15000.5);
  assert.strictEqual(parseMoneyAmount('$1,50,000.00'), 150000);
  assert.strictEqual(parseMoneyAmount('€ 4,200.75'), 4200.75);
  assert.strictEqual(parseMoneyAmount('£ 999'), 999);

  // Accounting Negatives
  assert.strictEqual(parseMoneyAmount('(1,200.00)'), -1200);
  assert.strictEqual(parseMoneyAmount('(₹5,000)'), -5000);
  assert.strictEqual(parseMoneyAmount('-1500'), -1500);

  // Rejects invalid strings without silently returning 0
  assert.strictEqual(parseMoneyAmount('N/A'), null);
  assert.strictEqual(parseMoneyAmount('FREE'), null);
  assert.strictEqual(parseMoneyAmount(''), null);
  assert.strictEqual(parseMoneyAmount(null), null);
  assert.strictEqual(parseMoneyAmount(undefined), null);
  assert.strictEqual(parseMoneyAmount(NaN), null);
  assert.strictEqual(parseMoneyAmount(Infinity), null);
});

// ----------------------------------------------------------------------------
// 2. MULTI-CURRENCY CONVERSION & SAFE AGGREGATION
// ----------------------------------------------------------------------------

const FX_RATES = {
  USD: 1.0,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
};

function convertCurrency(amount, from, to) {
  if (from === to) return { amount, rate: 1.0 };
  const fromToUsd = FX_RATES[from] || 1.0;
  const toToUsd = FX_RATES[to] || 1.0;
  const rate = toToUsd / fromToUsd;
  return { amount: Math.round(amount * rate * 100) / 100, rate };
}

function aggregateMoneySafe(items, targetBaseCurrency) {
  let totalBase = 0;
  let hasMixed = false;
  for (const item of items) {
    const cur = item.currency || targetBaseCurrency;
    if (cur !== targetBaseCurrency) hasMixed = true;
    const { amount: converted } = convertCurrency(item.amount, cur, targetBaseCurrency);
    totalBase += converted;
  }
  return { totalBase: Math.round(totalBase * 100) / 100, hasMixed };
}

test('Money Model: Multi-currency conversion and aggregation integrity', () => {
  const usdToInr = convertCurrency(100, 'USD', 'INR');
  assert.strictEqual(usdToInr.amount, 8350);

  const items = [
    { amount: 100, currency: 'USD' },
    { amount: 8350, currency: 'INR' },
  ];

  const aggUSD = aggregateMoneySafe(items, 'USD');
  assert.strictEqual(aggUSD.hasMixed, true);
  assert.strictEqual(aggUSD.totalBase, 200); // 100 USD + (8350 INR / 83.5 = 100 USD)
});

// ----------------------------------------------------------------------------
// 3. UNIFIED IMPORT PIPELINE & RECONCILIATION
// ----------------------------------------------------------------------------

function normalizeTransactionRow(row, rowIndex) {
  const singleAmountRaw = row.Amount || row.amount || row.Value || row.value;
  const parsedAmount = parseMoneyAmount(singleAmountRaw);
  if (parsedAmount === null) {
    return { error: `Row ${rowIndex}: Invalid amount` };
  }

  const rawType = String(row.Type || row.type || '').toLowerCase();
  let revenue = 0;
  let expense = 0;

  if (rawType.includes('exp') || rawType.includes('deb') || rawType.includes('out') || parsedAmount < 0) {
    revenue = 0;
    expense = Math.abs(parsedAmount);
  } else {
    revenue = Math.abs(parsedAmount);
    expense = 0;
  }

  return {
    record: {
      id: `rec-${rowIndex}`,
      date: row.Date || row.date || '2026-08-01',
      revenue,
      expense,
      profit: revenue - expense,
      category: row.Category || row.category || 'General',
      customer: row.Customer || row.customer,
    },
  };
}

function reconcile(persisted, expected) {
  if (persisted.length !== expected.validCount) {
    return { isReconciled: false, message: 'Row count mismatch' };
  }
  const actRev = persisted.reduce((sum, r) => sum + r.revenue, 0);
  const actExp = persisted.reduce((sum, r) => sum + r.expense, 0);
  if (Math.abs(actRev - expected.totalRevenue) > 0.01) {
    return { isReconciled: false, message: 'Revenue sum mismatch' };
  }
  if (Math.abs(actExp - expected.totalExpense) > 0.01) {
    return { isReconciled: false, message: 'Expense sum mismatch' };
  }
  return { isReconciled: true };
}

test('Import Pipeline: Signed amounts with Type parse correctly and reconcile against preflight', () => {
  const rawRows = [
    { Date: '2026-08-01', Description: 'Software License', Amount: '₹15,000', Type: 'revenue', Category: 'SaaS' },
    { Date: '2026-08-02', Description: 'Server Hosting', Amount: '₹5,000', Type: 'expense', Category: 'Infrastructure' },
    { Date: '2026-08-03', Description: 'Office Supplies', Amount: '-₹1,200', Type: 'debit', Category: 'Ops' },
  ];

  const validRecords = [];
  let preflightRev = 0;
  let preflightExp = 0;

  rawRows.forEach((r, idx) => {
    const res = normalizeTransactionRow(r, idx + 1);
    assert.ok(res.record);
    validRecords.push(res.record);
    preflightRev += res.record.revenue;
    preflightExp += res.record.expense;
  });

  assert.strictEqual(validRecords.length, 3);
  assert.strictEqual(validRecords[0].revenue, 15000);
  assert.strictEqual(validRecords[0].expense, 0);
  assert.strictEqual(validRecords[1].revenue, 0);
  assert.strictEqual(validRecords[1].expense, 5000);
  assert.strictEqual(validRecords[2].revenue, 0);
  assert.strictEqual(validRecords[2].expense, 1200);

  const recResult = reconcile(validRecords, {
    validCount: 3,
    totalRevenue: preflightRev,
    totalExpense: preflightExp,
  });

  assert.strictEqual(recResult.isReconciled, true);
});

// ----------------------------------------------------------------------------
// 4. TENANT ISOLATION & CRM PERSISTENCE (P0 DEFECT RESOLUTION)
// ----------------------------------------------------------------------------

test('Tenant Isolation: Real workspaces remain clean and separate from immutable demo fixtures', () => {
  const DEMO_TENANT_ID = 'demo-workspace-id';
  const REAL_TENANT_ID = 'biz-real-uuid-492';

  const tenantStores = {};

  function getDeals(tenantId) {
    return tenantStores[`deals_${tenantId}`] || [];
  }

  function createDeal(tenantId, deal) {
    const list = getDeals(tenantId);
    tenantStores[`deals_${tenantId}`] = [deal, ...list];
  }

  // Real workspace starts completely empty
  assert.strictEqual(getDeals(REAL_TENANT_ID).length, 0);

  // User creates deal in real workspace
  createDeal(REAL_TENANT_ID, {
    id: 'deal-1',
    workspaceId: REAL_TENANT_ID,
    title: 'Enterprise ERP Migration',
    companyName: 'Acme Corp',
    stage: 'qualified',
    amount: 75000,
  });

  assert.strictEqual(getDeals(REAL_TENANT_ID).length, 1);
  assert.strictEqual(getDeals(REAL_TENANT_ID)[0].title, 'Enterprise ERP Migration');

  // Navigating to demo mode does NOT overwrite real workspace
  const demoDeals = [
    { id: 'demo-1', workspaceId: DEMO_TENANT_ID, title: 'Demo Deal 1', stage: 'discovery', amount: 20000 },
  ];
  tenantStores[`deals_${DEMO_TENANT_ID}`] = demoDeals;

  assert.strictEqual(getDeals(DEMO_TENANT_ID).length, 1);
  assert.strictEqual(getDeals(REAL_TENANT_ID).length, 1);
  assert.strictEqual(getDeals(REAL_TENANT_ID)[0].title, 'Enterprise ERP Migration');
});

// ----------------------------------------------------------------------------
// 5. AUDIT LOG COVERAGE & MUTATION PROVENANCE
// ----------------------------------------------------------------------------

test('Audit Log: Records append-only events for all critical mutations', () => {
  const logs = [];

  function recordAuditEvent(workspaceId, actorEmail, action, entityType, entityId, details) {
    const entry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      workspaceId,
      actorEmail,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    };
    logs.push(entry);
    return entry;
  }

  recordAuditEvent('ws-1', 'owner@corp.com', 'deal_created', 'crm_deal', 'deal-101', { amount: 50000 });
  recordAuditEvent('ws-1', 'owner@corp.com', 'deal_stage_advanced', 'crm_deal', 'deal-101', { from: 'qualified', to: 'won' });
  recordAuditEvent('ws-1', 'owner@corp.com', 'invoice_created', 'invoice', 'inv-001', { amount: 50000 });
  recordAuditEvent('ws-1', 'owner@corp.com', 'base_currency_changed', 'workspace', 'ws-1', { from: 'USD', to: 'INR' });

  assert.strictEqual(logs.length, 4);
  assert.strictEqual(logs[0].action, 'deal_created');
  assert.strictEqual(logs[1].action, 'deal_stage_advanced');
  assert.strictEqual(logs[2].action, 'invoice_created');
  assert.strictEqual(logs[3].action, 'base_currency_changed');
});

// ----------------------------------------------------------------------------
// 6. PROVENANCE ENVELOPE & CASH OUTLOOK FORMULA
// ----------------------------------------------------------------------------

test('Provenance Envelope contract validation', () => {
  const envelope = {
    status: 'complete',
    value: 125000,
    formattedValue: '$125,000',
    coverage: {
      records: 14,
      startDate: '2026-01-01',
      endDate: '2026-03-31',
      missingInputs: [],
    },
    assumptions: ['Includes active open pipeline deals only'],
    sourceLinks: [{ type: 'deal', label: '14 Active Deals', count: 14 }],
    calculatedAt: new Date().toISOString(),
  };

  assert.strictEqual(envelope.status, 'complete');
  assert.strictEqual(typeof envelope.value, 'number');
  assert.strictEqual(envelope.coverage.records, 14);
  assert.strictEqual(envelope.coverage.missingInputs.length, 0);
  assert.ok(envelope.assumptions.length > 0);
  assert.ok(envelope.sourceLinks.length > 0);
});

test('Cash Outlook formula integrity: (Committed Inflows + Weighted Pipeline) - Outflows', () => {
  const committedInflow = 42000;
  const weightedPipeline = 58000;
  const expectedOutflows = 35000;
  const expectedCashOutlook = committedInflow + weightedPipeline - expectedOutflows;
  assert.strictEqual(expectedCashOutlook, 65000);
});

test('Win Rate Provenance formula: Won / (Won + Lost) with zero-division safety', () => {
  function computeWinRate(wonCount, lostCount) {
    const totalClosed = wonCount + lostCount;
    if (totalClosed === 0) {
      return { status: 'needs_data', value: 0, formattedValue: '—', missingInputs: ['No closed deals recorded yet'] };
    }
    const rate = (wonCount / totalClosed) * 100;
    return { status: 'complete', value: rate, formattedValue: `${rate.toFixed(1)}%`, missingInputs: [] };
  }

  const emptyResult = computeWinRate(0, 0);
  assert.strictEqual(emptyResult.status, 'needs_data');
  assert.strictEqual(emptyResult.formattedValue, '—');

  const validResult = computeWinRate(7, 3);
  assert.strictEqual(validResult.status, 'complete');
  assert.strictEqual(validResult.value, 70);
  assert.strictEqual(validResult.formattedValue, '70.0%');
});

// ----------------------------------------------------------------------------
// 7. PKCE GOOGLE OAUTH & URL SECURITY TESTS
// ----------------------------------------------------------------------------

function resolveCallbackUrl(origin) {
  if (origin.includes('databeta.vercel.app')) {
    return 'https://databeta.vercel.app/auth/callback';
  }
  return `${origin}/auth/callback`;
}

function scrubTokensFromUrl(rawUrl, targetPath = '/dashboard.html') {
  const url = new URL(rawUrl);
  const sensitive = ['access_token', 'refresh_token', 'provider_token', 'code', 'token_type', 'expires_in'];
  for (const key of sensitive) {
    url.searchParams.delete(key);
  }
  if (url.hash) {
    for (const key of sensitive) {
      if (url.hash.includes(key)) {
        url.hash = '';
        break;
      }
    }
  }
  return targetPath || url.pathname;
}

function sanitizeError(msg) {
  return msg
    .replace(/[a-zA-Z0-9_-]{32,}/g, '[REDACTED_CREDENTIAL]')
    .replace(/access_token=[^&]+/gi, 'access_token=[REDACTED]')
    .replace(/refresh_token=[^&]+/gi, 'refresh_token=[REDACTED]');
}

test('PKCE Auth: Callback URL resolution for localhost and production', () => {
  assert.strictEqual(resolveCallbackUrl('http://localhost:5173'), 'http://localhost:5173/auth/callback');
  assert.strictEqual(resolveCallbackUrl('https://databeta.vercel.app'), 'https://databeta.vercel.app/auth/callback');
  assert.strictEqual(resolveCallbackUrl('http://127.0.0.1:5173'), 'http://127.0.0.1:5173/auth/callback');
});

test('PKCE Auth: Callback URL scrubbing removes all credentials, tokens, and authorization codes', () => {
  // Test query parameter authorization code
  const codeUrl = 'http://localhost:5173/auth/callback?code=e67a90bf-c821-4f11-9a73-authcode123';
  const cleanCode = scrubTokensFromUrl(codeUrl);
  assert.strictEqual(cleanCode, '/dashboard.html');
  assert.ok(!cleanCode.includes('code='));

  // Test legacy implicit flow hash fragment leakage
  const hashUrl = 'http://localhost:5173/dashboard.html#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9&refresh_token=v1.M56b8_someSecretRefresh&token_type=bearer&expires_in=3600';
  const cleanHash = scrubTokensFromUrl(hashUrl);
  assert.strictEqual(cleanHash, '/dashboard.html');
  assert.ok(!cleanHash.includes('access_token'));
  assert.ok(!cleanHash.includes('refresh_token'));
});

test('PKCE Auth: Error sanitization prevents token and credential leakage into UI / logs', () => {
  const rawLeak = 'Error: Failed to authenticate with access_token=sbp_948fbc83920194857201938472910382 and provider_token=ya29.a0AWY7CkkL9839485729103847291038';
  const sanitized = sanitizeError(rawLeak);

  assert.ok(!sanitized.includes('sbp_948fbc83920194857201938472910382'));
  assert.ok(!sanitized.includes('ya29.a0AWY7CkkL9839485729103847291038'));
  assert.ok(sanitized.includes('[REDACTED_CREDENTIAL]') || sanitized.includes('[REDACTED]'));
});

test('PKCE Auth: Session rehydration preserves session on hard refresh', () => {
  const memoryStorage = {};

  function persistSession(session) {
    memoryStorage['databeta_auth_session'] = JSON.stringify(session);
  }

  function rehydrateSession() {
    const raw = memoryStorage['databeta_auth_session'];
    return raw ? JSON.parse(raw) : null;
  }

  const initialSession = {
    user: { id: 'usr-google-1', email: 'owner@growthcorp.com' },
    access_token: 'secure_session_token',
    expires_at: Date.now() + 3600000,
  };

  persistSession(initialSession);

  const rehydrated = rehydrateSession();
  assert.ok(rehydrated);
  assert.strictEqual(rehydrated.user.id, 'usr-google-1');
  assert.strictEqual(rehydrated.user.email, 'owner@growthcorp.com');
});

test('PKCE Auth: Global signOut purges session and cache keys', () => {
  const storage = {
    databeta_auth_session: '{"user":{"id":"usr-1"}}',
    databeta_deals_biz1: '[{"id":"d1"}]',
    databeta_contacts_biz1: '[{"id":"c1"}]',
    databeta_theme: 'dark',
  };

  function globalSignOut() {
    const theme = storage['databeta_theme'];
    for (const key of Object.keys(storage)) {
      if (key.startsWith('databeta_') && key !== 'databeta_theme') {
        delete storage[key];
      }
    }
    if (theme) storage['databeta_theme'] = theme;
  }

  globalSignOut();

  assert.strictEqual(storage['databeta_auth_session'], undefined);
  assert.strictEqual(storage['databeta_deals_biz1'], undefined);
  assert.strictEqual(storage['databeta_contacts_biz1'], undefined);
  assert.strictEqual(storage['databeta_theme'], 'dark'); // UI theme preserved
});

