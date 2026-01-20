/**
 * Mine Closure Costing - Toggle Switch Component
 */

import { useId } from 'react';
import styles from './ToggleSwitch.module.css';

export interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ToggleSwitch({
  label,
  checked,
  onChange,
  disabled = false,
}: ToggleSwitchProps): React.ReactElement {
  const id = useId();

  return (
    <div className={styles.container}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        className={`${styles.switch} ${checked ? styles.switchOn : ''}`}
        onClick={() => onChange(!checked)}
        disabled={disabled}
      >
        <span className={styles.thumb} />
      </button>
    </div>
  );
}
