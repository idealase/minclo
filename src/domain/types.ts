/**
 * Mine Closure Costing - Domain Types
 *
 * This module defines the core TypeScript types for the mine closure costing model.
 * All types are designed to be immutable and composable for functional computation.
 */

/** Currency configuration - default AUD but configurable */
export interface CurrencyConfig {
  readonly symbol: string;
  readonly code: string;
  readonly locale: string;
}

/** Closure phases with configurable durations */
export enum ClosurePhase {
  PlanningApprovals = 'planning_approvals',
  DecommissioningDemolition = 'decommissioning_demolition',
  EarthworksLandform = 'earthworks_landform',
  TailingsWRDRehabilitation = 'tailings_wrd_rehabilitation',
  WaterManagement = 'water_management',
  RevegetationEcosystem = 'revegetation_ecosystem',
  MonitoringMaintenance = 'monitoring_maintenance',
  RelinquishmentPostClosure = 'relinquishment_postclosure',
}

/** All closure phases in order */
export const CLOSURE_PHASES: readonly ClosurePhase[] = [
  ClosurePhase.PlanningApprovals,
  ClosurePhase.DecommissioningDemolition,
  ClosurePhase.EarthworksLandform,
  ClosurePhase.TailingsWRDRehabilitation,
  ClosurePhase.WaterManagement,
  ClosurePhase.RevegetationEcosystem,
  ClosurePhase.MonitoringMaintenance,
  ClosurePhase.RelinquishmentPostClosure,
] as const;

/** Human-readable phase names */
export const PHASE_NAMES: Record<ClosurePhase, string> = {
  [ClosurePhase.PlanningApprovals]: 'Planning & Approvals',
  [ClosurePhase.DecommissioningDemolition]: 'Decommissioning & Demolition',
  [ClosurePhase.EarthworksLandform]: 'Earthworks & Landform',
  [ClosurePhase.TailingsWRDRehabilitation]: 'Tailings/WRD Rehabilitation',
  [ClosurePhase.WaterManagement]: 'Water Management & Treatment',
  [ClosurePhase.RevegetationEcosystem]: 'Revegetation & Ecosystem',
  [ClosurePhase.MonitoringMaintenance]: 'Monitoring & Maintenance',
  [ClosurePhase.RelinquishmentPostClosure]: 'Relinquishment & Post-closure',
};

/** Cost categories for breakdown */
export enum CostCategory {
  Mobilisation = 'mobilisation',
  SiteEstablishment = 'site_establishment',
  Demolition = 'demolition',
  Earthworks = 'earthworks',
  TSFClosure = 'tsf_closure',
  WRDRehabilitation = 'wrd_rehabilitation',
  WaterTreatmentCapex = 'water_treatment_capex',
  WaterTreatmentOpex = 'water_treatment_opex',
  Revegetation = 'revegetation',
  ErosionControls = 'erosion_controls',
  RoadRehabilitation = 'road_rehabilitation',
  HazardousMaterials = 'hazardous_materials',
  Monitoring = 'monitoring',
  CommunityHeritage = 'community_heritage',
  Contingency = 'contingency',
  RiskUplift = 'risk_uplift',
  OwnersCosts = 'owners_costs',
  ContractorMargin = 'contractor_margin',
}

/** Human-readable category names */
export const CATEGORY_NAMES: Record<CostCategory, string> = {
  [CostCategory.Mobilisation]: 'Mobilisation/Demobilisation',
  [CostCategory.SiteEstablishment]: 'Site Establishment & HSE',
  [CostCategory.Demolition]: 'Demolition & Removal',
  [CostCategory.Earthworks]: 'Earthworks & Landform',
  [CostCategory.TSFClosure]: 'TSF Closure',
  [CostCategory.WRDRehabilitation]: 'WRD Rehabilitation',
  [CostCategory.WaterTreatmentCapex]: 'Water Treatment (Capex)',
  [CostCategory.WaterTreatmentOpex]: 'Water Treatment (Opex)',
  [CostCategory.Revegetation]: 'Revegetation',
  [CostCategory.ErosionControls]: 'Erosion & Sediment Controls',
  [CostCategory.RoadRehabilitation]: 'Road Rehabilitation',
  [CostCategory.HazardousMaterials]: 'Hazardous Materials',
  [CostCategory.Monitoring]: 'Monitoring',
  [CostCategory.CommunityHeritage]: 'Community & Heritage',
  [CostCategory.Contingency]: 'Contingency',
  [CostCategory.RiskUplift]: 'Risk Uplift',
  [CostCategory.OwnersCosts]: "Owner's Costs",
  [CostCategory.ContractorMargin]: 'Contractor Margin',
};

/** Monitoring intensity levels */
export type MonitoringIntensity = 'low' | 'medium' | 'high';

/** Discount rate mode */
export type DiscountRateMode = 'real' | 'nominal';

/** Phase duration configuration */
export interface PhaseDurations {
  readonly [ClosurePhase.PlanningApprovals]: number;
  readonly [ClosurePhase.DecommissioningDemolition]: number;
  readonly [ClosurePhase.EarthworksLandform]: number;
  readonly [ClosurePhase.TailingsWRDRehabilitation]: number;
  readonly [ClosurePhase.WaterManagement]: number;
  readonly [ClosurePhase.RevegetationEcosystem]: number;
  readonly [ClosurePhase.MonitoringMaintenance]: number;
  readonly [ClosurePhase.RelinquishmentPostClosure]: number;
}

/** Direct works quantities - primary user inputs */
export interface DirectWorksQuantities {
  /** Total disturbed area requiring rehabilitation (ha) */
  readonly disturbedAreaHa: number;

  /** Tailings Storage Facility area (ha) */
  readonly tsfAreaHa: number;

  /** TSF cover/cap thickness (m) */
  readonly tsfCoverThicknessM: number;

  /** Waste Rock Dump footprint area (ha) */
  readonly wrdFootprintHa: number;

  /** WRD average reshaping depth (m) */
  readonly wrdReshapingDepthM: number;

  /** Optional: explicit earthworks volume override (m³) */
  readonly earthworksVolumeM3Override: number | null;

  /** Topsoil placement thickness (m) */
  readonly topsoilThicknessM: number;

  /** Recontouring/capping area (ha) */
  readonly recontouringAreaHa: number;

  /** Road length requiring rehabilitation (km) */
  readonly roadLengthKm: number;

  /** Number of buildings/structures for demolition */
  readonly numberOfBuildings: number;

  /** Water treatment required flow (ML/day) */
  readonly waterTreatmentFlowMLPerDay: number;

  /** Water treatment duration (years) */
  readonly waterTreatmentDurationYears: number;

  /** Water treatment intensity factor (0.5 = simple, 1.0 = standard, 2.0 = complex) */
  readonly waterTreatmentIntensityFactor: number;

  /** Monitoring duration (years) */
  readonly monitoringDurationYears: number;

  /** Monitoring intensity */
  readonly monitoringIntensity: MonitoringIntensity;

  /** Enable hazardous materials handling */
  readonly hazardousMaterialsEnabled: boolean;

  /** Hazardous materials area (ha) - if enabled */
  readonly hazardousMaterialsAreaHa: number;

  /** Enable community/heritage management costs */
  readonly communityHeritageEnabled: boolean;
}

/** Unit rates - editable with defaults */
export interface UnitRates {
  /** Earthworks rate ($/m³) */
  readonly earthworksPerM3: number;

  /** Base capping rate ($/m²) */
  readonly cappingBasePerM2: number;

  /** Capping thickness factor - multiplier per meter of thickness */
  readonly cappingThicknessFactor: number;

  /** Topsoil placement rate ($/m³) */
  readonly topsoilPerM3: number;

  /** Revegetation rate ($/ha) */
  readonly revegetationPerHa: number;

  /** Revegetation complexity/aridity factor (0.8 = easy, 1.0 = standard, 1.5 = difficult) */
  readonly revegetationComplexityFactor: number;

  /** Demolition rate ($/building) */
  readonly demolitionPerBuilding: number;

  /** Road rehabilitation rate ($/km) */
  readonly roadRehabPerKm: number;

  /** Water treatment capex ($) - base plant cost */
  readonly waterTreatmentCapex: number;

  /** Water treatment opex ($/ML) */
  readonly waterTreatmentOpexPerML: number;

  /** Monitoring rate ($/year) - by intensity */
  readonly monitoringPerYearLow: number;
  readonly monitoringPerYearMedium: number;
  readonly monitoringPerYearHigh: number;

  /** Hazardous materials handling ($/ha) */
  readonly hazardousMaterialsPerHa: number;

  /** Community/heritage management ($ lump sum) */
  readonly communityHeritageLumpSum: number;

  /** Bulking factor for earthworks volume calculation */
  readonly bulkingFactor: number;

  /** Erosion controls ($/ha of disturbed area) */
  readonly erosionControlsPerHa: number;

  /** Mobilisation/demobilisation ($ lump sum) */
  readonly mobilisationLumpSum: number;
}

/** Indirect cost percentages */
export interface IndirectCostRates {
  /** Site establishment / project management (% of direct works) */
  readonly siteEstablishmentPercent: number;

  /** Contractor margin (% of direct + PM) */
  readonly contractorMarginPercent: number;

  /** Base contingency (%) */
  readonly contingencyPercent: number;

  /** Owner's costs (% of total) */
  readonly ownersCostsPercent: number;
}

/** Risk factors for risk-based uplift calculation */
export interface RiskFactors {
  /** Legacy contamination uncertainty (0-100) */
  readonly contaminationUncertainty: number;

  /** Geotechnical stability uncertainty (0-100) */
  readonly geotechUncertainty: number;

  /** Water quality uncertainty (0-100) */
  readonly waterQualityUncertainty: number;

  /** Regulatory uncertainty (0-100) */
  readonly regulatoryUncertainty: number;

  /** Remote logistics complexity (0-100) */
  readonly logisticsComplexity: number;
}

/** Financial parameters */
export interface FinancialParams {
  /** Closure start year */
  readonly closureStartYear: number;

  /** Annual escalation rate (% - nominal) */
  readonly escalationRatePercent: number;

  /** Discount rate (%) */
  readonly discountRatePercent: number;

  /** Discount rate mode - real or nominal */
  readonly discountRateMode: DiscountRateMode;
}

/** Complete input state */
export interface InputState {
  readonly quantities: DirectWorksQuantities;
  readonly unitRates: UnitRates;
  readonly indirectRates: IndirectCostRates;
  readonly riskFactors: RiskFactors;
  readonly financialParams: FinancialParams;
  readonly phaseDurations: PhaseDurations;
  readonly scenarioName: string;
}

/** Derived quantities calculated from inputs */
export interface DerivedQuantities {
  /** TSF area in m² */
  readonly tsfAreaM2: number;

  /** WRD area in m² */
  readonly wrdAreaM2: number;

  /** TSF capping volume (m³) */
  readonly tsfCappingVolumeM3: number;

  /** WRD earthworks volume (m³) */
  readonly wrdEarthworksVolumeM3: number;

  /** Total earthworks volume (m³) */
  readonly totalEarthworksVolumeM3: number;

  /** Topsoil volume (m³) */
  readonly topsoilVolumeM3: number;

  /** Disturbed area in m² */
  readonly disturbedAreaM2: number;

  /** Recontouring area in m² */
  readonly recontouringAreaM2: number;

  /** Total water treatment volume (ML) */
  readonly totalWaterTreatmentML: number;

  /** Risk score (0-100) */
  readonly riskScore: number;

  /** Risk uplift percentage */
  readonly riskUpliftPercent: number;
}

/** Individual line item cost */
export interface LineItemCost {
  readonly category: CostCategory;
  readonly description: string;
  readonly quantity: number;
  readonly unit: string;
  readonly unitRate: number;
  readonly subtotal: number;
  readonly phase: ClosurePhase;
}

/** Annual cashflow entry */
export interface AnnualCashflow {
  readonly year: number;
  readonly nominalCost: number;
  readonly escalatedCost: number;
  readonly discountedCost: number;
  readonly cumulativeNominal: number;
  readonly cumulativeDiscounted: number;
  readonly phaseBreakdown: Record<ClosurePhase, number>;
}

/** Sensitivity analysis result for a single driver */
export interface SensitivityResult {
  readonly driverName: string;
  readonly driverKey: string;
  readonly baseValue: number;
  readonly unit: string;
  readonly lowValue: number;
  readonly highValue: number;
  readonly lowTotalCost: number;
  readonly highTotalCost: number;
  readonly lowNPV: number;
  readonly highNPV: number;
  readonly deltaCost: number;
  readonly deltaNPV: number;
}

/** Phase cost summary */
export interface PhaseCostSummary {
  readonly phase: ClosurePhase;
  readonly totalCost: number;
  readonly percentOfTotal: number;
}

/** Category cost summary */
export interface CategoryCostSummary {
  readonly category: CostCategory;
  readonly totalCost: number;
  readonly percentOfTotal: number;
}

/** Complete calculation results */
export interface Results {
  /** Derived quantities from inputs */
  readonly derivedQuantities: DerivedQuantities;

  /** All line item costs */
  readonly lineItems: readonly LineItemCost[];

  /** Total direct works cost */
  readonly directWorksCost: number;

  /** Total indirect costs */
  readonly indirectCosts: number;

  /** Total nominal cost (undiscounted) */
  readonly totalNominalCost: number;

  /** Total discounted cost (NPV) */
  readonly totalDiscountedCost: number;

  /** Peak annual cashflow */
  readonly peakAnnualCashflow: number;

  /** Year of peak cashflow */
  readonly peakCashflowYear: number;

  /** Annual cashflow profile */
  readonly annualCashflows: readonly AnnualCashflow[];

  /** Cost breakdown by phase */
  readonly phaseBreakdown: readonly PhaseCostSummary[];

  /** Cost breakdown by category */
  readonly categoryBreakdown: readonly CategoryCostSummary[];

  /** Sensitivity analysis results */
  readonly sensitivityResults: readonly SensitivityResult[];

  /** Monitoring cost share of total */
  readonly monitoringCostShare: number;

  /** Total project duration (years) */
  readonly totalDurationYears: number;
}

/** Scenario preset definition */
export interface ScenarioPreset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly inputs: InputState;
}

/** Saved scenario in localStorage */
export interface SavedScenario {
  readonly id: string;
  readonly name: string;
  readonly savedAt: string;
  readonly inputs: InputState;
}

/** App state including UI state */
export interface AppState {
  readonly inputs: InputState;
  readonly results: Results | null;
  readonly isCalculating: boolean;
  readonly savedScenarios: readonly SavedScenario[];
  readonly selectedPresetId: string | null;
  readonly currency: CurrencyConfig;
}

/** Input field metadata for UI generation */
export interface InputFieldMeta {
  readonly key: string;
  readonly label: string;
  readonly unit: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly defaultValue: number;
  readonly tooltip: string;
  readonly group: string;
}
