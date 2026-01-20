/**
 * Mine Closure Costing - Export Utilities
 *
 * JSON and CSV export functionality for scenarios and results.
 */

import type {
  InputState,
  Results,
  LineItemCost,
  AnnualCashflow,
  CurrencyConfig,
} from '../domain/types';
import { CATEGORY_NAMES, PHASE_NAMES } from '../domain/types';
import { formatCurrency } from './formatting';

/**
 * Export scenario inputs as JSON
 */
export function exportScenarioJSON(inputs: InputState): string {
  return JSON.stringify(inputs, null, 2);
}

/**
 * Import scenario from JSON
 */
export function importScenarioJSON(json: string): InputState {
  return JSON.parse(json) as InputState;
}

/**
 * Download a file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download scenario as JSON file
 */
export function downloadScenarioJSON(inputs: InputState): void {
  const json = exportScenarioJSON(inputs);
  const filename = `${inputs.scenarioName.replace(/[^a-z0-9]/gi, '_')}_scenario.json`;
  downloadFile(json, filename, 'application/json');
}

/**
 * Export line items as CSV
 */
export function exportLineItemsCSV(
  lineItems: readonly LineItemCost[],
  currency: CurrencyConfig
): string {
  const headers = ['Category', 'Description', 'Quantity', 'Unit', 'Unit Rate', 'Subtotal', 'Phase'];
  const rows = lineItems.map((item) => [
    CATEGORY_NAMES[item.category],
    item.description,
    item.quantity.toString(),
    item.unit,
    formatCurrency(item.unitRate, currency),
    formatCurrency(item.subtotal, currency),
    PHASE_NAMES[item.phase],
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csvContent;
}

/**
 * Export annual cashflows as CSV
 */
export function exportCashflowsCSV(
  cashflows: readonly AnnualCashflow[],
  currency: CurrencyConfig
): string {
  const headers = [
    'Year',
    'Nominal Cost',
    'Escalated Cost',
    'Discounted Cost',
    'Cumulative Nominal',
    'Cumulative Discounted',
  ];

  const rows = cashflows.map((cf) => [
    cf.year.toString(),
    formatCurrency(cf.nominalCost, currency),
    formatCurrency(cf.escalatedCost, currency),
    formatCurrency(cf.discountedCost, currency),
    formatCurrency(cf.cumulativeNominal, currency),
    formatCurrency(cf.cumulativeDiscounted, currency),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csvContent;
}

/**
 * Download results as CSV files (combined)
 */
export function downloadResultsCSV(
  results: Results,
  inputs: InputState,
  currency: CurrencyConfig
): void {
  // Create combined CSV with multiple sections
  let content = '=== MINE CLOSURE COST ESTIMATE ===\n\n';
  content += `Scenario: ${inputs.scenarioName}\n`;
  content += `Generated: ${new Date().toISOString()}\n\n`;

  content += '=== SUMMARY ===\n';
  content += `Total Nominal Cost,${formatCurrency(results.totalNominalCost, currency)}\n`;
  content += `Total Discounted (NPV),${formatCurrency(results.totalDiscountedCost, currency)}\n`;
  content += `Peak Annual Cashflow,${formatCurrency(results.peakAnnualCashflow, currency)}\n`;
  content += `Peak Year,${results.peakCashflowYear}\n`;
  content += `Total Duration,${results.totalDurationYears} years\n\n`;

  content += '=== LINE ITEMS ===\n';
  content += exportLineItemsCSV(results.lineItems, currency);
  content += '\n\n';

  content += '=== ANNUAL CASHFLOWS ===\n';
  content += exportCashflowsCSV(results.annualCashflows, currency);

  const filename = `${inputs.scenarioName.replace(/[^a-z0-9]/gi, '_')}_results.csv`;
  downloadFile(content, filename, 'text/csv');
}

/**
 * Download line items only as CSV
 */
export function downloadLineItemsCSV(
  results: Results,
  inputs: InputState,
  currency: CurrencyConfig
): void {
  const csv = exportLineItemsCSV(results.lineItems, currency);
  const filename = `${inputs.scenarioName.replace(/[^a-z0-9]/gi, '_')}_line_items.csv`;
  downloadFile(csv, filename, 'text/csv');
}

/**
 * Download cashflows only as CSV
 */
export function downloadCashflowsCSV(
  results: Results,
  inputs: InputState,
  currency: CurrencyConfig
): void {
  const csv = exportCashflowsCSV(results.annualCashflows, currency);
  const filename = `${inputs.scenarioName.replace(/[^a-z0-9]/gi, '_')}_cashflows.csv`;
  downloadFile(csv, filename, 'text/csv');
}
