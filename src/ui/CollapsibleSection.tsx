/**
 * Mine Closure Costing - Collapsible Section Component
 */

import { useState, type ReactNode } from 'react';
import styles from './CollapsibleSection.module.css';

export interface CollapsibleSectionProps {
  title: string;
  defaultExpanded?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({
  title,
  defaultExpanded = true,
  children,
}: CollapsibleSectionProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section className={styles.section}>
      <button
        className={styles.header}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className={styles.title}>{title}</span>
        <span className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && <div className={styles.content}>{children}</div>}
    </section>
  );
}
