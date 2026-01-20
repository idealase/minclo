/**
 * Mine Closure Costing - Cost Breakdown Chart (D3)
 *
 * Stacked horizontal bar chart showing cost breakdown by category or phase.
 * Uses D3 enter/update/exit pattern for efficient updates.
 */

import * as d3 from 'd3';
import type { CurrencyConfig, CategoryCostSummary, PhaseCostSummary } from '../domain/types';
import { CATEGORY_NAMES, PHASE_NAMES, CostCategory, ClosurePhase } from '../domain/types';
import { formatCurrency, formatPercent } from '../utils/formatting';

// Color palette for categories
const CATEGORY_COLORS: Record<CostCategory, string> = {
  [CostCategory.Mobilisation]: '#2563eb',
  [CostCategory.SiteEstablishment]: '#3b82f6',
  [CostCategory.Demolition]: '#ef4444',
  [CostCategory.Earthworks]: '#f97316',
  [CostCategory.TSFClosure]: '#eab308',
  [CostCategory.WRDRehabilitation]: '#84cc16',
  [CostCategory.WaterTreatmentCapex]: '#06b6d4',
  [CostCategory.WaterTreatmentOpex]: '#0891b2',
  [CostCategory.Revegetation]: '#22c55e',
  [CostCategory.ErosionControls]: '#10b981',
  [CostCategory.RoadRehabilitation]: '#8b5cf6',
  [CostCategory.HazardousMaterials]: '#a855f7',
  [CostCategory.Monitoring]: '#ec4899',
  [CostCategory.CommunityHeritage]: '#f43f5e',
  [CostCategory.Contingency]: '#6b7280',
  [CostCategory.RiskUplift]: '#9ca3af',
  [CostCategory.OwnersCosts]: '#475569',
  [CostCategory.ContractorMargin]: '#64748b',
};

// Color palette for phases
const PHASE_COLORS: Record<ClosurePhase, string> = {
  [ClosurePhase.PlanningApprovals]: '#3b82f6',
  [ClosurePhase.DecommissioningDemolition]: '#ef4444',
  [ClosurePhase.EarthworksLandform]: '#f97316',
  [ClosurePhase.TailingsWRDRehabilitation]: '#eab308',
  [ClosurePhase.WaterManagement]: '#06b6d4',
  [ClosurePhase.RevegetationEcosystem]: '#22c55e',
  [ClosurePhase.MonitoringMaintenance]: '#8b5cf6',
  [ClosurePhase.RelinquishmentPostClosure]: '#ec4899',
};

export interface BreakdownChartConfig {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  currency: CurrencyConfig;
  showByPhase: boolean;
}

const DEFAULT_CONFIG: BreakdownChartConfig = {
  width: 600,
  height: 400,
  margin: { top: 20, right: 120, bottom: 40, left: 180 },
  currency: { symbol: '$', code: 'AUD', locale: 'en-AU' },
  showByPhase: false,
};

/**
 * Render or update breakdown chart
 */
export function renderBreakdownChart(
  container: HTMLElement,
  categoryData: readonly CategoryCostSummary[],
  phaseData: readonly PhaseCostSummary[],
  config: Partial<BreakdownChartConfig> = {}
): void {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const { width, height, margin, currency, showByPhase } = cfg;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Select or create SVG
  let svg = d3.select(container).select<SVGSVGElement>('svg');

  if (svg.empty()) {
    svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('role', 'img')
      .attr('aria-label', 'Cost breakdown chart');

    svg.append('g').attr('class', 'chart-area');
  }

  svg.attr('width', width).attr('height', height);

  const chartArea = svg
    .select<SVGGElement>('.chart-area')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Prepare data based on view mode
  type DataItem = { name: string; value: number; percent: number; color: string };
  let data: DataItem[];

  if (showByPhase) {
    data = phaseData
      .filter((d) => d.totalCost > 0)
      .map((d) => ({
        name: PHASE_NAMES[d.phase],
        value: d.totalCost,
        percent: d.percentOfTotal,
        color: PHASE_COLORS[d.phase],
      }));
  } else {
    data = categoryData.map((d) => ({
      name: CATEGORY_NAMES[d.category],
      value: d.totalCost,
      percent: d.percentOfTotal,
      color: CATEGORY_COLORS[d.category],
    }));
  }

  // Sort by value descending
  data.sort((a, b) => b.value - a.value);

  // Limit to top 12 for readability
  if (data.length > 12) {
    const top11 = data.slice(0, 11);
    const others = data.slice(11);
    const otherTotal = others.reduce((sum, d) => sum + d.value, 0);
    const otherPercent = others.reduce((sum, d) => sum + d.percent, 0);
    data = [
      ...top11,
      { name: 'Other', value: otherTotal, percent: otherPercent, color: '#9ca3af' },
    ];
  }

  // Scales
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value) ?? 0])
    .nice()
    .range([0, innerWidth]);

  const yScale = d3
    .scaleBand<string>()
    .domain(data.map((d) => d.name))
    .range([0, innerHeight])
    .padding(0.2);

  // Bars
  const bars = chartArea.selectAll<SVGRectElement, DataItem>('.bar').data(data, (d) => d.name);

  // Enter
  bars
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('y', (d) => yScale(d.name) ?? 0)
    .attr('width', 0)
    .attr('height', yScale.bandwidth())
    .attr('fill', (d) => d.color)
    .attr('rx', 2)
    .attr('role', 'graphics-symbol')
    .attr('aria-label', (d) => `${d.name}: ${formatCurrency(d.value, currency)}`)
    .merge(bars)
    .transition()
    .duration(300)
    .attr('y', (d) => yScale(d.name) ?? 0)
    .attr('width', (d) => xScale(d.value))
    .attr('height', yScale.bandwidth())
    .attr('fill', (d) => d.color);

  // Exit
  bars.exit().transition().duration(200).attr('width', 0).remove();

  // Value labels
  const labels = chartArea
    .selectAll<SVGTextElement, DataItem>('.value-label')
    .data(data, (d) => d.name);

  labels
    .enter()
    .append('text')
    .attr('class', 'value-label')
    .attr('x', (d) => xScale(d.value) + 5)
    .attr('y', (d) => (yScale(d.name) ?? 0) + yScale.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('font-size', '11px')
    .attr('fill', '#374151')
    .merge(labels)
    .transition()
    .duration(300)
    .attr('x', (d) => xScale(d.value) + 5)
    .attr('y', (d) => (yScale(d.name) ?? 0) + yScale.bandwidth() / 2)
    .text((d) => `${formatCurrency(d.value, currency, { compact: true })} (${formatPercent(d.percent, 0)})`);

  labels.exit().remove();

  // Y Axis
  let yAxis = chartArea.select<SVGGElement>('.y-axis');
  if (yAxis.empty()) {
    yAxis = chartArea.append('g').attr('class', 'y-axis');
  }

  yAxis
    .transition()
    .duration(300)
    .call(d3.axisLeft(yScale).tickSize(0))
    .selectAll('text')
    .attr('font-size', '11px');

  yAxis.select('.domain').remove();

  // X Axis
  let xAxis = chartArea.select<SVGGElement>('.x-axis');
  if (xAxis.empty()) {
    xAxis = chartArea.append('g').attr('class', 'x-axis');
  }

  xAxis
    .attr('transform', `translate(0,${innerHeight})`)
    .transition()
    .duration(300)
    .call(
      d3
        .axisBottom(xScale)
        .ticks(5)
        .tickFormat((d) => formatCurrency(d as number, currency, { compact: true }))
    );
}

/**
 * Clear the chart
 */
export function clearBreakdownChart(container: HTMLElement): void {
  d3.select(container).select('svg').remove();
}
