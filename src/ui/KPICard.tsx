/**
 * Mine Closure Costing - KPI Card Component
 */

import type { CurrencyConfig } from '../domain/types';
import { formatCurrency } from '../utils/formatting';
import styles from './KPICard.module.css';

export interface KPICardProps {
  title: string;
  value: number;
  currency: CurrencyConfig;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  compact?: boolean;
}

export function KPICard({
  title,
  value,
  currency,
  subtitle,
  trend,
  compact = false,
}: KPICardProps): React.ReactElement {
  return (
    <div className={styles.card}>
      <div className={styles.title}>{title}</div>
      <div className={styles.value}>
        {formatCurrency(value, currency, { compact })}
        {trend && (
          <span
            className={`${styles.trend} ${trend === 'up' ? styles.trendUp : trend === 'down' ? styles.trendDown : ''}`}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '–'}
          </span>
        )}
      </div>
      {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
    </div>
  );
}
