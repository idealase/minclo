/**
 * Unit tests for Input Validation Schemas
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  InputStateSchema, 
  validateInputState, 
  validateField,
  DirectWorksQuantitiesSchema,
  RiskFactorsSchema,
  FinancialParamsSchema,
} from './validation';
import { createDefaultInputState } from './defaults';
import type { InputState } from './types';
import { z } from 'zod';

describe('InputStateSchema validation', () => {
  let defaultInputs: InputState;

  beforeEach(() => {
    defaultInputs = createDefaultInputState();
  });

  describe('Valid inputs', () => {
    it('should validate default input state', () => {
      const result = InputStateSchema.safeParse(defaultInputs);
      expect(result.success).toBe(true);
    });

    it('should validate minimum valid inputs', () => {
      const minInputs: InputState = {
        ...defaultInputs,
        quantities: {
          ...defaultInputs.quantities,
          disturbedAreaHa: 0,
          tsfAreaHa: 0,
          wrdFootprintHa: 0,
        },
      };
      const result = InputStateSchema.safeParse(minInputs);
      expect(result.success).toBe(true);
    });

    it('should validate maximum reasonable inputs', () => {
      const maxInputs: InputState = {
        ...defaultInputs,
        quantities: {
          ...defaultInputs.quantities,
          disturbedAreaHa: 50000,
          tsfAreaHa: 5000,
          wrdFootprintHa: 20000,
        },
      };
      const result = InputStateSchema.safeParse(maxInputs);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid inputs - negative values', () => {
    it('should reject negative disturbed area', () => {
      const invalidInputs = {
        ...defaultInputs,
        quantities: {
          ...defaultInputs.quantities,
          disturbedAreaHa: -10,
        },
      };
      const result = InputStateSchema.safeParse(invalidInputs);
      expect(result.success).toBe(false);
    });

    it('should reject negative TSF area', () => {
      const invalidInputs = {
        ...defaultInputs,
        quantities: {
          ...defaultInputs.quantities,
          tsfAreaHa: -5,
        },
      };
      const result = InputStateSchema.safeParse(invalidInputs);
      expect(result.success).toBe(false);
    });

    it('should reject negative WRD area', () => {
      const invalidInputs = {
        ...defaultInputs,
        quantities: {
          ...defaultInputs.quantities,
          wrdFootprintHa: -20,
        },
      };
      const result = InputStateSchema.safeParse(invalidInputs);
      expect(result.success).toBe(false);
    });

    it('should reject negative earthworks rate', () => {
      const invalidInputs = {
        ...defaultInputs,
        unitRates: {
          ...defaultInputs.unitRates,
          earthworksPerM3: -15,
        },
      };
      const result = InputStateSchema.safeParse(invalidInputs);
      expect(result.success).toBe(false);
    });

    it('should reject negative contingency percentage', () => {
      const invalidInputs = {
        ...defaultInputs,
        indirectRates: {
          ...defaultInputs.indirectRates,
          contingencyPercent: -10,
        },
      };
      const result = InputStateSchema.safeParse(invalidInputs);
      expect(result.success).toBe(false);
    });
  });

  describe('Invalid inputs - out of range', () => {
    it('should reject contingency percentage over 100', () => {
      const invalidInputs = {
        ...defaultInputs,
        indirectRates: {
          ...defaultInputs.indirectRates,
          contingencyPercent: 150,
        },
      };
      const result = InputStateSchema.safeParse(invalidInputs);
      expect(result.success).toBe(false);
    });

    it('should reject discount rate over 30', () => {
      const invalidInputs = {
        ...defaultInputs,
        financialParams: {
          ...defaultInputs.financialParams,
          discountRatePercent: 50,
        },
      };
      const result = InputStateSchema.safeParse(invalidInputs);
      expect(result.success).toBe(false);
    });

    it('should reject negative discount rate', () => {
      const invalidInputs = {
        ...defaultInputs,
        financialParams: {
          ...defaultInputs.financialParams,
          discountRatePercent: -5,
        },
      };
      const result = InputStateSchema.safeParse(invalidInputs);
      expect(result.success).toBe(false);
    });

    it('should reject TSF area over 10000 ha', () => {
      const invalidInputs = {
        ...defaultInputs,
        quantities: {
          ...defaultInputs.quantities,
          tsfAreaHa: 15000,
        },
      };
      const result = InputStateSchema.safeParse(invalidInputs);
      expect(result.success).toBe(false);
    });
  });

  describe('Invalid inputs - wrong types', () => {
    it('should reject string for numeric field', () => {
      const invalidInputs = {
        ...defaultInputs,
        quantities: {
          ...defaultInputs.quantities,
          disturbedAreaHa: 'ten' as unknown as number,
        },
      };
      const result = InputStateSchema.safeParse(invalidInputs);
      expect(result.success).toBe(false);
    });

    it('should reject null for required field', () => {
      const invalidInputs = {
        ...defaultInputs,
        quantities: {
          ...defaultInputs.quantities,
          disturbedAreaHa: null as unknown as number,
        },
      };
      const result = InputStateSchema.safeParse(invalidInputs);
      expect(result.success).toBe(false);
    });
  });

  describe('Invalid inputs - missing nested objects', () => {
    it('should reject missing quantities object', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { quantities, ...missingQuantities } = defaultInputs;
      const result = InputStateSchema.safeParse(missingQuantities);
      expect(result.success).toBe(false);
    });

    it('should reject missing unitRates object', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { unitRates, ...missingRates } = defaultInputs;
      const result = InputStateSchema.safeParse(missingRates);
      expect(result.success).toBe(false);
    });

    it('should reject missing financialParams object', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { financialParams, ...missingFinancial } = defaultInputs;
      const result = InputStateSchema.safeParse(missingFinancial);
      expect(result.success).toBe(false);
    });
  });
});

describe('validateInputState', () => {
  it('should return valid result for correct inputs', () => {
    const defaultInputs = createDefaultInputState();
    const result = validateInputState(defaultInputs);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(defaultInputs);
    }
  });

  it('should return error for invalid inputs', () => {
    const invalidInputs = { quantities: { disturbedAreaHa: -10 } } as unknown as InputState;
    const result = validateInputState(invalidInputs);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });
});

describe('validateField', () => {
  it('should validate positive number field', () => {
    const schema = z.number().min(0);
    const result = validateField(schema, 100);
    expect(result.valid).toBe(true);
  });

  it('should reject invalid positive number', () => {
    const schema = z.number().min(0);
    const result = validateField(schema, -10);
    expect(result.valid).toBe(false);
  });

  it('should validate percentage within range', () => {
    const schema = z.number().min(0).max(100);
    const result = validateField(schema, 25);
    expect(result.valid).toBe(true);
  });

  it('should reject percentage out of range', () => {
    const schema = z.number().min(0).max(100);
    const result = validateField(schema, 150);
    expect(result.valid).toBe(false);
  });

  it('should validate string field', () => {
    const schema = z.string().min(1).max(100);
    const result = validateField(schema, 'Test Scenario');
    expect(result.valid).toBe(true);
  });

  it('should reject empty string when not allowed', () => {
    const schema = z.string().min(1);
    const result = validateField(schema, '');
    expect(result.valid).toBe(false);
  });
});

describe('Individual schema tests', () => {
  describe('DirectWorksQuantitiesSchema', () => {
    it('should validate valid quantities', () => {
      const validQuantities = {
        disturbedAreaHa: 500,
        tsfAreaHa: 100,
        tsfCoverThicknessM: 0.5,
        wrdFootprintHa: 200,
        wrdReshapingDepthM: 2,
        earthworksVolumeM3Override: null,
        topsoilThicknessM: 0.3,
        recontouringAreaHa: 100,
        roadLengthKm: 10,
        numberOfBuildings: 20,
        waterTreatmentFlowMLPerDay: 5,
        waterTreatmentDurationYears: 10,
        waterTreatmentIntensityFactor: 1.0,
        monitoringDurationYears: 10,
        monitoringIntensity: 'medium',
        hazardousMaterialsEnabled: false,
        hazardousMaterialsAreaHa: 0,
        communityHeritageEnabled: true,
      };
      const result = DirectWorksQuantitiesSchema.safeParse(validQuantities);
      expect(result.success).toBe(true);
    });

    it('should reject invalid monitoring intensity', () => {
      const invalidQuantities = {
        disturbedAreaHa: 500,
        tsfAreaHa: 100,
        tsfCoverThicknessM: 0.5,
        wrdFootprintHa: 200,
        wrdReshapingDepthM: 2,
        earthworksVolumeM3Override: null,
        topsoilThicknessM: 0.3,
        recontouringAreaHa: 100,
        roadLengthKm: 10,
        numberOfBuildings: 20,
        waterTreatmentFlowMLPerDay: 5,
        waterTreatmentDurationYears: 10,
        waterTreatmentIntensityFactor: 1.0,
        monitoringDurationYears: 10,
        monitoringIntensity: 'invalid',
        hazardousMaterialsEnabled: false,
        hazardousMaterialsAreaHa: 0,
        communityHeritageEnabled: true,
      };
      const result = DirectWorksQuantitiesSchema.safeParse(invalidQuantities);
      expect(result.success).toBe(false);
    });
  });

  describe('FinancialParamsSchema', () => {
    it('should validate valid financial params', () => {
      const validParams = {
        closureStartYear: 2025,
        escalationRatePercent: 2.5,
        discountRatePercent: 7,
        discountRateMode: 'real',
      };
      const result = FinancialParamsSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it('should reject invalid discount rate mode', () => {
      const invalidParams = {
        closureStartYear: 2025,
        escalationRatePercent: 2.5,
        discountRatePercent: 7,
        discountRateMode: 'invalid',
      };
      const result = FinancialParamsSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });

    it('should reject year before 2020', () => {
      const invalidParams = {
        closureStartYear: 2015,
        escalationRatePercent: 2.5,
        discountRatePercent: 7,
        discountRateMode: 'real',
      };
      const result = FinancialParamsSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });
  });

  describe('RiskFactorsSchema', () => {
    it('should validate valid risk factors', () => {
      const validRisks = {
        contaminationUncertainty: 50,
        geotechUncertainty: 30,
        waterQualityUncertainty: 40,
        regulatoryUncertainty: 20,
        logisticsComplexity: 25,
      };
      const result = RiskFactorsSchema.safeParse(validRisks);
      expect(result.success).toBe(true);
    });

    it('should reject risk factor over 100', () => {
      const invalidRisks = {
        contaminationUncertainty: 150,
        geotechUncertainty: 30,
        waterQualityUncertainty: 40,
        regulatoryUncertainty: 20,
        logisticsComplexity: 25,
      };
      const result = RiskFactorsSchema.safeParse(invalidRisks);
      expect(result.success).toBe(false);
    });
  });
});

describe('Edge cases', () => {
  let defaultInputs: InputState;

  beforeEach(() => {
    defaultInputs = createDefaultInputState();
  });

  it('should handle NaN values', () => {
    const invalidInputs = {
      ...defaultInputs,
      quantities: {
        ...defaultInputs.quantities,
        disturbedAreaHa: NaN,
      },
    };
    const result = InputStateSchema.safeParse(invalidInputs);
    expect(result.success).toBe(false);
  });

  it('should handle Infinity values', () => {
    const invalidInputs = {
      ...defaultInputs,
      quantities: {
        ...defaultInputs.quantities,
        disturbedAreaHa: Infinity,
      },
    };
    const result = InputStateSchema.safeParse(invalidInputs);
    expect(result.success).toBe(false);
  });

  it('should handle very small positive numbers', () => {
    const smallInputs = {
      ...defaultInputs,
      quantities: {
        ...defaultInputs.quantities,
        disturbedAreaHa: 0.001,
      },
    };
    const result = InputStateSchema.safeParse(smallInputs);
    expect(result.success).toBe(true);
  });

  it('should handle boundary values', () => {
    const boundaryInputs = {
      ...defaultInputs,
      quantities: {
        ...defaultInputs.quantities,
        disturbedAreaHa: 100000, // Maximum allowed
        tsfAreaHa: 10000, // Maximum allowed
      },
    };
    const result = InputStateSchema.safeParse(boundaryInputs);
    expect(result.success).toBe(true);
  });

  it('should reject just over boundary', () => {
    const overBoundaryInputs = {
      ...defaultInputs,
      quantities: {
        ...defaultInputs.quantities,
        disturbedAreaHa: 100001, // Just over maximum
      },
    };
    const result = InputStateSchema.safeParse(overBoundaryInputs);
    expect(result.success).toBe(false);
  });
});
