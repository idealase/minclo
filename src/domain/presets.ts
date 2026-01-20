/**
 * Mine Closure Costing - Scenario Presets
 *
 * Pre-configured scenarios for common mine closure situations.
 * These are illustrative defaults and should be adjusted for specific sites.
 */

import type { ScenarioPreset, InputState } from './types';
import { ClosurePhase } from './types';
import { DEFAULT_INPUT_STATE } from './defaults';

/**
 * Small open pit with low water risk
 * Typical: smaller operation, limited tailings, short monitoring period
 */
export const PRESET_SMALL_OPEN_PIT: ScenarioPreset = {
  id: 'small-open-pit',
  name: 'Small Open Pit, Low Water Risk',
  description:
    'A smaller open pit operation with limited tailings and minimal water treatment requirements. Suitable for sites with benign geology and low environmental risk.',
  inputs: {
    ...DEFAULT_INPUT_STATE,
    scenarioName: 'Small Open Pit, Low Water Risk',
    quantities: {
      ...DEFAULT_INPUT_STATE.quantities,
      disturbedAreaHa: 150,
      tsfAreaHa: 30,
      tsfCoverThicknessM: 0.3,
      wrdFootprintHa: 50,
      wrdReshapingDepthM: 0.5,
      earthworksVolumeM3Override: null,
      topsoilThicknessM: 0.15,
      recontouringAreaHa: 80,
      roadLengthKm: 8,
      numberOfBuildings: 8,
      waterTreatmentFlowMLPerDay: 0.5,
      waterTreatmentDurationYears: 5,
      waterTreatmentIntensityFactor: 0.8,
      monitoringDurationYears: 10,
      monitoringIntensity: 'low',
      hazardousMaterialsEnabled: false,
      hazardousMaterialsAreaHa: 0,
      communityHeritageEnabled: false,
    },
    riskFactors: {
      contaminationUncertainty: 15,
      geotechUncertainty: 20,
      waterQualityUncertainty: 15,
      regulatoryUncertainty: 15,
      logisticsComplexity: 20,
    },
    phaseDurations: {
      [ClosurePhase.PlanningApprovals]: 1,
      [ClosurePhase.DecommissioningDemolition]: 1,
      [ClosurePhase.EarthworksLandform]: 2,
      [ClosurePhase.TailingsWRDRehabilitation]: 2,
      [ClosurePhase.WaterManagement]: 5,
      [ClosurePhase.RevegetationEcosystem]: 2,
      [ClosurePhase.MonitoringMaintenance]: 10,
      [ClosurePhase.RelinquishmentPostClosure]: 1,
    },
  },
};

/**
 * Large open pit with significant WRD
 * Typical: major operation, large waste rock dump, moderate water issues
 */
export const PRESET_LARGE_OPEN_PIT_WRD: ScenarioPreset = {
  id: 'large-open-pit-wrd',
  name: 'Large Open Pit + WRD',
  description:
    'A large-scale open pit operation with significant waste rock dump requiring extensive reshaping. Moderate water treatment needs and standard monitoring.',
  inputs: {
    ...DEFAULT_INPUT_STATE,
    scenarioName: 'Large Open Pit + WRD',
    quantities: {
      ...DEFAULT_INPUT_STATE.quantities,
      disturbedAreaHa: 800,
      tsfAreaHa: 150,
      tsfCoverThicknessM: 0.5,
      wrdFootprintHa: 400,
      wrdReshapingDepthM: 1.5,
      earthworksVolumeM3Override: null,
      topsoilThicknessM: 0.2,
      recontouringAreaHa: 500,
      roadLengthKm: 35,
      numberOfBuildings: 25,
      waterTreatmentFlowMLPerDay: 3,
      waterTreatmentDurationYears: 12,
      waterTreatmentIntensityFactor: 1.0,
      monitoringDurationYears: 20,
      monitoringIntensity: 'medium',
      hazardousMaterialsEnabled: true,
      hazardousMaterialsAreaHa: 5,
      communityHeritageEnabled: true,
    },
    unitRates: {
      ...DEFAULT_INPUT_STATE.unitRates,
      mobilisationLumpSum: 3500000,
      demolitionPerBuilding: 180000,
    },
    riskFactors: {
      contaminationUncertainty: 30,
      geotechUncertainty: 35,
      waterQualityUncertainty: 30,
      regulatoryUncertainty: 25,
      logisticsComplexity: 30,
    },
    phaseDurations: {
      [ClosurePhase.PlanningApprovals]: 2,
      [ClosurePhase.DecommissioningDemolition]: 3,
      [ClosurePhase.EarthworksLandform]: 4,
      [ClosurePhase.TailingsWRDRehabilitation]: 4,
      [ClosurePhase.WaterManagement]: 12,
      [ClosurePhase.RevegetationEcosystem]: 4,
      [ClosurePhase.MonitoringMaintenance]: 20,
      [ClosurePhase.RelinquishmentPostClosure]: 2,
    },
  },
};

/**
 * TSF-dominant site
 * Typical: large tailings facility is primary rehabilitation challenge
 */
export const PRESET_TSF_DOMINANT: ScenarioPreset = {
  id: 'tsf-dominant',
  name: 'TSF-Dominant Site',
  description:
    'A site where the Tailings Storage Facility is the primary closure challenge. Large TSF requiring extensive capping and long-term seepage management.',
  inputs: {
    ...DEFAULT_INPUT_STATE,
    scenarioName: 'TSF-Dominant Site',
    quantities: {
      ...DEFAULT_INPUT_STATE.quantities,
      disturbedAreaHa: 600,
      tsfAreaHa: 350,
      tsfCoverThicknessM: 0.8,
      wrdFootprintHa: 100,
      wrdReshapingDepthM: 0.8,
      earthworksVolumeM3Override: null,
      topsoilThicknessM: 0.15,
      recontouringAreaHa: 400,
      roadLengthKm: 25,
      numberOfBuildings: 18,
      waterTreatmentFlowMLPerDay: 2,
      waterTreatmentDurationYears: 15,
      waterTreatmentIntensityFactor: 1.2,
      monitoringDurationYears: 25,
      monitoringIntensity: 'medium',
      hazardousMaterialsEnabled: true,
      hazardousMaterialsAreaHa: 10,
      communityHeritageEnabled: true,
    },
    unitRates: {
      ...DEFAULT_INPUT_STATE.unitRates,
      cappingBasePerM2: 30,
      cappingThicknessFactor: 1.6,
      waterTreatmentCapex: 8000000,
    },
    riskFactors: {
      contaminationUncertainty: 40,
      geotechUncertainty: 45,
      waterQualityUncertainty: 50,
      regulatoryUncertainty: 35,
      logisticsComplexity: 25,
    },
    phaseDurations: {
      [ClosurePhase.PlanningApprovals]: 2,
      [ClosurePhase.DecommissioningDemolition]: 2,
      [ClosurePhase.EarthworksLandform]: 3,
      [ClosurePhase.TailingsWRDRehabilitation]: 5,
      [ClosurePhase.WaterManagement]: 15,
      [ClosurePhase.RevegetationEcosystem]: 4,
      [ClosurePhase.MonitoringMaintenance]: 25,
      [ClosurePhase.RelinquishmentPostClosure]: 2,
    },
  },
};

/**
 * High water treatment, long monitoring
 * Typical: AMD or other water quality issues requiring extended treatment
 */
export const PRESET_HIGH_WATER: ScenarioPreset = {
  id: 'high-water',
  name: 'High Water Treatment, Long Monitoring',
  description:
    'A site with significant water quality challenges requiring intensive, long-term treatment (e.g., AMD). Extended monitoring period before relinquishment.',
  inputs: {
    ...DEFAULT_INPUT_STATE,
    scenarioName: 'High Water Treatment, Long Monitoring',
    quantities: {
      ...DEFAULT_INPUT_STATE.quantities,
      disturbedAreaHa: 450,
      tsfAreaHa: 120,
      tsfCoverThicknessM: 0.6,
      wrdFootprintHa: 180,
      wrdReshapingDepthM: 1.0,
      earthworksVolumeM3Override: null,
      topsoilThicknessM: 0.2,
      recontouringAreaHa: 300,
      roadLengthKm: 20,
      numberOfBuildings: 15,
      waterTreatmentFlowMLPerDay: 8,
      waterTreatmentDurationYears: 30,
      waterTreatmentIntensityFactor: 1.8,
      monitoringDurationYears: 40,
      monitoringIntensity: 'high',
      hazardousMaterialsEnabled: true,
      hazardousMaterialsAreaHa: 8,
      communityHeritageEnabled: true,
    },
    unitRates: {
      ...DEFAULT_INPUT_STATE.unitRates,
      waterTreatmentCapex: 15000000,
      waterTreatmentOpexPerML: 800,
      monitoringPerYearHigh: 1500000,
    },
    riskFactors: {
      contaminationUncertainty: 50,
      geotechUncertainty: 30,
      waterQualityUncertainty: 70,
      regulatoryUncertainty: 45,
      logisticsComplexity: 30,
    },
    phaseDurations: {
      [ClosurePhase.PlanningApprovals]: 2,
      [ClosurePhase.DecommissioningDemolition]: 2,
      [ClosurePhase.EarthworksLandform]: 3,
      [ClosurePhase.TailingsWRDRehabilitation]: 3,
      [ClosurePhase.WaterManagement]: 30,
      [ClosurePhase.RevegetationEcosystem]: 3,
      [ClosurePhase.MonitoringMaintenance]: 40,
      [ClosurePhase.RelinquishmentPostClosure]: 3,
    },
  },
};

/** All available presets */
export const SCENARIO_PRESETS: readonly ScenarioPreset[] = [
  PRESET_SMALL_OPEN_PIT,
  PRESET_LARGE_OPEN_PIT_WRD,
  PRESET_TSF_DOMINANT,
  PRESET_HIGH_WATER,
] as const;

/**
 * Get preset by ID
 */
export function getPresetById(id: string): ScenarioPreset | undefined {
  return SCENARIO_PRESETS.find((p) => p.id === id);
}

/**
 * Get preset inputs by ID
 */
export function getPresetInputs(id: string): InputState | undefined {
  const preset = getPresetById(id);
  return preset ? structuredClone(preset.inputs) : undefined;
}
