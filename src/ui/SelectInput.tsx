/**
 * Mine Closure Costing - Select Input Component
 */

import { type ChangeEvent } from 'react';
import styles from './SelectInput.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectInputProps {
  label: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SelectInput({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: SelectInputProps): React.ReactElement {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <select
        className={styles.select}
        value={value}
        onChange={handleChange}
        disabled={disabled}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
