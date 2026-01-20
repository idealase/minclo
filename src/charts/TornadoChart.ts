/**
 * Mine Closure Costing - Tornado Chart (D3)
 *
 * Horizontal diverging bar chart for sensitivity analysis.
 * Shows impact of ±variation on total cost for each driver.
 */

import * as d3 from 'd3';
import type { CurrencyConfig, SensitivityResult } from '../domain/types';
import { formatCurrency } from '../utils/formatting';

export interface TornadoChartConfig {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  currency: CurrencyConfig;
  maxDrivers: number;
  showNPV: boolean;
}

const DEFAULT_CONFIG: TornadoChartConfig = {
  width: 650,
  height: 350,
  margin: { top: 40, right: 100, bottom: 40, left: 160 },
  currency: { symbol: '$', code: 'AUD', locale: 'en-AU' },
  maxDrivers: 8,
  showNPV: false,
};

/**
 * Render or update tornado chart
 */
export function renderTornadoChart(
  container: HTMLElement,
  data: readonly SensitivityResult[],
  baseTotalCost: number,
  config: Partial<TornadoChartConfig> = {}
): void {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const { width, height, margin, currency, maxDrivers, showNPV } = cfg;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Take top N drivers by impact
  const sortedData = [...data]
    .sort((a, b) => {
      const impactA = showNPV ? Math.abs(a.deltaNPV) : Math.abs(a.deltaCost);
      const impactB = showNPV ? Math.abs(b.deltaNPV) : Math.abs(b.deltaCost);
      return impactB - impactA;
    })
    .slice(0, maxDrivers);

  if (sortedData.length === 0) {
    d3.select(container).select('svg').remove();
    return;
  }

  // Calculate low/high deviations from base
  const chartData = sortedData.map((d) => {
    const baseValue = showNPV ? (d.lowNPV + d.highNPV) / 2 : baseTotalCost;
    return {
      name: d.driverName,
      low: showNPV ? d.lowNPV - baseValue : d.lowTotalCost - baseTotalCost,
      high: showNPV ? d.highNPV - baseValue : d.highTotalCost - baseTotalCost,
      lowLabel: formatCurrency(showNPV ? d.lowNPV : d.lowTotalCost, currency, { compact: true }),
      highLabel: formatCurrency(showNPV ? d.highNPV : d.highTotalCost, currency, { compact: true }),
    };
  });

  // Select or create SVG
  let svg = d3.select(container).select<SVGSVGElement>('svg');

  if (svg.empty()) {
    svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('role', 'img')
      .attr('aria-label', 'Sensitivity tornado chart');

    svg.append('g').attr('class', 'chart-area');
    svg.append('text').attr('class', 'title');
  }

  svg.attr('width', width).attr('height', height);

  const chartArea = svg
    .select<SVGGElement>('.chart-area')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Title
  svg
    .select<SVGTextElement>('.title')
    .attr('x', width / 2)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .attr('font-size', '14px')
    .attr('font-weight', '500')
    .attr('fill', '#374151')
    .text(`Sensitivity Analysis (±10% variation) - ${showNPV ? 'NPV Impact' : 'Cost Impact'}`);

  // Scales
  const maxDeviation = d3.max(chartData, (d) => Math.max(Math.abs(d.low), Math.abs(d.high))) ?? 0;

  const xScale = d3
    .scaleLinear()
    .domain([-maxDeviation * 1.1, maxDeviation * 1.1])
    .nice()
    .range([0, innerWidth]);

  const yScale = d3
    .scaleBand<string>()
    .domain(chartData.map((d) => d.name))
    .range([0, innerHeight])
    .padding(0.25);

  // Center line
  let centerLine = chartArea.select<SVGLineElement>('.center-line');
  if (centerLine.empty()) {
    centerLine = chartArea.append('line').attr('class', 'center-line');
  }

  centerLine
    .attr('x1', xScale(0))
    .attr('x2', xScale(0))
    .attr('y1', 0)
    .attr('y2', innerHeight)
    .attr('stroke', '#374151')
    .attr('stroke-width', 1);

  // Low bars (negative side - typically decrease from base)
  const lowBars = chartArea
    .selectAll<SVGRectElement, (typeof chartData)[0]>('.bar-low')
    .data(chartData, (d) => d.name);

  lowBars
    .enter()
    .append('rect')
    .attr('class', 'bar-low')
    .attr('y', (d) => yScale(d.name) ?? 0)
    .attr('height', yScale.bandwidth())
    .attr('x', xScale(0))
    .attr('width', 0)
    .attr('fill', '#22c55e')
    .attr('rx', 2)
    .merge(lowBars)
    .transition()
    .duration(300)
    .attr('y', (d) => yScale(d.name) ?? 0)
    .attr('height', yScale.bandwidth())
    .attr('x', (d) => (d.low < 0 ? xScale(d.low) : xScale(0)))
    .attr('width', (d) => Math.abs(xScale(d.low) - xScale(0)));

  lowBars.exit().transition().duration(200).attr('width', 0).remove();

  // High bars (positive side - typically increase from base)
  const highBars = chartArea
    .selectAll<SVGRectElement, (typeof chartData)[0]>('.bar-high')
    .data(chartData, (d) => d.name);

  highBars
    .enter()
    .append('rect')
    .attr('class', 'bar-high')
    .attr('y', (d) => yScale(d.name) ?? 0)
    .attr('height', yScale.bandwidth())
    .attr('x', xScale(0))
    .attr('width', 0)
    .attr('fill', '#ef4444')
    .attr('rx', 2)
    .merge(highBars)
    .transition()
    .duration(300)
    .attr('y', (d) => yScale(d.name) ?? 0)
    .attr('height', yScale.bandwidth())
    .attr('x', (d) => (d.high > 0 ? xScale(0) : xScale(d.high)))
    .attr('width', (d) => Math.abs(xScale(d.high) - xScale(0)));

  highBars.exit().transition().duration(200).attr('width', 0).remove();

  // Low value labels
  const lowLabels = chartArea
    .selectAll<SVGTextElement, (typeof chartData)[0]>('.label-low')
    .data(chartData, (d) => d.name);

  lowLabels
    .enter()
    .append('text')
    .attr('class', 'label-low')
    .attr('font-size', '10px')
    .attr('fill', '#374151')
    .attr('dy', '0.35em')
    .merge(lowLabels)
    .transition()
    .duration(300)
    .attr('x', (d) => xScale(Math.min(d.low, 0)) - 5)
    .attr('y', (d) => (yScale(d.name) ?? 0) + yScale.bandwidth() / 2)
    .attr('text-anchor', 'end')
    .text((d) => d.lowLabel);

  lowLabels.exit().remove();

  // High value labels
  const highLabels = chartArea
    .selectAll<SVGTextElement, (typeof chartData)[0]>('.label-high')
    .data(chartData, (d) => d.name);

  highLabels
    .enter()
    .append('text')
    .attr('class', 'label-high')
    .attr('font-size', '10px')
    .attr('fill', '#374151')
    .attr('dy', '0.35em')
    .merge(highLabels)
    .transition()
    .duration(300)
    .attr('x', (d) => xScale(Math.max(d.high, 0)) + 5)
    .attr('y', (d) => (yScale(d.name) ?? 0) + yScale.bandwidth() / 2)
    .attr('text-anchor', 'start')
    .text((d) => d.highLabel);

  highLabels.exit().remove();

  // Y Axis (driver names)
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
        .tickFormat((d) => {
          const val = d as number;
          if (val === 0) return 'Base';
          return formatCurrency(val, currency, { compact: true });
        })
    );

  xAxis.selectAll('text').attr('font-size', '10px');

  // Legend
  let legend = chartArea.select<SVGGElement>('.legend');
  if (legend.empty()) {
    legend = chartArea.append('g').attr('class', 'legend');
  }

  legend.attr('transform', `translate(${innerWidth - 100}, -25)`);

  const legendData = [
    { label: '-10%', color: '#22c55e' },
    { label: '+10%', color: '#ef4444' },
  ];

  const legendItems = legend
    .selectAll<SVGGElement, { label: string; color: string }>('.legend-item')
    .data(legendData);

  const enterLegend = legendItems.enter().append('g').attr('class', 'legend-item');

  enterLegend.append('rect').attr('width', 12).attr('height', 12).attr('rx', 2);
  enterLegend.append('text').attr('x', 16).attr('y', 10).attr('font-size', '10px');

  const mergedLegend = enterLegend.merge(legendItems);
  mergedLegend.attr('transform', (_, i) => `translate(${i * 55}, 0)`);
  mergedLegend.select('rect').attr('fill', (d) => d.color);
  mergedLegend.select('text').text((d) => d.label);

  legendItems.exit().remove();
}

/**
 * Clear the chart
 */
export function clearTornadoChart(container: HTMLElement): void {
  d3.select(container).select('svg').remove();
}
