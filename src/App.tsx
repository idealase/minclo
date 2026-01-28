/**
 * Mine Closure Costing - Main Application Component
 */

import { AppProvider } from './state';
import { ThemeProvider } from './state/ThemeContext';
import { InputPanel, OutputPanel } from './components';
import { ThemeToggle } from './ui/ThemeToggle';
import styles from './App.module.css';

function AppContent(): React.ReactElement {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Mine Closure Cost Estimator</h1>
          <p className={styles.subtitle}>
            Parametric cost estimation tool for mine rehabilitation planning
          </p>
        </div>
        <div className={styles.headerLinks}>
          <a href="#method" className={styles.headerLink} onClick={(e) => {
            e.preventDefault();
            document.getElementById('method-section')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            Method
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.headerLink}
          >
            GitHub
          </a>
          <ThemeToggle />
        </div>
      </header>

      <div className={styles.disclaimer}>
        <strong>Disclaimer:</strong> This tool provides illustrative cost estimates for planning
        purposes only. Actual closure costs may vary significantly based on site-specific
        conditions. This is not compliance advice – consult qualified professionals for detailed
        assessments. All rates and assumptions are defaults and should be validated for your
        specific context.
      </div>

      <main className={styles.main}>
        <div className={styles.inputColumn}>
          <InputPanel />
        </div>
        <div className={styles.outputColumn}>
          <OutputPanel />
        </div>
      </main>

      <section id="method-section" className={styles.methodSection}>
        <h2 className={styles.methodTitle}>Methodology Overview</h2>
        <div className={styles.methodContent}>
          <div className={styles.methodColumn}>
            <h3>Cost Categories</h3>
            <p>
              The estimator calculates costs across major closure activities including
              mobilisation, demolition, earthworks, TSF/WRD rehabilitation, water treatment,
              revegetation, monitoring, and various indirect costs.
            </p>
            <h3>Direct Works</h3>
            <p>
              Direct costs are calculated using unit-rate methodology: quantities (areas, volumes,
              counts) multiplied by applicable rates. Key inputs include disturbed area, TSF/WRD
              footprints, infrastructure counts, and water treatment requirements.
            </p>
          </div>
          <div className={styles.methodColumn}>
            <h3>Indirect Costs</h3>
            <p>
              Indirect costs include site establishment (% of direct), contractor margins,
              contingency, risk-based uplift (calculated from weighted risk factors), and owner's
              costs. These are applied as percentages of subtotals.
            </p>
            <h3>Scheduling & NPV</h3>
            <p>
              Costs are allocated to closure phases with configurable durations. Annual cashflows
              are calculated with escalation applied, then discounted to present value using the
              specified discount rate. Both real and nominal discount modes are supported.
            </p>
          </div>
          <div className={styles.methodColumn}>
            <h3>Risk Uplift</h3>
            <p>
              Risk score is calculated from five factors (contamination, geotech, water quality,
              regulatory, logistics) with weighted averaging. The score maps to an uplift
              percentage via a piecewise linear function (0-50% uplift for scores 0-100).
            </p>
            <h3>Sensitivity Analysis</h3>
            <p>
              One-at-a-time sensitivity analysis applies ±10% variation to key drivers and measures
              impact on total cost and NPV. Results are displayed as a tornado chart showing the
              most influential parameters.
            </p>
          </div>
        </div>
        <p className={styles.methodNote}>
          For detailed methodology documentation, see the{' '}
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            MODEL_METHOD.md
          </a>{' '}
          file in the repository.
        </p>
      </section>

      <footer className={styles.footer}>
        <p>
          Mine Closure Cost Estimator • Built with TypeScript, React, and D3 •{' '}
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            View Source
          </a>
        </p>
        <p className={styles.footerDisclaimer}>
          This tool is provided as-is for planning purposes. No warranty or guarantee of accuracy.
          Not intended as professional or legal advice.
        </p>
      </footer>
    </div>
  );
}

function App(): React.ReactElement {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
