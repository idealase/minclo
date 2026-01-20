/**
 * Mine Closure Costing - Validation Schema
 *
 * Runtime validation using Zod for all user inputs.
 * Ensures data integrity and provides friendly error messages.
 */

import { z } from 'zod';
import { ClosurePhase } from './types';

/** Positive number schema */
const positiveNumber = z.number().min(0, 'Must be non-negative');

/** Percentage schema (0-100) */
const percentage = z.number().min(0).max(100, 'Must be between 0 and 100');

/** Risk factor schema (0-100) */
const riskFactor = z.number().min(0).max(100, 'Must be between 0 and 100');

/** Monitoring intensity schema */
const monitoringIntensity = z.enum(['low', 'medium', 'high']);

/** Discount rate mode schema */
const discountRateMode = z.enum(['real', 'nominal']);

/** Direct works quantities schema */
export const DirectWorksQuantitiesSchema = z.object({
  disturbedAreaHa: positiveNumber.max(100000, 'Maximum 100,000 ha'),
  tsfAreaHa: positiveNumber.max(10000, 'Maximum 10,000 ha'),
  tsfCoverThicknessM: positiveNumber.max(5, 'Maximum 5m thickness'),
  wrdFootprintHa: positiveNumber.max(50000, 'Maximum 50,000 ha'),
  wrdReshapingDepthM: positiveNumber.max(20, 'Maximum 20m depth'),
  earthworksVolumeM3Override: z.number().nullable(),
  topsoilThicknessM: positiveNumber.max(2, 'Maximum 2m thickness'),
  recontouringAreaHa: positiveNumber.max(100000, 'Maximum 100,000 ha'),
  roadLengthKm: positiveNumber.max(500, 'Maximum 500 km'),
  numberOfBuildings: z.number().int().min(0).max(500, 'Maximum 500 buildings'),
  waterTreatmentFlowMLPerDay: positiveNumber.max(100, 'Maximum 100 ML/day'),
  waterTreatmentDurationYears: positiveNumber.max(100, 'Maximum 100 years'),
  waterTreatmentIntensityFactor: z.number().min(0.5).max(3, 'Factor between 0.5 and 3'),
  monitoringDurationYears: z.number().int().min(1).max(100, 'Between 1 and 100 years'),
  monitoringIntensity: monitoringIntensity,
  hazardousMaterialsEnabled: z.boolean(),
  hazardousMaterialsAreaHa: positiveNumber.max(1000, 'Maximum 1,000 ha'),
  communityHeritageEnabled: z.boolean(),
});

/** Unit rates schema */
export const UnitRatesSchema = z.object({
  earthworksPerM3: positiveNumber.max(100, 'Maximum $100/m³'),
  cappingBasePerM2: positiveNumber.max(500, 'Maximum $500/m²'),
  cappingThicknessFactor: z.number().min(0.5).max(3, 'Factor between 0.5 and 3'),
  topsoilPerM3: positiveNumber.max(100, 'Maximum $100/m³'),
  revegetationPerHa: positiveNumber.max(100000, 'Maximum $100,000/ha'),
  revegetationComplexityFactor: z.number().min(0.5).max(3, 'Factor between 0.5 and 3'),
  demolitionPerBuilding: positiveNumber.max(5000000, 'Maximum $5M/building'),
  roadRehabPerKm: positiveNumber.max(1000000, 'Maximum $1M/km'),
  waterTreatmentCapex: positiveNumber.max(500000000, 'Maximum $500M'),
  waterTreatmentOpexPerML: positiveNumber.max(10000, 'Maximum $10,000/ML'),
  monitoringPerYearLow: positiveNumber.max(5000000, 'Maximum $5M/year'),
  monitoringPerYearMedium: positiveNumber.max(10000000, 'Maximum $10M/year'),
  monitoringPerYearHigh: positiveNumber.max(20000000, 'Maximum $20M/year'),
  hazardousMaterialsPerHa: positiveNumber.max(1000000, 'Maximum $1M/ha'),
  communityHeritageLumpSum: positiveNumber.max(50000000, 'Maximum $50M'),
  bulkingFactor: z.number().min(1).max(2, 'Factor between 1.0 and 2.0'),
  erosionControlsPerHa: positiveNumber.max(50000, 'Maximum $50,000/ha'),
  mobilisationLumpSum: positiveNumber.max(50000000, 'Maximum $50M'),
});

/** Indirect cost rates schema */
export const IndirectCostRatesSchema = z.object({
  siteEstablishmentPercent: percentage,
  contractorMarginPercent: percentage,
  contingencyPercent: percentage,
  ownersCostsPercent: percentage,
});

/** Risk factors schema */
export const RiskFactorsSchema = z.object({
  contaminationUncertainty: riskFactor,
  geotechUncertainty: riskFactor,
  waterQualityUncertainty: riskFactor,
  regulatoryUncertainty: riskFactor,
  logisticsComplexity: riskFactor,
});

/** Financial parameters schema */
export const FinancialParamsSchema = z.object({
  closureStartYear: z.number().int().min(2020).max(2100, 'Year between 2020 and 2100'),
  escalationRatePercent: z.number().min(0).max(20, 'Maximum 20%'),
  discountRatePercent: z.number().min(0).max(30, 'Maximum 30%'),
  discountRateMode: discountRateMode,
});

/** Phase durations schema */
export const PhaseDurationsSchema = z.object({
  [ClosurePhase.PlanningApprovals]: z.number().int().min(0).max(10),
  [ClosurePhase.DecommissioningDemolition]: z.number().int().min(0).max(10),
  [ClosurePhase.EarthworksLandform]: z.number().int().min(0).max(20),
  [ClosurePhase.TailingsWRDRehabilitation]: z.number().int().min(0).max(20),
  [ClosurePhase.WaterManagement]: z.number().int().min(0).max(50),
  [ClosurePhase.RevegetationEcosystem]: z.number().int().min(0).max(20),
  [ClosurePhase.MonitoringMaintenance]: z.number().int().min(0).max(100),
  [ClosurePhase.RelinquishmentPostClosure]: z.number().int().min(0).max(10),
});

/** Complete input state schema */
export const InputStateSchema = z.object({
  quantities: DirectWorksQuantitiesSchema,
  unitRates: UnitRatesSchema,
  indirectRates: IndirectCostRatesSchema,
  riskFactors: RiskFactorsSchema,
  financialParams: FinancialParamsSchema,
  phaseDurations: PhaseDurationsSchema,
  scenarioName: z.string().min(1).max(100),
});

/** Type inference from schemas */
export type ValidatedDirectWorksQuantities = z.infer<typeof DirectWorksQuantitiesSchema>;
export type ValidatedUnitRates = z.infer<typeof UnitRatesSchema>;
export type ValidatedIndirectCostRates = z.infer<typeof IndirectCostRatesSchema>;
export type ValidatedRiskFactors = z.infer<typeof RiskFactorsSchema>;
export type ValidatedFinancialParams = z.infer<typeof FinancialParamsSchema>;
export type ValidatedPhaseDurations = z.infer<typeof PhaseDurationsSchema>;
export type ValidatedInputState = z.infer<typeof InputStateSchema>;

/**
 * Validate input state with detailed error messages
 */
export function validateInputState(
  input: unknown
): { success: true; data: ValidatedInputState } | { success: false; errors: string[] } {
  const result = InputStateSchema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map((issue) => {
    const path = issue.path.join('.');
    return `${path}: ${issue.message}`;
  });

  return { success: false, errors };
}

/**
 * Validate a single field value
 */
export function validateField(
  schema: z.ZodSchema,
  value: unknown
): { valid: true; value: unknown } | { valid: false; error: string } {
  const result = schema.safeParse(value);

  if (result.success) {
    return { valid: true, value: result.data };
  }

  return { valid: false, error: result.error.issues[0]?.message ?? 'Invalid value' };
}
