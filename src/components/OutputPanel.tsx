/**
 * Mine Closure Costing - Output Panel Component
 *
 * Right panel displaying results, KPIs, and charts.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAppState } from '../state';
import { KPICard } from '../ui';
import { CATEGORY_NAMES, PHASE_NAMES } from '../domain';
import {
  renderBreakdownChart,
  renderCashflowChart,
  renderTornadoChart,
} from '../charts';
import { downloadResultsCSV, downloadLineItemsCSV, downloadCashflowsCSV } from '../utils/export';
import { formatCurrency, formatPercent } from '../utils/formatting';
import styles from './OutputPanel.module.css';

type ChartView = 'breakdown' | 'cashflow' | 'sensitivity';

export function OutputPanel(): React.ReactElement {
  const { state } = useAppState();
  const { results, currency, inputs, isCalculating } = state;

  const [chartView, setChartView] = useState<ChartView>('breakdown');
  const [showByPhase, setShowByPhase] = useState(false);
  const [showDiscounted, setShowDiscounted] = useState(true);
  const [showCumulative, setShowCumulative] = useState(false);
  const [showNPVSensitivity, setShowNPVSensitivity] = useState(false);

  const breakdownChartRef = useRef<HTMLDivElement>(null);
  const cashflowChartRef = useRef<HTMLDivElement>(null);
  const tornadoChartRef = useRef<HTMLDivElement>(null);

  // Render charts when results change
  useEffect(() => {
    if (!results) return;

    if (breakdownChartRef.current && chartView === 'breakdown') {
      renderBreakdownChart(
        breakdownChartRef.current,
        results.categoryBreakdown,
        results.phaseBreakdown,
        { currency, showByPhase, width: 580, height: 380 }
      );
    }

    if (cashflowChartRef.current && chartView === 'cashflow') {
      renderCashflowChart(cashflowChartRef.current, results.annualCashflows, {
        currency,
        showDiscounted,
        showCumulative,
        width: 620,
        height: 320,
      });
    }

    if (tornadoChartRef.current && chartView === 'sensitivity') {
      renderTornadoChart(
        tornadoChartRef.current,
        results.sensitivityResults,
        results.totalNominalCost,
        { currency, showNPV: showNPVSensitivity, width: 620, height: 340 }
      );
    }
  }, [results, chartView, showByPhase, showDiscounted, showCumulative, showNPVSensitivity, currency]);

  const handleExportResults = useCallback(() => {
    if (results) {
      downloadResultsCSV(results, inputs, currency);
    }
  }, [results, inputs, currency]);

  const handleExportLineItems = useCallback(() => {
    if (results) {
      downloadLineItemsCSV(results, inputs, currency);
    }
  }, [results, inputs, currency]);

  const handleExportCashflows = useCallback(() => {
    if (results) {
      downloadCashflowsCSV(results, inputs, currency);
    }
  }, [results, inputs, currency]);

  if (!results) {
    return (
      <div className={styles.panel}>
        <div className={styles.loading}>
          {isCalculating ? 'Calculating...' : 'Enter inputs to see results'}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Cost Estimate Results</h2>
        <div className={styles.exportButtons}>
          <button className={styles.exportButton} onClick={handleExportResults}>
            Export All CSV
          </button>
          <button className={styles.exportButton} onClick={handleExportLineItems}>
            Line Items
          </button>
          <button className={styles.exportButton} onClick={handleExportCashflows}>
            Cashflows
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <KPICard
          title="Total Nominal Cost"
          value={results.totalNominalCost}
          currency={currency}
          subtitle="Undiscounted"
        />
        <KPICard
          title="Total NPV"
          value={results.totalDiscountedCost}
          currency={currency}
          subtitle={`At ${inputs.financialParams.discountRatePercent}% discount rate`}
        />
        <KPICard
          title="Peak Annual Cashflow"
          value={results.peakAnnualCashflow}
          currency={currency}
          subtitle={`Year ${results.peakCashflowYear}`}
        />
        <KPICard
          title="Duration"
          value={results.totalDurationYears}
          currency={{ ...currency, symbol: '' }}
          subtitle="Total years"
        />
      </div>

      {/* Secondary metrics */}
      <div className={styles.metricsRow}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Direct Works:</span>
          <span className={styles.metricValue}>
            {formatCurrency(results.directWorksCost, currency, { compact: true })}
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Indirect Costs:</span>
          <span className={styles.metricValue}>
            {formatCurrency(results.indirectCosts, currency, { compact: true })}
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Monitoring Share:</span>
          <span className={styles.metricValue}>{formatPercent(results.monitoringCostShare)}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Risk Score:</span>
          <span className={styles.metricValue}>
            {results.derivedQuantities.riskScore}/100
          </span>
        </div>
      </div>

      {/* Chart tabs */}
      <div className={styles.chartSection}>
        <div className={styles.chartTabs}>
          <button
            className={`${styles.chartTab} ${chartView === 'breakdown' ? styles.chartTabActive : ''}`}
            onClick={() => setChartView('breakdown')}
          >
            Cost Breakdown
          </button>
          <button
            className={`${styles.chartTab} ${chartView === 'cashflow' ? styles.chartTabActive : ''}`}
            onClick={() => setChartView('cashflow')}
          >
            Cashflow Profile
          </button>
          <button
            className={`${styles.chartTab} ${chartView === 'sensitivity' ? styles.chartTabActive : ''}`}
            onClick={() => setChartView('sensitivity')}
          >
            Sensitivity
          </button>
        </div>

        {/* Chart options */}
        {chartView === 'breakdown' && (
          <div className={styles.chartOptions}>
            <label className={styles.optionLabel}>
              <input
                type="checkbox"
                checked={showByPhase}
                onChange={(e) => setShowByPhase(e.target.checked)}
              />
              <span>Show by Phase</span>
            </label>
          </div>
        )}

        {chartView === 'cashflow' && (
          <div className={styles.chartOptions}>
            <label className={styles.optionLabel}>
              <input
                type="checkbox"
                checked={showDiscounted}
                onChange={(e) => setShowDiscounted(e.target.checked)}
              />
              <span>Discounted Primary</span>
            </label>
            <label className={styles.optionLabel}>
              <input
                type="checkbox"
                checked={showCumulative}
                onChange={(e) => setShowCumulative(e.target.checked)}
              />
              <span>Show Cumulative</span>
            </label>
          </div>
        )}

        {chartView === 'sensitivity' && (
          <div className={styles.chartOptions}>
            <label className={styles.optionLabel}>
              <input
                type="checkbox"
                checked={showNPVSensitivity}
                onChange={(e) => setShowNPVSensitivity(e.target.checked)}
              />
              <span>Show NPV Impact</span>
            </label>
          </div>
        )}

        {/* Chart containers */}
        <div className={styles.chartContainer}>
          {chartView === 'breakdown' && <div ref={breakdownChartRef} className={styles.chart} />}
          {chartView === 'cashflow' && <div ref={cashflowChartRef} className={styles.chart} />}
          {chartView === 'sensitivity' && <div ref={tornadoChartRef} className={styles.chart} />}
        </div>
      </div>

      {/* Line items table */}
      <div className={styles.tableSection}>
        <h3 className={styles.sectionTitle}>Line Item Details</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th className={styles.alignRight}>Quantity</th>
                <th>Unit</th>
                <th className={styles.alignRight}>Rate</th>
                <th className={styles.alignRight}>Subtotal</th>
                <th>Phase</th>
              </tr>
            </thead>
            <tbody>
              {results.lineItems.map((item, index) => (
                <tr key={index}>
                  <td>{CATEGORY_NAMES[item.category]}</td>
                  <td>{item.description}</td>
                  <td className={styles.alignRight}>
                    {item.quantity.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td>{item.unit}</td>
                  <td className={styles.alignRight}>
                    {formatCurrency(item.unitRate, currency, { compact: true })}
                  </td>
                  <td className={styles.alignRight}>
                    {formatCurrency(item.subtotal, currency, { compact: true })}
                  </td>
                  <td className={styles.phaseCell}>{PHASE_NAMES[item.phase]}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5}><strong>Total</strong></td>
                <td className={styles.alignRight}>
                  <strong>{formatCurrency(results.totalNominalCost, currency)}</strong>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
