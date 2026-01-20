/**
 * Mine Closure Costing - Formatting Utilities
 *
 * Consistent formatting for currency, numbers, and units.
 */

import type { CurrencyConfig } from '../domain/types';

/**
 * Format currency value
 */
export function formatCurrency(
  value: number,
  config: CurrencyConfig,
  options?: { compact?: boolean; decimals?: number }
): string {
  const { compact = false, decimals } = options ?? {};

  if (compact && Math.abs(value) >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${config.symbol}${millions.toFixed(1)}M`;
  }

  if (compact && Math.abs(value) >= 1_000) {
    const thousands = value / 1_000;
    return `${config.symbol}${thousands.toFixed(0)}K`;
  }

  const formatter = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 0,
  });

  return formatter.format(value);
}

/**
 * Format number with thousands separators
 */
export function formatNumber(
  value: number,
  options?: { decimals?: number; locale?: string }
): string {
  const { decimals = 0, locale = 'en-AU' } = options ?? {};

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format area in hectares
 */
export function formatArea(ha: number): string {
  return `${formatNumber(ha, { decimals: 1 })} ha`;
}

/**
 * Format volume in cubic meters
 */
export function formatVolume(m3: number): string {
  if (m3 >= 1_000_000) {
    return `${formatNumber(m3 / 1_000_000, { decimals: 2 })} Mm³`;
  }
  return `${formatNumber(m3, { decimals: 0 })} m³`;
}

/**
 * Format distance in kilometers
 */
export function formatDistance(km: number): string {
  return `${formatNumber(km, { decimals: 1 })} km`;
}

/**
 * Format duration in years
 */
export function formatDuration(years: number): string {
  if (years === 1) return '1 year';
  return `${years} years`;
}

/**
 * Format rate with unit
 */
export function formatRate(value: number, unit: string, config: CurrencyConfig): string {
  return `${config.symbol}${formatNumber(value)}/${unit}`;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return structuredClone(obj);
}
