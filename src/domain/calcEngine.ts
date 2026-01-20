/**
 * Mine Closure Costing - Calculation Engine
 *
 * This module implements the deterministic, side-effect-free calculation engine
 * for mine closure cost estimation. All functions are pure and composable.
 *
 * @module calcEngine
 */

import type {
  InputState,
  DerivedQuantities,
  LineItemCost,
  AnnualCashflow,
  Results,
  PhaseCostSummary,
  CategoryCostSummary,
  SensitivityResult,
  RiskFactors,
  PhaseDurations,
  MonitoringIntensity,
} from './types';
import { ClosurePhase, CostCategory, CLOSURE_PHASES } from './types';

// ============================================================================
// Unit Conversions
// ============================================================================

/**
 * Convert hectares to square meters
 * @param ha - Area in hectares
 * @returns Area in square meters
 */
export function haToM2(ha: number): number {
  return ha * 10000;
}

/**
 * Convert square meters to hectares
 * @param m2 - Area in square meters
 * @returns Area in hectares
 */
export function m2ToHa(m2: number): number {
  return m2 / 10000;
}

// ============================================================================
// Derived Quantities Calculation
// ============================================================================

/**
 * Calculate risk score from individual risk factors.
 * Uses weighted average with equal weights.
 *
 * @param factors - Risk factor values (0-100 each)
 * @returns Composite risk score (0-100)
 */
export function calculateRiskScore(factors: RiskFactors): number {
  const weights = {
    contaminationUncertainty: 0.25,
    geotechUncertainty: 0.2,
    waterQualityUncertainty: 0.25,
    regulatoryUncertainty: 0.15,
    logisticsComplexity: 0.15,
  };

  const score =
    factors.contaminationUncertainty * weights.contaminationUncertainty +
    factors.geotechUncertainty * weights.geotechUncertainty +
    factors.waterQualityUncertainty * weights.waterQualityUncertainty +
    factors.regulatoryUncertainty * weights.regulatoryUncertainty +
    factors.logisticsComplexity * weights.logisticsComplexity;

  return Math.round(score * 10) / 10;
}

/**
 * Convert risk score to uplift percentage using piecewise linear function.
 *
 * Risk Score → Uplift:
 *   0-20:  0-5%
 *  20-40:  5-10%
 *  40-60: 10-20%
 *  60-80: 20-35%
 * 80-100: 35-50%
 *
 * @param riskScore - Composite risk score (0-100)
 * @returns Risk uplift percentage
 */
export function riskScoreToUplift(riskScore: number): number {
  if (riskScore <= 20) {
    return (riskScore / 20) * 5;
  } else if (riskScore <= 40) {
    return 5 + ((riskScore - 20) / 20) * 5;
  } else if (riskScore <= 60) {
    return 10 + ((riskScore - 40) / 20) * 10;
  } else if (riskScore <= 80) {
    return 20 + ((riskScore - 60) / 20) * 15;
  } else {
    return 35 + ((riskScore - 80) / 20) * 15;
  }
}

/**
 * Calculate all derived quantities from user inputs.
 *
 * @param inputs - Complete input state
 * @returns Derived quantities
 */
export function calculateDerivedQuantities(inputs: InputState): DerivedQuantities {
  const { quantities, unitRates, riskFactors } = inputs;

  // Area conversions
  const tsfAreaM2 = haToM2(quantities.tsfAreaHa);
  const wrdAreaM2 = haToM2(quantities.wrdFootprintHa);
  const disturbedAreaM2 = haToM2(quantities.disturbedAreaHa);
  const recontouringAreaM2 = haToM2(quantities.recontouringAreaHa);

  // Volume calculations
  const tsfCappingVolumeM3 = tsfAreaM2 * quantities.tsfCoverThicknessM;
  const wrdEarthworksVolumeM3 = wrdAreaM2 * quantities.wrdReshapingDepthM * unitRates.bulkingFactor;

  // Total earthworks: use override if provided, otherwise sum components
  const totalEarthworksVolumeM3 =
    quantities.earthworksVolumeM3Override !== null
      ? quantities.earthworksVolumeM3Override
      : tsfCappingVolumeM3 + wrdEarthworksVolumeM3;

  // Topsoil volume
  const topsoilVolumeM3 = disturbedAreaM2 * quantities.topsoilThicknessM;

  // Water treatment
  const totalWaterTreatmentML =
    quantities.waterTreatmentFlowMLPerDay * 365 * quantities.waterTreatmentDurationYears;

  // Risk calculations
  const riskScore = calculateRiskScore(riskFactors);
  const riskUpliftPercent = riskScoreToUplift(riskScore);

  return {
    tsfAreaM2,
    wrdAreaM2,
    tsfCappingVolumeM3,
    wrdEarthworksVolumeM3,
    totalEarthworksVolumeM3,
    topsoilVolumeM3,
    disturbedAreaM2,
    recontouringAreaM2,
    totalWaterTreatmentML,
    riskScore,
    riskUpliftPercent,
  };
}

// ============================================================================
// Line Item Cost Calculation
// ============================================================================

/**
 * Get monitoring rate based on intensity level.
 */
function getMonitoringRate(
  intensity: MonitoringIntensity,
  rates: { low: number; medium: number; high: number }
): number {
  switch (intensity) {
    case 'low':
      return rates.low;
    case 'medium':
      return rates.medium;
    case 'high':
      return rates.high;
  }
}

/**
 * Calculate all direct works line item costs.
 *
 * @param inputs - Complete input state
 * @param derived - Derived quantities
 * @returns Array of line item costs
 */
export function calculateDirectWorksCosts(
  inputs: InputState,
  derived: DerivedQuantities
): LineItemCost[] {
  const { quantities, unitRates } = inputs;
  const items: LineItemCost[] = [];

  // Mobilisation/Demobilisation
  items.push({
    category: CostCategory.Mobilisation,
    description: 'Site mobilisation and demobilisation',
    quantity: 1,
    unit: 'lump sum',
    unitRate: unitRates.mobilisationLumpSum,
    subtotal: unitRates.mobilisationLumpSum,
    phase: ClosurePhase.DecommissioningDemolition,
  });

  // Demolition
  if (quantities.numberOfBuildings > 0) {
    items.push({
      category: CostCategory.Demolition,
      description: 'Building and structure demolition',
      quantity: quantities.numberOfBuildings,
      unit: 'buildings',
      unitRate: unitRates.demolitionPerBuilding,
      subtotal: quantities.numberOfBuildings * unitRates.demolitionPerBuilding,
      phase: ClosurePhase.DecommissioningDemolition,
    });
  }

  // Earthworks
  if (derived.totalEarthworksVolumeM3 > 0) {
    items.push({
      category: CostCategory.Earthworks,
      description: 'General earthworks (recontouring, reshaping)',
      quantity: derived.totalEarthworksVolumeM3,
      unit: 'm³',
      unitRate: unitRates.earthworksPerM3,
      subtotal: derived.totalEarthworksVolumeM3 * unitRates.earthworksPerM3,
      phase: ClosurePhase.EarthworksLandform,
    });
  }

  // Topsoil placement
  if (derived.topsoilVolumeM3 > 0) {
    items.push({
      category: CostCategory.Earthworks,
      description: 'Topsoil placement',
      quantity: derived.topsoilVolumeM3,
      unit: 'm³',
      unitRate: unitRates.topsoilPerM3,
      subtotal: derived.topsoilVolumeM3 * unitRates.topsoilPerM3,
      phase: ClosurePhase.EarthworksLandform,
    });
  }

  // TSF Closure (capping)
  if (quantities.tsfAreaHa > 0) {
    const cappingCostPerM2 =
      unitRates.cappingBasePerM2 *
      (quantities.tsfCoverThicknessM * unitRates.cappingThicknessFactor);
    items.push({
      category: CostCategory.TSFClosure,
      description: 'TSF capping and closure',
      quantity: derived.tsfAreaM2,
      unit: 'm²',
      unitRate: cappingCostPerM2,
      subtotal: derived.tsfAreaM2 * cappingCostPerM2,
      phase: ClosurePhase.TailingsWRDRehabilitation,
    });
  }

  // WRD Rehabilitation
  if (quantities.wrdFootprintHa > 0) {
    const wrdCostPerM2 =
      unitRates.cappingBasePerM2 *
      (quantities.wrdReshapingDepthM * unitRates.cappingThicknessFactor * 0.5);
    items.push({
      category: CostCategory.WRDRehabilitation,
      description: 'WRD reshaping and cover',
      quantity: derived.wrdAreaM2,
      unit: 'm²',
      unitRate: wrdCostPerM2,
      subtotal: derived.wrdAreaM2 * wrdCostPerM2,
      phase: ClosurePhase.TailingsWRDRehabilitation,
    });
  }

  // Water Treatment - Capex
  if (quantities.waterTreatmentDurationYears > 0 && quantities.waterTreatmentFlowMLPerDay > 0) {
    const capexAdjusted =
      unitRates.waterTreatmentCapex * quantities.waterTreatmentIntensityFactor;
    items.push({
      category: CostCategory.WaterTreatmentCapex,
      description: 'Water treatment plant (capex)',
      quantity: 1,
      unit: 'plant',
      unitRate: capexAdjusted,
      subtotal: capexAdjusted,
      phase: ClosurePhase.WaterManagement,
    });

    // Water Treatment - Opex
    const annualOpex =
      quantities.waterTreatmentFlowMLPerDay *
      365 *
      unitRates.waterTreatmentOpexPerML *
      quantities.waterTreatmentIntensityFactor;
    items.push({
      category: CostCategory.WaterTreatmentOpex,
      description: 'Water treatment operations (opex)',
      quantity: quantities.waterTreatmentDurationYears,
      unit: 'years',
      unitRate: annualOpex,
      subtotal: annualOpex * quantities.waterTreatmentDurationYears,
      phase: ClosurePhase.WaterManagement,
    });
  }

  // Revegetation
  if (quantities.disturbedAreaHa > 0) {
    const revegRate = unitRates.revegetationPerHa * unitRates.revegetationComplexityFactor;
    items.push({
      category: CostCategory.Revegetation,
      description: 'Revegetation and ecosystem establishment',
      quantity: quantities.disturbedAreaHa,
      unit: 'ha',
      unitRate: revegRate,
      subtotal: quantities.disturbedAreaHa * revegRate,
      phase: ClosurePhase.RevegetationEcosystem,
    });
  }

  // Erosion controls
  if (quantities.disturbedAreaHa > 0) {
    items.push({
      category: CostCategory.ErosionControls,
      description: 'Erosion and sediment controls',
      quantity: quantities.disturbedAreaHa,
      unit: 'ha',
      unitRate: unitRates.erosionControlsPerHa,
      subtotal: quantities.disturbedAreaHa * unitRates.erosionControlsPerHa,
      phase: ClosurePhase.EarthworksLandform,
    });
  }

  // Road rehabilitation
  if (quantities.roadLengthKm > 0) {
    items.push({
      category: CostCategory.RoadRehabilitation,
      description: 'Road and access rehabilitation',
      quantity: quantities.roadLengthKm,
      unit: 'km',
      unitRate: unitRates.roadRehabPerKm,
      subtotal: quantities.roadLengthKm * unitRates.roadRehabPerKm,
      phase: ClosurePhase.EarthworksLandform,
    });
  }

  // Hazardous materials
  if (quantities.hazardousMaterialsEnabled && quantities.hazardousMaterialsAreaHa > 0) {
    items.push({
      category: CostCategory.HazardousMaterials,
      description: 'Hazardous materials handling and disposal',
      quantity: quantities.hazardousMaterialsAreaHa,
      unit: 'ha',
      unitRate: unitRates.hazardousMaterialsPerHa,
      subtotal: quantities.hazardousMaterialsAreaHa * unitRates.hazardousMaterialsPerHa,
      phase: ClosurePhase.DecommissioningDemolition,
    });
  }

  // Monitoring
  const monitoringRate = getMonitoringRate(quantities.monitoringIntensity, {
    low: unitRates.monitoringPerYearLow,
    medium: unitRates.monitoringPerYearMedium,
    high: unitRates.monitoringPerYearHigh,
  });
  items.push({
    category: CostCategory.Monitoring,
    description: `Environmental monitoring (${quantities.monitoringIntensity} intensity)`,
    quantity: quantities.monitoringDurationYears,
    unit: 'years',
    unitRate: monitoringRate,
    subtotal: quantities.monitoringDurationYears * monitoringRate,
    phase: ClosurePhase.MonitoringMaintenance,
  });

  // Community/Heritage
  if (quantities.communityHeritageEnabled) {
    items.push({
      category: CostCategory.CommunityHeritage,
      description: 'Community and heritage management',
      quantity: 1,
      unit: 'lump sum',
      unitRate: unitRates.communityHeritageLumpSum,
      subtotal: unitRates.communityHeritageLumpSum,
      phase: ClosurePhase.PlanningApprovals,
    });
  }

  return items;
}

/**
 * Calculate indirect costs based on direct works total.
 *
 * @param directWorksTotal - Sum of all direct works costs
 * @param inputs - Complete input state
 * @param derived - Derived quantities
 * @returns Array of indirect cost line items
 */
export function calculateIndirectCosts(
  directWorksTotal: number,
  inputs: InputState,
  derived: DerivedQuantities
): LineItemCost[] {
  const { indirectRates } = inputs;
  const items: LineItemCost[] = [];

  // Site establishment / Project management
  const siteEstCost = directWorksTotal * (indirectRates.siteEstablishmentPercent / 100);
  items.push({
    category: CostCategory.SiteEstablishment,
    description: 'Site establishment, HSE, and project management',
    quantity: indirectRates.siteEstablishmentPercent,
    unit: '% of direct',
    unitRate: directWorksTotal / 100,
    subtotal: siteEstCost,
    phase: ClosurePhase.PlanningApprovals,
  });

  // Contractor margin (on direct + site establishment)
  const subtotalForMargin = directWorksTotal + siteEstCost;
  const contractorMargin = subtotalForMargin * (indirectRates.contractorMarginPercent / 100);
  items.push({
    category: CostCategory.ContractorMargin,
    description: 'Contractor margin',
    quantity: indirectRates.contractorMarginPercent,
    unit: '% of subtotal',
    unitRate: subtotalForMargin / 100,
    subtotal: contractorMargin,
    phase: ClosurePhase.DecommissioningDemolition,
  });

  // Subtotal for contingency/risk
  const subtotalForContingency = directWorksTotal + siteEstCost + contractorMargin;

  // Base contingency
  const contingency = subtotalForContingency * (indirectRates.contingencyPercent / 100);
  items.push({
    category: CostCategory.Contingency,
    description: 'Base contingency',
    quantity: indirectRates.contingencyPercent,
    unit: '% of subtotal',
    unitRate: subtotalForContingency / 100,
    subtotal: contingency,
    phase: ClosurePhase.PlanningApprovals,
  });

  // Risk uplift
  const riskUplift = subtotalForContingency * (derived.riskUpliftPercent / 100);
  items.push({
    category: CostCategory.RiskUplift,
    description: `Risk-based uplift (score: ${derived.riskScore})`,
    quantity: derived.riskUpliftPercent,
    unit: '% of subtotal',
    unitRate: subtotalForContingency / 100,
    subtotal: riskUplift,
    phase: ClosurePhase.PlanningApprovals,
  });

  // Owner's costs
  const totalBeforeOwners =
    directWorksTotal + siteEstCost + contractorMargin + contingency + riskUplift;
  const ownersCosts = totalBeforeOwners * (indirectRates.ownersCostsPercent / 100);
  items.push({
    category: CostCategory.OwnersCosts,
    description: "Owner's costs and overheads",
    quantity: indirectRates.ownersCostsPercent,
    unit: '% of total',
    unitRate: totalBeforeOwners / 100,
    subtotal: ownersCosts,
    phase: ClosurePhase.PlanningApprovals,
  });

  return items;
}

// ============================================================================
// Scheduling and Cashflow
// ============================================================================

/**
 * Calculate total project duration based on phase durations.
 * Phases are assumed to run sequentially with some overlap.
 */
export function calculateTotalDuration(phaseDurations: PhaseDurations): number {
  // Simplified: planning overlaps with nothing, others have some overlap
  const planningYears = phaseDurations[ClosurePhase.PlanningApprovals];
  const decommYears = phaseDurations[ClosurePhase.DecommissioningDemolition];
  const earthworksYears = phaseDurations[ClosurePhase.EarthworksLandform];
  const tsfWrdYears = phaseDurations[ClosurePhase.TailingsWRDRehabilitation];
  const waterYears = phaseDurations[ClosurePhase.WaterManagement];
  const revegYears = phaseDurations[ClosurePhase.RevegetationEcosystem];
  const monitoringYears = phaseDurations[ClosurePhase.MonitoringMaintenance];
  const relinquishmentYears = phaseDurations[ClosurePhase.RelinquishmentPostClosure];

  // Simple sequential with parallel activities
  // Earthworks and TSF/WRD run in parallel, water overlaps with monitoring
  const activeWorks =
    planningYears +
    decommYears +
    Math.max(earthworksYears, tsfWrdYears) +
    revegYears;

  // Water and monitoring can extend beyond
  const waterMonitoring = Math.max(waterYears, monitoringYears);

  return activeWorks + waterMonitoring + relinquishmentYears;
}

/**
 * Get phase start year (relative to project start = year 0).
 */
export function getPhaseStartYear(
  phase: ClosurePhase,
  durations: PhaseDurations
): number {
  const d = durations;

  switch (phase) {
    case ClosurePhase.PlanningApprovals:
      return 0;
    case ClosurePhase.DecommissioningDemolition:
      return d[ClosurePhase.PlanningApprovals];
    case ClosurePhase.EarthworksLandform:
      return d[ClosurePhase.PlanningApprovals] + d[ClosurePhase.DecommissioningDemolition];
    case ClosurePhase.TailingsWRDRehabilitation:
      return d[ClosurePhase.PlanningApprovals] + d[ClosurePhase.DecommissioningDemolition];
    case ClosurePhase.WaterManagement:
      return d[ClosurePhase.PlanningApprovals] + d[ClosurePhase.DecommissioningDemolition];
    case ClosurePhase.RevegetationEcosystem:
      return (
        d[ClosurePhase.PlanningApprovals] +
        d[ClosurePhase.DecommissioningDemolition] +
        Math.max(d[ClosurePhase.EarthworksLandform], d[ClosurePhase.TailingsWRDRehabilitation])
      );
    case ClosurePhase.MonitoringMaintenance:
      return (
        d[ClosurePhase.PlanningApprovals] +
        d[ClosurePhase.DecommissioningDemolition] +
        Math.max(d[ClosurePhase.EarthworksLandform], d[ClosurePhase.TailingsWRDRehabilitation]) +
        d[ClosurePhase.RevegetationEcosystem]
      );
    case ClosurePhase.RelinquishmentPostClosure:
      return (
        d[ClosurePhase.PlanningApprovals] +
        d[ClosurePhase.DecommissioningDemolition] +
        Math.max(d[ClosurePhase.EarthworksLandform], d[ClosurePhase.TailingsWRDRehabilitation]) +
        d[ClosurePhase.RevegetationEcosystem] +
        Math.max(d[ClosurePhase.WaterManagement], d[ClosurePhase.MonitoringMaintenance])
      );
  }
}

/**
 * Allocate line item costs to annual cashflows.
 *
 * @param lineItems - All cost line items
 * @param inputs - Complete input state
 * @returns Annual cashflow array
 */
export function calculateAnnualCashflows(
  lineItems: readonly LineItemCost[],
  inputs: InputState
): AnnualCashflow[] {
  const { financialParams, phaseDurations } = inputs;
  const totalDuration = calculateTotalDuration(phaseDurations);

  // Initialize cashflows for each year
  const cashflows: AnnualCashflow[] = [];
  const yearlyPhaseBreakdown: Record<ClosurePhase, number>[] = [];

  for (let i = 0; i <= totalDuration; i++) {
    const phaseBreakdown = {} as Record<ClosurePhase, number>;
    for (const phase of CLOSURE_PHASES) {
      phaseBreakdown[phase] = 0;
    }
    yearlyPhaseBreakdown.push(phaseBreakdown);
  }

  // Distribute each line item across its phase duration
  for (const item of lineItems) {
    const phaseStart = getPhaseStartYear(item.phase, phaseDurations);
    const phaseDuration = phaseDurations[item.phase];

    if (phaseDuration > 0) {
      const annualCost = item.subtotal / phaseDuration;
      for (let y = 0; y < phaseDuration; y++) {
        const year = phaseStart + y;
        if (year <= totalDuration && yearlyPhaseBreakdown[year]) {
          yearlyPhaseBreakdown[year][item.phase] += annualCost;
        }
      }
    } else if (yearlyPhaseBreakdown[phaseStart]) {
      // Zero duration phase - allocate to start year
      yearlyPhaseBreakdown[phaseStart][item.phase] += item.subtotal;
    }
  }

  // Build cashflow entries with escalation and discounting
  let cumulativeNominal = 0;
  let cumulativeDiscounted = 0;
  const escalationRate = financialParams.escalationRatePercent / 100;
  const discountRate = financialParams.discountRatePercent / 100;

  // Adjust discount rate for nominal/real mode
  const effectiveDiscountRate =
    financialParams.discountRateMode === 'nominal'
      ? discountRate
      : discountRate; // Real rate already accounts for inflation separately

  for (let i = 0; i <= totalDuration; i++) {
    const phaseBreakdown = yearlyPhaseBreakdown[i];
    if (!phaseBreakdown) continue;

    let nominalCost = 0;
    for (const phase of CLOSURE_PHASES) {
      nominalCost += phaseBreakdown[phase];
    }

    // Apply escalation
    const escalatedCost = nominalCost * Math.pow(1 + escalationRate, i);

    // Apply discounting
    const discountedCost = escalatedCost / Math.pow(1 + effectiveDiscountRate, i);

    cumulativeNominal += nominalCost;
    cumulativeDiscounted += discountedCost;

    cashflows.push({
      year: financialParams.closureStartYear + i,
      nominalCost,
      escalatedCost,
      discountedCost,
      cumulativeNominal,
      cumulativeDiscounted,
      phaseBreakdown,
    });
  }

  return cashflows;
}

// ============================================================================
// Breakdown Summaries
// ============================================================================

/**
 * Calculate cost breakdown by phase.
 */
export function calculatePhaseBreakdown(
  lineItems: readonly LineItemCost[],
  totalCost: number
): PhaseCostSummary[] {
  const phaseTotals = new Map<ClosurePhase, number>();

  for (const phase of CLOSURE_PHASES) {
    phaseTotals.set(phase, 0);
  }

  for (const item of lineItems) {
    const current = phaseTotals.get(item.phase) ?? 0;
    phaseTotals.set(item.phase, current + item.subtotal);
  }

  return CLOSURE_PHASES.map((phase) => ({
    phase,
    totalCost: phaseTotals.get(phase) ?? 0,
    percentOfTotal: totalCost > 0 ? ((phaseTotals.get(phase) ?? 0) / totalCost) * 100 : 0,
  }));
}

/**
 * Calculate cost breakdown by category.
 */
export function calculateCategoryBreakdown(
  lineItems: readonly LineItemCost[],
  totalCost: number
): CategoryCostSummary[] {
  const categoryTotals = new Map<CostCategory, number>();

  for (const item of lineItems) {
    const current = categoryTotals.get(item.category) ?? 0;
    categoryTotals.set(item.category, current + item.subtotal);
  }

  const summaries: CategoryCostSummary[] = [];
  for (const [category, cost] of categoryTotals) {
    if (cost > 0) {
      summaries.push({
        category,
        totalCost: cost,
        percentOfTotal: totalCost > 0 ? (cost / totalCost) * 100 : 0,
      });
    }
  }

  // Sort by cost descending
  return summaries.sort((a, b) => b.totalCost - a.totalCost);
}

// ============================================================================
// Sensitivity Analysis
// ============================================================================

/** Sensitivity driver definition */
interface SensitivityDriver {
  name: string;
  key: string;
  getValue: (inputs: InputState) => number;
  setValue: (inputs: InputState, value: number) => InputState;
  unit: string;
}

/** Key sensitivity drivers */
const SENSITIVITY_DRIVERS: SensitivityDriver[] = [
  {
    name: 'Disturbed Area',
    key: 'disturbedArea',
    getValue: (i) => i.quantities.disturbedAreaHa,
    setValue: (i, v) => ({
      ...i,
      quantities: { ...i.quantities, disturbedAreaHa: v },
    }),
    unit: 'ha',
  },
  {
    name: 'Earthworks Rate',
    key: 'earthworksRate',
    getValue: (i) => i.unitRates.earthworksPerM3,
    setValue: (i, v) => ({
      ...i,
      unitRates: { ...i.unitRates, earthworksPerM3: v },
    }),
    unit: '$/m³',
  },
  {
    name: 'TSF Area',
    key: 'tsfArea',
    getValue: (i) => i.quantities.tsfAreaHa,
    setValue: (i, v) => ({
      ...i,
      quantities: { ...i.quantities, tsfAreaHa: v },
    }),
    unit: 'ha',
  },
  {
    name: 'TSF Cover Thickness',
    key: 'tsfThickness',
    getValue: (i) => i.quantities.tsfCoverThicknessM,
    setValue: (i, v) => ({
      ...i,
      quantities: { ...i.quantities, tsfCoverThicknessM: v },
    }),
    unit: 'm',
  },
  {
    name: 'Water Treatment Duration',
    key: 'waterDuration',
    getValue: (i) => i.quantities.waterTreatmentDurationYears,
    setValue: (i, v) => ({
      ...i,
      quantities: { ...i.quantities, waterTreatmentDurationYears: v },
    }),
    unit: 'years',
  },
  {
    name: 'Contingency %',
    key: 'contingency',
    getValue: (i) => i.indirectRates.contingencyPercent,
    setValue: (i, v) => ({
      ...i,
      indirectRates: { ...i.indirectRates, contingencyPercent: v },
    }),
    unit: '%',
  },
  {
    name: 'Discount Rate',
    key: 'discountRate',
    getValue: (i) => i.financialParams.discountRatePercent,
    setValue: (i, v) => ({
      ...i,
      financialParams: { ...i.financialParams, discountRatePercent: v },
    }),
    unit: '%',
  },
  {
    name: 'Revegetation Rate',
    key: 'revegRate',
    getValue: (i) => i.unitRates.revegetationPerHa,
    setValue: (i, v) => ({
      ...i,
      unitRates: { ...i.unitRates, revegetationPerHa: v },
    }),
    unit: '$/ha',
  },
];

/**
 * Calculate total cost for sensitivity analysis (simplified calculation).
 */
function calculateTotalForSensitivity(inputs: InputState): { total: number; npv: number } {
  const derived = calculateDerivedQuantities(inputs);
  const directItems = calculateDirectWorksCosts(inputs, derived);
  const directTotal = directItems.reduce((sum, item) => sum + item.subtotal, 0);
  const indirectItems = calculateIndirectCosts(directTotal, inputs, derived);
  const allItems = [...directItems, ...indirectItems];
  const total = allItems.reduce((sum, item) => sum + item.subtotal, 0);

  // Simple NPV calculation
  const cashflows = calculateAnnualCashflows(allItems, inputs);
  const npv = cashflows.length > 0 ? cashflows[cashflows.length - 1]?.cumulativeDiscounted ?? 0 : 0;

  return { total, npv };
}

/**
 * Perform sensitivity analysis on key cost drivers.
 *
 * @param inputs - Base input state
 * @param variationPercent - Variation percentage (default 10%)
 * @returns Array of sensitivity results
 */
export function calculateSensitivity(
  inputs: InputState,
  variationPercent: number = 10
): SensitivityResult[] {
  // Calculate base results for comparison (used to identify base case)
  const _baseResults = calculateTotalForSensitivity(inputs);
  void _baseResults; // Suppress unused variable warning - base case used implicitly
  
  const results: SensitivityResult[] = [];

  for (const driver of SENSITIVITY_DRIVERS) {
    const baseValue = driver.getValue(inputs);

    // Skip if base value is zero
    if (baseValue === 0) continue;

    const lowValue = baseValue * (1 - variationPercent / 100);
    const highValue = baseValue * (1 + variationPercent / 100);

    const lowInputs = driver.setValue(inputs, lowValue);
    const highInputs = driver.setValue(inputs, highValue);

    const lowResults = calculateTotalForSensitivity(lowInputs);
    const highResults = calculateTotalForSensitivity(highInputs);

    results.push({
      driverName: driver.name,
      driverKey: driver.key,
      baseValue,
      unit: driver.unit,
      lowValue,
      highValue,
      lowTotalCost: lowResults.total,
      highTotalCost: highResults.total,
      lowNPV: lowResults.npv,
      highNPV: highResults.npv,
      deltaCost: highResults.total - lowResults.total,
      deltaNPV: highResults.npv - lowResults.npv,
    });
  }

  // Sort by absolute delta cost impact
  return results.sort((a, b) => Math.abs(b.deltaCost) - Math.abs(a.deltaCost));
}

// ============================================================================
// Main Calculation Entry Point
// ============================================================================

/**
 * Execute complete closure cost calculation.
 *
 * This is the main entry point for the calculation engine.
 * It is a pure function that takes input state and returns complete results.
 *
 * @param inputs - Complete validated input state
 * @returns Complete calculation results
 */
export function calculateClosureCosts(inputs: InputState): Results {
  // 1. Calculate derived quantities
  const derivedQuantities = calculateDerivedQuantities(inputs);

  // 2. Calculate direct works costs
  const directItems = calculateDirectWorksCosts(inputs, derivedQuantities);
  const directWorksCost = directItems.reduce((sum, item) => sum + item.subtotal, 0);

  // 3. Calculate indirect costs
  const indirectItems = calculateIndirectCosts(directWorksCost, inputs, derivedQuantities);
  const indirectCosts = indirectItems.reduce((sum, item) => sum + item.subtotal, 0);

  // 4. Combine all line items
  const lineItems = [...directItems, ...indirectItems];
  const totalNominalCost = directWorksCost + indirectCosts;

  // 5. Calculate annual cashflows
  const annualCashflows = calculateAnnualCashflows(lineItems, inputs);

  // 6. Get totals from cashflows
  const lastCashflow = annualCashflows[annualCashflows.length - 1];
  const totalDiscountedCost = lastCashflow?.cumulativeDiscounted ?? 0;

  // 7. Find peak cashflow
  let peakAnnualCashflow = 0;
  let peakCashflowYear = inputs.financialParams.closureStartYear;
  for (const cf of annualCashflows) {
    if (cf.nominalCost > peakAnnualCashflow) {
      peakAnnualCashflow = cf.nominalCost;
      peakCashflowYear = cf.year;
    }
  }

  // 8. Calculate breakdowns
  const phaseBreakdown = calculatePhaseBreakdown(lineItems, totalNominalCost);
  const categoryBreakdown = calculateCategoryBreakdown(lineItems, totalNominalCost);

  // 9. Calculate sensitivity
  const sensitivityResults = calculateSensitivity(inputs);

  // 10. Calculate monitoring cost share
  const monitoringCost = lineItems
    .filter((item) => item.category === CostCategory.Monitoring)
    .reduce((sum, item) => sum + item.subtotal, 0);
  const monitoringCostShare = totalNominalCost > 0 ? (monitoringCost / totalNominalCost) * 100 : 0;

  // 11. Calculate total duration
  const totalDurationYears = calculateTotalDuration(inputs.phaseDurations);

  return {
    derivedQuantities,
    lineItems,
    directWorksCost,
    indirectCosts,
    totalNominalCost,
    totalDiscountedCost,
    peakAnnualCashflow,
    peakCashflowYear,
    annualCashflows,
    phaseBreakdown,
    categoryBreakdown,
    sensitivityResults,
    monitoringCostShare,
    totalDurationYears,
  };
}
