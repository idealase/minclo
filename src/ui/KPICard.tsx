/**
 * Mine Closure Costing - Animated KPI Card Component
 *
 * Enhanced KPI card with animated value transitions and visual feedback.
 */

import { useEffect, useRef, useState } from 'react';
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

// Animation duration in ms
const ANIMATION_DURATION = 600;
const EASING = (t: number): number => 1 - Math.pow(1 - t, 3); // easeOutCubic

export function KPICard({
  title,
  value,
  currency,
  subtitle,
  trend,
  compact = false,
}: KPICardProps): React.ReactElement {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [changeDirection, setChangeDirection] = useState<'increase' | 'decrease' | null>(null);
  const previousValue = useRef<number>(value);
  const animationFrame = useRef<number | undefined>(undefined);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip animation on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousValue.current = value;
      return;
    }

    // Skip if value hasn't changed
    if (previousValue.current === value) {
      return;
    }

    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();

    // Determine change direction for visual feedback
    const direction = endValue > startValue ? 'increase' : endValue < startValue ? 'decrease' : null;
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChangeDirection(direction);
    setIsAnimating(true);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      const easedProgress = EASING(progress);

      const currentValue = startValue + (endValue - startValue) * easedProgress;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        setIsAnimating(false);
        setChangeDirection(null);
        previousValue.current = endValue;
      }
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [value]);

  return (
    <div className={`${styles.card} ${isAnimating ? styles.animating : ''}`}>
      <div className={styles.title}>{title}</div>
      <div className={`${styles.value} ${isAnimating && changeDirection ? styles[changeDirection] : ''}`}>
        {formatCurrency(displayValue, currency, { compact })}
        {trend && (
          <span
            className={`${styles.trend} ${trend === 'up' ? styles.trendUp : trend === 'down' ? styles.trendDown : ''}`}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '–'}
          </span>
        )}
      </div>
      {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      
      {/* Animated pulse effect */}
      {isAnimating && <div className={styles.pulse} />}
    </div>
  );
}
