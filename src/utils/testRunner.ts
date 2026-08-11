import { autoDetectColumns, validateMapping } from './columnMatcher';
import { calculateMetrics } from './metricsCalculator';
import { generateBusinessSummary } from './summaryEngine';
import { calculateCustomerAnalytics, calculateProductAnalytics } from './customerProductAnalytics';
import { calculateBreakEven, simulateScenario, calculateCashFlowProjections } from './forecastingEngine';
import { detectAnomalies } from './anomalyDetector';
import { evaluateNaturalQuery } from './naturalQueryEngine';
import { calculateTaxDeductions } from './taxEstimator';
import { calculateCohortRetention } from './cohortAnalytics';
import { formatCurrency } from './currencyFormatter';
import { PLATFORM_PRESETS } from './platformPresets';
import { DEMO_DATASET } from './demoData';
import { cleanNumber } from './dataParser';

console.log('========================================');
console.log('DATABETA FULL INTEGRATION TEST SUITE');
console.log('========================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.log(`❌ FAIL: ${testName}`);
    failedTests++;
  }
}

// 1. Column Detection & Validation
const headers1 = ['Tx_Date', 'Total Revenue', 'Operational Cost', 'Product Category'];
const mapped1 = autoDetectColumns(headers1);
assert(mapped1.date === 'Tx_Date', 'Column Detection: Date matched Tx_Date');
assert(mapped1.revenue === 'Total Revenue', 'Column Detection: Revenue matched Total Revenue');
assert(mapped1.expense === 'Operational Cost', 'Column Detection: Expense matched Operational Cost');

const validation1 = validateMapping(mapped1);
assert(validation1.isValid === true, 'Column Validation: Valid when Date and Revenue exist');

// 2. Number Cleaning
assert(cleanNumber('$1,250.50') === 1250.50, 'Clean Number: Currency $ string');
assert(cleanNumber('€450.00') === 450.00, 'Clean Number: Currency € string');

// 3. Multi-Currency Formatter
assert(formatCurrency(1250.50, 'USD').includes('$'), 'Multi-Currency: USD formats with $');
assert(formatCurrency(1250.50, 'EUR').includes('€') || formatCurrency(1250.50, 'EUR').includes('EUR'), 'Multi-Currency: EUR formats properly');

// 4. Platform Presets
assert(PLATFORM_PRESETS.length === 6, 'Platform Presets: 6 E-Commerce presets defined');

// 5. Customer & Product Analytics
const custStats = calculateCustomerAnalytics(DEMO_DATASET.records);
assert(custStats.totalUniqueCustomers > 0, `Customer Analytics: Unique customers count is ${custStats.totalUniqueCustomers}`);

const prodStats = calculateProductAnalytics(DEMO_DATASET.records);
assert(prodStats.totalProducts > 0, `Product Analytics: Total product count is ${prodStats.totalProducts}`);

// 6. Break-Even & Cash Flow
const metrics = calculateMetrics(DEMO_DATASET.records);
assert(metrics.breakEvenRevenue !== null && metrics.breakEvenRevenue > 0, 'Break-Even: Calculated target revenue');

// 7. Natural Query Engine
const q1 = evaluateNaturalQuery('What was my best month?', DEMO_DATASET.records, 'USD');
assert(q1 !== null && q1.title.includes('Highest Revenue Month'), 'Natural Query: "best month" answer card generated');

const q2 = evaluateNaturalQuery('top customer', DEMO_DATASET.records, 'USD');
assert(q2 !== null && q2.title.includes('Top Customer'), 'Natural Query: "top customer" answer card generated');

// 8. Tax Deduction Estimator
const taxSummary = calculateTaxDeductions(DEMO_DATASET.records);
assert(taxSummary.totalDeductibleExpense > 0, `Tax Estimator: Calculated ${formatCurrency(taxSummary.totalDeductibleExpense, 'USD')} in deductions`);
assert(taxSummary.estimatedTaxSavings > 0, `Tax Estimator: Estimated ${formatCurrency(taxSummary.estimatedTaxSavings, 'USD')} in tax savings`);

// 9. Cohort Analytics
const cohortStats = calculateCohortRetention(DEMO_DATASET.records);
assert(cohortStats.cohorts.length > 0, `Cohort Retention: Generated ${cohortStats.cohorts.length} monthly customer cohorts`);

// 10. Anomaly Detection Engine
const anomalies = detectAnomalies(DEMO_DATASET.records);
assert(Array.isArray(anomalies), 'Anomaly Detector: Returns alert list array');

console.log('\n========================================');
console.log(`TEST RESULTS: ${passedTests} Passed, ${failedTests} Failed.`);
console.log('========================================');

if (failedTests > 0) {
  process.exit(1);
}
