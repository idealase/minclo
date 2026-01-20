/**
 * Mine Closure Costing - Default Values
 *
 * Provides sensible default values for all inputs.
 * These are illustrative assumptions and should be adjusted for specific sites.
 */

import type {
  InputState,
  DirectWorksQuantities,
  UnitRates,
  IndirectCostRates,
  RiskFactors,
  FinancialParams,
  PhaseDurations,
  CurrencyConfig,
} from './types';
import { ClosurePhase } from './types';

/** Default currency configuration (AUD) */
export const DEFAULT_CURRENCY: CurrencyConfig = {
  symbol: '$',
  code: 'AUD',
  locale: 'en-AU',
};

/** Default direct works quantities */
export const DEFAULT_QUANTITIES: DirectWorksQuantities = {
  disturbedAreaHa: 500,
  tsfAreaHa: 100,
  tsfCoverThicknessM: 0.5,
  wrdFootprintHa: 200,
  wrdReshapingDepthM: 1.0,
  earthworksVolumeM3Override: null,
  topsoilThicknessM: 0.15,
  recontouringAreaHa: 300,
  roadLengthKm: 20,
  numberOfBuildings: 15,
  waterTreatmentFlowMLPerDay: 2,
  waterTreatmentDurationYears: 10,
  waterTreatmentIntensityFactor: 1.0,
  monitoringDurationYears: 15,
  monitoringIntensity: 'medium',
  hazardousMaterialsEnabled: false,
  hazardousMaterialsAreaHa: 0,
  communityHeritageEnabled: true,
};

/** Default unit rates (AUD, 2024 basis) */
export const DEFAULT_UNIT_RATES: UnitRates = {
  // Earthworks
  earthworksPerM3: 8,
  cappingBasePerM2: 25,
  cappingThicknessFactor: 1.5,
  topsoilPerM3: 15,

  // Revegetation
  revegetationPerHa: 8000,
  revegetationComplexityFactor: 1.0,

  // Demolition
  demolitionPerBuilding: 150000,

  // Roads
  roadRehabPerKm: 50000,

  // Water treatment
  waterTreatmentCapex: 5000000,
  waterTreatmentOpexPerML: 500,

  // Monitoring
  monitoringPerYearLow: 200000,
  monitoringPerYearMedium: 500000,
  monitoringPerYearHigh: 1000000,

  // Hazardous materials
  hazardousMaterialsPerHa: 100000,

  // Community/heritage
  communityHeritageLumpSum: 500000,

  // Other
  bulkingFactor: 1.2,
  erosionControlsPerHa: 3000,
  mobilisationLumpSum: 2000000,
};

/** Default indirect cost rates */
export const DEFAULT_INDIRECT_RATES: IndirectCostRates = {
  siteEstablishmentPercent: 12,
  contractorMarginPercent: 10,
  contingencyPercent: 15,
  ownersCostsPercent: 5,
};

/** Default risk factors (moderate risk) */
export const DEFAULT_RISK_FACTORS: RiskFactors = {
  contaminationUncertainty: 30,
  geotechUncertainty: 25,
  waterQualityUncertainty: 35,
  regulatoryUncertainty: 20,
  logisticsComplexity: 25,
};

/** Default financial parameters */
export const DEFAULT_FINANCIAL_PARAMS: FinancialParams = {
  closureStartYear: 2026,
  escalationRatePercent: 3.0,
  discountRatePercent: 7.0,
  discountRateMode: 'real',
};

/** Default phase durations (years) */
export const DEFAULT_PHASE_DURATIONS: PhaseDurations = {
  [ClosurePhase.PlanningApprovals]: 2,
  [ClosurePhase.DecommissioningDemolition]: 2,
  [ClosurePhase.EarthworksLandform]: 3,
  [ClosurePhase.TailingsWRDRehabilitation]: 3,
  [ClosurePhase.WaterManagement]: 10,
  [ClosurePhase.RevegetationEcosystem]: 3,
  [ClosurePhase.MonitoringMaintenance]: 15,
  [ClosurePhase.RelinquishmentPostClosure]: 2,
};

/** Complete default input state */
export const DEFAULT_INPUT_STATE: InputState = {
  quantities: DEFAULT_QUANTITIES,
  unitRates: DEFAULT_UNIT_RATES,
  indirectRates: DEFAULT_INDIRECT_RATES,
  riskFactors: DEFAULT_RISK_FACTORS,
  financialParams: DEFAULT_FINANCIAL_PARAMS,
  phaseDurations: DEFAULT_PHASE_DURATIONS,
  scenarioName: 'Default Scenario',
};

/**
 * Create a fresh copy of default input state
 */
export function createDefaultInputState(): InputState {
  return structuredClone(DEFAULT_INPUT_STATE);
}
