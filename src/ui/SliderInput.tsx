/**
 * Mine Closure Costing - Slider Input Component
 *
 * Combined slider and numeric input with validation, units, tooltips,
 * and visual progress indicators.
 */

import { useCallback, useState, useId, useMemo, type ChangeEvent } from 'react';
import { clamp } from '../utils/formatting';
import styles from './SliderInput.module.css';

export interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  tooltip?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
  /** Optional: show color-coded indicator based on value position */
  showIndicator?: boolean;
}

export function SliderInput({
  label,
  value,
  min,
  max,
  step,
  unit,
  tooltip,
  onChange,
  disabled = false,
  showIndicator = true,
}: SliderInputProps): React.ReactElement {
  const id = useId();
  // Use input text for editing, reset to value when not focused
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Display value depends on editing state
  const displayValue = isEditing ? editValue : value.toString();

  // Calculate percentage for visual indicator
  const percentage = useMemo(() => {
    return ((value - min) / (max - min)) * 100;
  }, [value, min, max]);

  // Determine indicator color based on percentage
  const indicatorColor = useMemo(() => {
    if (percentage < 33) return 'low';
    if (percentage < 66) return 'medium';
    return 'high';
  }, [percentage]);

  const handleSliderChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      setError(null);
      onChange(newValue);
    },
    [onChange]
  );

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  }, []);

  const handleInputFocus = useCallback(() => {
    setIsEditing(true);
    setEditValue(value.toString());
  }, [value]);

  const handleInputBlur = useCallback(() => {
    setIsEditing(false);
    const parsed = parseFloat(editValue);

    if (isNaN(parsed)) {
      setError('Invalid number');
      return;
    }

    if (parsed < min) {
      setError(`Minimum: ${min}`);
      onChange(min);
      return;
    }

    if (parsed > max) {
      setError(`Maximum: ${max}`);
      onChange(max);
      return;
    }

    setError(null);
    const clamped = clamp(parsed, min, max);
    onChange(clamped);
  }, [editValue, min, max, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleInputBlur();
      }
    },
    [handleInputBlur]
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <label htmlFor={id} className={styles.label}>
          {label}
          {tooltip && (
            <span
              className={styles.tooltipIcon}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              aria-label="More information"
            >
              ⓘ
              {showTooltip && <span className={styles.tooltipText}>{tooltip}</span>}
            </span>
          )}
        </label>
        <span className={styles.unit}>{unit}</span>
      </div>

      <div className={styles.controls}>
        <div className={styles.sliderWrapper}>
          <input
            type="range"
            id={id}
            className={styles.slider}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            disabled={disabled}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            style={{ '--slider-progress': `${percentage}%` } as React.CSSProperties}
          />
          {showIndicator && (
            <div 
              className={`${styles.progressBar} ${styles[indicatorColor]}`}
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>
        <input
          type="text"
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-label={`${label} value`}
        />
      </div>

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
