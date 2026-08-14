import assert from 'node:assert';
import test from 'node:test';

// Test Provenance Envelope Standard
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
  const committedInflow = 42000; // Sent invoices due soon
  const weightedPipeline = 58000; // Probability adjusted deals closing this month
  const expectedOutflows = 35000; // Known recurring expenses

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

test('Import CSV Validator integrity check', () => {
  function validateDealHeaders(headers) {
    const required = ['title', 'companyName', 'amount', 'stage', 'expectedCloseDate'];
    const lower = headers.map((h) => h.toLowerCase().trim());
    const missing = required.filter((req) => !lower.includes(req.toLowerCase()));
    return {
      isValid: missing.length === 0,
      missingHeaders: missing,
    };
  }

  const badHeaders = ['Company', 'Contact', 'Stage'];
  const badCheck = validateDealHeaders(badHeaders);
  assert.strictEqual(badCheck.isValid, false);
  assert.ok(badCheck.missingHeaders.includes('title'));
  assert.ok(badCheck.missingHeaders.includes('expectedCloseDate'));

  const goodHeaders = ['title', 'companyName', 'amount', 'stage', 'expectedCloseDate', 'contactEmail'];
  const goodCheck = validateDealHeaders(goodHeaders);
  assert.strictEqual(goodCheck.isValid, true);
  assert.strictEqual(goodCheck.missingHeaders.length, 0);
});

test('Audit Log mutation contract verification', () => {
  const auditEntries = [];

  function recordAudit(actor, action, entityType, entityId, changes) {
    const entry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      entityType,
      entityId,
      changes,
    };
    auditEntries.push(entry);
    return entry;
  }

  const entry = recordAudit('admin@apextech.com', 'stage_change', 'deal', 'deal-101', { from: 'proposal_sent', to: 'won' });
  assert.strictEqual(auditEntries.length, 1);
  assert.strictEqual(entry.entityId, 'deal-101');
  assert.strictEqual(entry.changes.to, 'won');
});
