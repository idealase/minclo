/**
 * Mine Closure Costing - Cashflow Chart (D3)
 *
 * Bar/line chart showing annual cashflows (nominal and discounted).
 * Uses D3 enter/update/exit pattern for efficient updates.
 */

import * as d3 from 'd3';
import type { CurrencyConfig, AnnualCashflow } from '../domain/types';
import { formatCurrency } from '../utils/formatting';

export interface CashflowChartConfig {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  currency: CurrencyConfig;
  showDiscounted: boolean;
  showCumulative: boolean;
}

const DEFAULT_CONFIG: CashflowChartConfig = {
  width: 700,
  height: 350,
  margin: { top: 30, right: 60, bottom: 50, left: 80 },
  currency: { symbol: '$', code: 'AUD', locale: 'en-AU' },
  showDiscounted: true,
  showCumulative: false,
};

/**
 * Render or update cashflow chart
 */
export function renderCashflowChart(
  container: HTMLElement,
  data: readonly AnnualCashflow[],
  config: Partial<CashflowChartConfig> = {}
): void {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const { width, height, margin, currency, showDiscounted, showCumulative } = cfg;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Filter out years with zero cost for cleaner display
  const filteredData = data.filter((d) => d.nominalCost > 0 || d.discountedCost > 0);

  if (filteredData.length === 0) {
    // Clear chart if no data
    d3.select(container).select('svg').remove();
    return;
  }

  // Select or create SVG
  let svg = d3.select(container).select<SVGSVGElement>('svg');

  if (svg.empty()) {
    svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('role', 'img')
      .attr('aria-label', 'Annual cashflow chart');

    const defs = svg.append('defs');

    // Gradient for bars
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'bar-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#1d4ed8');

    svg.append('g').attr('class', 'chart-area');
    svg.append('g').attr('class', 'legend');
  }

  svg.attr('width', width).attr('height', height);

  const chartArea = svg
    .select<SVGGElement>('.chart-area')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Determine which values to show
  const getValue = showCumulative
    ? (d: AnnualCashflow) => (showDiscounted ? d.cumulativeDiscounted : d.cumulativeNominal)
    : (d: AnnualCashflow) => (showDiscounted ? d.discountedCost : d.nominalCost);

  const getSecondaryValue = showCumulative
    ? (d: AnnualCashflow) => (showDiscounted ? d.cumulativeNominal : d.cumulativeDiscounted)
    : (d: AnnualCashflow) => (showDiscounted ? d.nominalCost : d.discountedCost);

  // Scales
  const xScale = d3
    .scaleBand<number>()
    .domain(filteredData.map((d) => d.year))
    .range([0, innerWidth])
    .padding(0.2);

  const maxValue = d3.max(filteredData, (d) => Math.max(getValue(d), getSecondaryValue(d))) ?? 0;

  const yScale = d3
    .scaleLinear()
    .domain([0, maxValue * 1.1])
    .nice()
    .range([innerHeight, 0]);

  // Grid lines
  let gridLines = chartArea.select<SVGGElement>('.grid-lines');
  if (gridLines.empty()) {
    gridLines = chartArea.append('g').attr('class', 'grid-lines');
  }

  const gridTicks = yScale.ticks(5);
  const grid = gridLines.selectAll<SVGLineElement, number>('.grid-line').data(gridTicks);

  grid
    .enter()
    .append('line')
    .attr('class', 'grid-line')
    .merge(grid)
    .attr('x1', 0)
    .attr('x2', innerWidth)
    .attr('y1', (d) => yScale(d))
    .attr('y2', (d) => yScale(d))
    .attr('stroke', '#e5e7eb')
    .attr('stroke-dasharray', '3,3');

  grid.exit().remove();

  // Bars (primary - typically discounted or based on current mode)
  const bars = chartArea
    .selectAll<SVGRectElement, AnnualCashflow>('.bar-primary')
    .data(filteredData, (d) => d.year);

  const barWidth = Math.min(xScale.bandwidth() * 0.45, 30);
  const barOffset = (xScale.bandwidth() - barWidth * 2 - 4) / 2;

  bars
    .enter()
    .append('rect')
    .attr('class', 'bar-primary')
    .attr('x', (d) => (xScale(d.year) ?? 0) + barOffset)
    .attr('y', innerHeight)
    .attr('width', barWidth)
    .attr('height', 0)
    .attr('fill', '#3b82f6')
    .attr('rx', 2)
    .merge(bars)
    .transition()
    .duration(300)
    .attr('x', (d) => (xScale(d.year) ?? 0) + barOffset)
    .attr('y', (d) => yScale(getValue(d)))
    .attr('width', barWidth)
    .attr('height', (d) => innerHeight - yScale(getValue(d)));

  bars.exit().transition().duration(200).attr('height', 0).attr('y', innerHeight).remove();

  // Bars (secondary - comparison)
  const barsSecondary = chartArea
    .selectAll<SVGRectElement, AnnualCashflow>('.bar-secondary')
    .data(filteredData, (d) => d.year);

  barsSecondary
    .enter()
    .append('rect')
    .attr('class', 'bar-secondary')
    .attr('x', (d) => (xScale(d.year) ?? 0) + barOffset + barWidth + 4)
    .attr('y', innerHeight)
    .attr('width', barWidth)
    .attr('height', 0)
    .attr('fill', '#94a3b8')
    .attr('rx', 2)
    .merge(barsSecondary)
    .transition()
    .duration(300)
    .attr('x', (d) => (xScale(d.year) ?? 0) + barOffset + barWidth + 4)
    .attr('y', (d) => yScale(getSecondaryValue(d)))
    .attr('width', barWidth)
    .attr('height', (d) => innerHeight - yScale(getSecondaryValue(d)));

  barsSecondary.exit().transition().duration(200).attr('height', 0).attr('y', innerHeight).remove();

  // X Axis
  let xAxis = chartArea.select<SVGGElement>('.x-axis');
  if (xAxis.empty()) {
    xAxis = chartArea.append('g').attr('class', 'x-axis');
  }

  // Show every nth year if too many
  const yearInterval = filteredData.length > 15 ? Math.ceil(filteredData.length / 10) : 1;
  const tickValues = filteredData
    .filter((_, i) => i % yearInterval === 0)
    .map((d) => d.year);

  xAxis
    .attr('transform', `translate(0,${innerHeight})`)
    .transition()
    .duration(300)
    .call(d3.axisBottom(xScale).tickValues(tickValues).tickFormat(d3.format('d')));

  xAxis.selectAll('text').attr('font-size', '11px');

  // Y Axis
  let yAxis = chartArea.select<SVGGElement>('.y-axis');
  if (yAxis.empty()) {
    yAxis = chartArea.append('g').attr('class', 'y-axis');
  }

  yAxis
    .transition()
    .duration(300)
    .call(
      d3
        .axisLeft(yScale)
        .ticks(5)
        .tickFormat((d) => formatCurrency(d as number, currency, { compact: true }))
    );

  yAxis.selectAll('text').attr('font-size', '11px');

  // Axis labels
  let xLabel = chartArea.select<SVGTextElement>('.x-label');
  if (xLabel.empty()) {
    xLabel = chartArea
      .append('text')
      .attr('class', 'x-label')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#6b7280');
  }
  xLabel.attr('x', innerWidth / 2).attr('y', innerHeight + 40).text('Year');

  let yLabel = chartArea.select<SVGTextElement>('.y-label');
  if (yLabel.empty()) {
    yLabel = chartArea
      .append('text')
      .attr('class', 'y-label')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#6b7280')
      .attr('transform', 'rotate(-90)');
  }
  yLabel
    .attr('x', -innerHeight / 2)
    .attr('y', -60)
    .text(showCumulative ? 'Cumulative Cost' : 'Annual Cost');

  // Legend
  const legendData = [
    { label: showDiscounted ? 'Discounted' : 'Nominal', color: '#3b82f6' },
    { label: showDiscounted ? 'Nominal' : 'Discounted', color: '#94a3b8' },
  ];

  const legend = svg
    .select<SVGGElement>('.legend')
    .attr('transform', `translate(${margin.left + 10}, ${margin.top - 10})`);

  const legendItems = legend
    .selectAll<SVGGElement, { label: string; color: string }>('.legend-item')
    .data(legendData);

  const enterItems = legendItems
    .enter()
    .append('g')
    .attr('class', 'legend-item');

  enterItems.append('rect').attr('width', 12).attr('height', 12).attr('rx', 2);

  enterItems.append('text').attr('x', 16).attr('y', 10).attr('font-size', '11px');

  const mergedItems = enterItems.merge(legendItems);

  mergedItems.attr('transform', (_, i) => `translate(${i * 100}, 0)`);

  mergedItems.select('rect').attr('fill', (d) => d.color);

  mergedItems.select('text').text((d) => d.label);

  legendItems.exit().remove();
}

/**
 * Clear the chart
 */
export function clearCashflowChart(container: HTMLElement): void {
  d3.select(container).select('svg').remove();
}
