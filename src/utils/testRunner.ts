import { parseCSV, normalizeRows } from './dataParser';
import { autoDetectColumns, validateMapping } from './columnMatcher';
import { calculateMetrics } from './metricsCalculator';
import { formatCurrency, cleanNumericString } from './currencyFormatter';
import { PLATFORM_PRESETS } from './platformPresets';
import { calculateCustomerAnalytics, calculateProductAnalytics } from './customerProductAnalytics';
import { calculateBreakEven } from './forecastingEngine';
import { evaluateNaturalQuery } from './naturalQueryEngine';
import { calculateTaxDeductions } from './taxEstimator';
import { detectAnomalies } from './anomalyDetector';
import { getStoredCRMContacts, syncContactsFromTransactions, calculatePipelineSummary, DEFAULT_CRM_CONTACTS } from './crmEngine';
import { generateAICopilotResponse } from './aiEngine';
import {
  authenticateWithGoogleProfile,
  authenticateWithAppleProfile,
  loginWithEmail,
  signUpWithEmail,
  getAdminStats,
  getStoredLogs,
  markTourCompleted,
} from './authEngine';
import { calculateFinancialHealthScore } from './healthCalculator';

export function runAllTests(): { passed: number; failed: number; log: string[] } {
  const log: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      log.push(`✅ PASS: ${testName}`);
    } else {
      failed++;
      log.push(`❌ FAIL: ${testName}`);
    }
  }

  // Sample CSV text
  const sampleCSV = `Tx_Date,Total Revenue,Operational Cost,Category,Product Name,Customer Email
2026-05-01,150.00,45.00,Software,Pro Plan,user1@test.com
2026-05-02,300.00,90.00,Software,Enterprise Plan,user2@test.com
2026-05-03,50.00,10.00,Services,Consulting,user1@test.com`;

  const parsed = parseCSV(sampleCSV);
  const mapping = autoDetectColumns(parsed.headers);

  assert(mapping.date === 'Tx_Date', 'Column Detection: Date matched Tx_Date');
  assert(mapping.revenue === 'Total Revenue', 'Column Detection: Revenue matched Total Revenue');
  assert(mapping.expense === 'Operational Cost', 'Column Detection: Expense matched Operational Cost');

  const validation = validateMapping(mapping);
  assert(validation.isValid === true, 'Column Validation: Valid when Date and Revenue exist');

  const records = normalizeRows(parsed.rawRows, mapping);
  const metrics = calculateMetrics(records);

  assert(metrics.totalRevenue === 500, 'Metrics Calculation: Total Revenue is 500');
  assert(metrics.totalExpenses === 145, 'Metrics Calculation: Total Expenses is 145');
  assert(metrics.estimatedProfit === 355, 'Metrics Calculation: Net Profit is 355');

  assert(cleanNumericString('$1,250.50') === 1250.5, 'Clean Number: Currency $ string');
  assert(cleanNumericString('€3.450,75') === 3450.75, 'Clean Number: Currency € string');

  assert(formatCurrency(1000, 'USD') === '$1,000.00', 'Multi-Currency: USD formats with $');
  assert(formatCurrency(1000, 'EUR').includes('1') && formatCurrency(1000, 'EUR').includes('000'), 'Multi-Currency: EUR formats properly');

  assert(Object.keys(PLATFORM_PRESETS).length === 6, 'Platform Presets: 6 E-Commerce presets defined');

  const sampleLargeRecords = Array.from({ length: 50 }).map((_, i) => ({
    id: `r-${i}`,
    date: new Date(2026, 0, (i % 28) + 1),
    dateString: `2026-01-${(i % 28) + 1}`,
    revenue: 100 + i * 10,
    expense: 30 + i * 2,
    profit: 70 + i * 8,
    category: i % 2 === 0 ? 'Software' : 'Services',
    product: `Product-${i % 5}`,
    customer: `Client-${i % 17}`,
  }));

  const customerStats = calculateCustomerAnalytics(sampleLargeRecords);
  assert(customerStats.totalUniqueCustomers === 17, 'Customer Analytics: Unique customers count is 17');

  const productStats = calculateProductAnalytics(sampleLargeRecords);
  assert(productStats.totalProducts === 5, 'Product Analytics: Total product count is 5');

  const largeMetrics = calculateMetrics(sampleLargeRecords);
  const breakEven = calculateBreakEven(largeMetrics.totalRevenue, largeMetrics.fixedExpenses, largeMetrics.variableExpenses);
  assert(breakEven !== null && breakEven > 0, 'Break-Even: Calculated target revenue');

  const queryResult1 = evaluateNaturalQuery('best month', sampleLargeRecords, 'USD');
  assert(queryResult1 !== null && queryResult1.title.includes('Highest Revenue Month'), 'Natural Query: "best month" answer card generated');

  const queryResult2 = evaluateNaturalQuery('top customer', sampleLargeRecords, 'USD');
  assert(queryResult2 !== null && queryResult2.title.includes('Top Customer'), 'Natural Query: "top customer" answer card generated');

  const taxSummary = calculateTaxDeductions(sampleLargeRecords);
  assert(taxSummary.totalGrossExpense > 0, 'Tax Estimator: Calculated gross expense deductions');
  assert(taxSummary.estimatedTaxSavings > 0, 'Tax Estimator: Estimated tax savings');

  const anomalies = detectAnomalies(sampleLargeRecords);
  assert(Array.isArray(anomalies), 'Anomaly Detector: Returns alert list array');

  // FINANCIAL HEALTH SCORECARD TEST
  const healthScore = calculateFinancialHealthScore(sampleLargeRecords);
  assert(healthScore.score > 0 && healthScore.score <= 100, 'Health Engine: Financial Health Score calculated (0-100)');
  assert(healthScore.grade !== undefined, 'Health Engine: Business health grade assigned');

  // CRM TESTS
  const crmSummary = calculatePipelineSummary(DEFAULT_CRM_CONTACTS);
  assert(crmSummary.totalDeals === 5, 'CRM Engine: Default deal pipeline count is 5');
  assert(crmSummary.totalPipelineValue > 0, 'CRM Engine: Total pipeline value calculated');

  const syncedCRM = syncContactsFromTransactions(records, DEFAULT_CRM_CONTACTS);
  assert(syncedCRM.length >= 5, 'CRM Engine: Auto-synced transaction customers into CRM contacts');

  // AI COPILOT TESTS
  const aiBriefing = generateAICopilotResponse('Generate Executive Briefing', records, 'USD', DEFAULT_CRM_CONTACTS);
  assert(aiBriefing.answerText.includes('Executive Financial Briefing'), 'AI Engine: Executive briefing generated');
  assert(aiBriefing.cards !== undefined && aiBriefing.cards.length > 0, 'AI Engine: Executive cards generated');

  // AUTH & ADMIN TESTS
  const googleUser = authenticateWithGoogleProfile('yogiraj@databeta.io');
  assert(googleUser.authProvider === 'google', 'Auth Engine: Google OAuth login session created');
  assert(googleUser.email === 'yogiraj@databeta.io', 'Auth Engine: Google profile data mapped');

  const updatedUser = markTourCompleted(googleUser);
  assert(updatedUser.isFirstTimeUser === false, 'Auth Engine: Guided tour completion marked');

  const appleUser = authenticateWithAppleProfile('h.mcneil@privaterelay.appleid.com');
  assert(appleUser.authProvider === 'apple', 'Auth Engine: Apple ID private relay session created');

  const adminUser = loginWithEmail('admin@databeta.io', 'pass');
  assert(adminUser.role === 'admin', 'Auth Engine: Admin/Owner login creates admin role');

  const adminStats = getAdminStats();
  assert(adminStats.systemUptimePct === 99.99, 'Admin Engine: System uptime is 99.99%');

  const adminLogs = getStoredLogs();
  assert(adminLogs.length > 0, 'Admin Engine: Session logs audit table generated');

  return { passed, failed, log };
}

// Auto-run if executed directly via npx tsx
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('========================================');
  console.log('DATABETA FULL INTEGRATION TEST SUITE');
  console.log('========================================\n');
  const res = runAllTests();
  res.log.forEach((l) => console.log(l));
  console.log('\n========================================');
  console.log(`TEST RESULTS: ${res.passed} Passed, ${res.failed} Failed.`);
  console.log('========================================');
  if (res.failed > 0) {
    process.exit(1);
  }
}
