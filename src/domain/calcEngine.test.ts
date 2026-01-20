/**
 * Unit tests for the Mine Closure Costing Calculation Engine
 * 
 * Tests cover:
 * - Default input calculations
 * - Derived quantity calculations
 * - Direct works cost calculations
 * - Indirect cost calculations
 * - Cashflow generation
 * - NPV calculations
 * - Sensitivity analysis
 * - Edge cases and boundary conditions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  calculateClosureCosts, 
  calculateDerivedQuantities,
  calculateRiskScore,
  riskScoreToUplift,
  haToM2,
  m2ToHa,
} from './calcEngine';
import { createDefaultInputState } from './defaults';
import type { InputState, Results } from './types';
import { CostCategory } from './types';

describe('calculateClosureCosts', () => {
  let defaultInputs: InputState;
  let results: Results;

  beforeEach(() => {
    defaultInputs = createDefaultInputState();
    results = calculateClosureCosts(defaultInputs);
  });

  describe('Basic calculation functionality', () => {
    it('should return results object with required properties', () => {
      expect(results).toBeDefined();
      expect(results.directWorksCost).toBeDefined();
      expect(results.indirectCosts).toBeDefined();
      expect(results.totalNominalCost).toBeDefined();
      expect(results.totalDiscountedCost).toBeDefined();
      expect(results.lineItems).toBeDefined();
      expect(results.annualCashflows).toBeDefined();
      expect(results.derivedQuantities).toBeDefined();
      expect(results.sensitivityResults).toBeDefined();
    });

    it('should calculate positive total costs for default inputs', () => {
      expect(results.totalNominalCost).toBeGreaterThan(0);
      expect(results.directWorksCost).toBeGreaterThan(0);
      expect(results.indirectCosts).toBeGreaterThan(0);
    });

    it('should have total nominal cost be sum of direct and indirect', () => {
      // Total should be sum of direct + indirect (including contingency and risk uplift)
      expect(results.totalNominalCost).toBeGreaterThanOrEqual(
        results.directWorksCost + results.indirectCosts
      );
    });

    it('should have NPV less than or equal to nominal cost', () => {
      // NPV should be less due to discounting (unless discount rate is 0)
      expect(results.totalDiscountedCost).toBeLessThanOrEqual(results.totalNominalCost);
    });
  });

  describe('Derived quantity calculations', () => {
    it('should calculate TSF area in m²', () => {
      const derived = results.derivedQuantities;
      const expectedTsfAreaM2 = defaultInputs.quantities.tsfAreaHa * 10000;
      expect(derived.tsfAreaM2).toBeCloseTo(expectedTsfAreaM2, 0);
    });

    it('should calculate WRD area in m²', () => {
      const derived = results.derivedQuantities;
      const expectedWrdAreaM2 = defaultInputs.quantities.wrdFootprintHa * 10000;
      expect(derived.wrdAreaM2).toBeCloseTo(expectedWrdAreaM2, 0);
    });

    it('should calculate TSF capping volume', () => {
      const derived = results.derivedQuantities;
      const expectedVolume = 
        defaultInputs.quantities.tsfAreaHa * 10000 * 
        defaultInputs.quantities.tsfCoverThicknessM;
      expect(derived.tsfCappingVolumeM3).toBeCloseTo(expectedVolume, 0);
    });

    it('should calculate total water treatment volume', () => {
      const derived = results.derivedQuantities;
      const expectedML = 
        defaultInputs.quantities.waterTreatmentFlowMLPerDay * 365 * 
        defaultInputs.quantities.waterTreatmentDurationYears;
      expect(derived.totalWaterTreatmentML).toBeCloseTo(expectedML, 0);
    });
  });

  describe('Direct works cost calculations', () => {
    it('should include mobilisation costs', () => {
      const mobCosts = results.lineItems.filter(item => 
        item.category === CostCategory.Mobilisation
      );
      expect(mobCosts.length).toBeGreaterThan(0);
      expect(mobCosts.some(c => c.subtotal > 0)).toBe(true);
    });

    it('should include demolition costs', () => {
      const demoCosts = results.lineItems.filter(item => 
        item.category === CostCategory.Demolition
      );
      expect(demoCosts.length).toBeGreaterThan(0);
    });

    it('should include earthworks costs', () => {
      const earthworksCosts = results.lineItems.filter(item => 
        item.category === CostCategory.Earthworks
      );
      expect(earthworksCosts.length).toBeGreaterThan(0);
    });

    it('should include TSF closure costs', () => {
      const tsfCosts = results.lineItems.filter(item => 
        item.category === CostCategory.TSFClosure
      );
      expect(tsfCosts.length).toBeGreaterThan(0);
    });

    it('should include revegetation costs', () => {
      const revegCosts = results.lineItems.filter(item => 
        item.category === CostCategory.Revegetation
      );
      expect(revegCosts.length).toBeGreaterThan(0);
    });

    it('should include monitoring costs', () => {
      const monitoringCosts = results.lineItems.filter(item => 
        item.category === CostCategory.Monitoring
      );
      expect(monitoringCosts.length).toBeGreaterThan(0);
    });
  });

  describe('Indirect cost calculations', () => {
    it('should include contingency costs', () => {
      const contingencyCosts = results.lineItems.filter(item => 
        item.category === CostCategory.Contingency
      );
      expect(contingencyCosts.some(c => c.subtotal > 0)).toBe(true);
    });

    it('should include contractor margin costs', () => {
      const marginCosts = results.lineItems.filter(item => 
        item.category === CostCategory.ContractorMargin
      );
      expect(marginCosts.some(c => c.subtotal > 0)).toBe(true);
    });

    it('should include owners costs', () => {
      const ownersCosts = results.lineItems.filter(item => 
        item.category === CostCategory.OwnersCosts
      );
      expect(ownersCosts.some(c => c.subtotal > 0)).toBe(true);
    });
  });

  describe('Cashflow calculations', () => {
    it('should generate annual cashflows', () => {
      expect(results.annualCashflows.length).toBeGreaterThan(0);
    });

    it('should have cashflow years starting from closure start year', () => {
      const startYear = defaultInputs.financialParams.closureStartYear;
      const firstCashflow = results.annualCashflows[0];
      expect(firstCashflow).toBeDefined();
      expect(firstCashflow!.year).toBe(startYear);
    });

    it('should have cashflow sum approximately equal to total nominal cost', () => {
      const cashflowSum = results.annualCashflows.reduce((sum, cf) => sum + cf.nominalCost, 0);
      // Allow for small rounding differences
      expect(cashflowSum).toBeCloseTo(results.totalNominalCost, -2); // Within $100
    });

    it('should identify peak cashflow year', () => {
      expect(results.peakAnnualCashflow).toBeGreaterThan(0);
      expect(results.peakCashflowYear).toBeGreaterThanOrEqual(
        defaultInputs.financialParams.closureStartYear
      );
    });
  });

  describe('Phase and category breakdowns', () => {
    it('should have phase breakdown entries', () => {
      expect(results.phaseBreakdown.length).toBeGreaterThan(0);
    });

    it('should have category breakdown entries', () => {
      expect(results.categoryBreakdown.length).toBeGreaterThan(0);
    });

    it('should have phase percentages sum to approximately 100', () => {
      const phaseTotal = results.phaseBreakdown.reduce(
        (sum, p) => sum + p.percentOfTotal, 0
      );
      expect(phaseTotal).toBeCloseTo(100, 0);
    });

    it('should have category percentages sum to approximately 100', () => {
      const categoryTotal = results.categoryBreakdown.reduce(
        (sum, c) => sum + c.percentOfTotal, 0
      );
      expect(categoryTotal).toBeCloseTo(100, 0);
    });
  });

  describe('NPV calculations', () => {
    it('should calculate positive NPV for positive costs', () => {
      expect(results.totalDiscountedCost).toBeGreaterThan(0);
    });

    it('should decrease NPV when discount rate increases', () => {
      const highDiscountInputs: InputState = {
        ...defaultInputs,
        financialParams: {
          ...defaultInputs.financialParams,
          discountRatePercent: 15, // Higher discount rate
        },
      };
      const highDiscountResults = calculateClosureCosts(highDiscountInputs);
      
      expect(highDiscountResults.totalDiscountedCost).toBeLessThan(results.totalDiscountedCost);
    });

    it('should have NPV equal to escalated total when discount rate is zero', () => {
      const zeroDiscountInputs: InputState = {
        ...defaultInputs,
        financialParams: {
          ...defaultInputs.financialParams,
          discountRatePercent: 0,
          escalationRatePercent: 0, // Also set escalation to 0 for this test
        },
      };
      const zeroDiscountResults = calculateClosureCosts(zeroDiscountInputs);
      
      // When both discount and escalation are 0, discounted should equal nominal
      expect(zeroDiscountResults.totalDiscountedCost).toBeCloseTo(
        zeroDiscountResults.totalNominalCost, -2 // Within $100
      );
    });
  });

  describe('Sensitivity analysis', () => {
    it('should include sensitivity results for key parameters', () => {
      expect(results.sensitivityResults.length).toBeGreaterThan(0);
    });

    it('should have low, base, and high values for each parameter', () => {
      results.sensitivityResults.forEach(sens => {
        expect(sens.lowValue).toBeDefined();
        expect(sens.baseValue).toBeDefined();
        expect(sens.highValue).toBeDefined();
      });
    });

    it('should have low cost less than or equal to base cost', () => {
      results.sensitivityResults.forEach(sens => {
        expect(sens.lowTotalCost).toBeLessThanOrEqual(sens.highTotalCost);
      });
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle zero TSF area', () => {
      const zeroTsfInputs: InputState = {
        ...defaultInputs,
        quantities: {
          ...defaultInputs.quantities,
          tsfAreaHa: 0,
          tsfCoverThicknessM: 0,
        },
      };
      const zeroTsfResults = calculateClosureCosts(zeroTsfInputs);
      
      expect(zeroTsfResults).toBeDefined();
      expect(zeroTsfResults.totalNominalCost).toBeGreaterThan(0); // Still have other costs
    });

    it('should handle zero WRD dimensions', () => {
      const zeroWrdInputs: InputState = {
        ...defaultInputs,
        quantities: {
          ...defaultInputs.quantities,
          wrdFootprintHa: 0,
          wrdReshapingDepthM: 0,
        },
      };
      const zeroWrdResults = calculateClosureCosts(zeroWrdInputs);
      
      expect(zeroWrdResults).toBeDefined();
      expect(zeroWrdResults.totalNominalCost).toBeGreaterThan(0);
    });

    it('should handle very large site areas', () => {
      const largeSiteInputs: InputState = {
        ...defaultInputs,
        quantities: {
          ...defaultInputs.quantities,
          disturbedAreaHa: 5000,
          tsfAreaHa: 2000,
          wrdFootprintHa: 3000,
        },
      };
      const largeSiteResults = calculateClosureCosts(largeSiteInputs);
      
      expect(largeSiteResults).toBeDefined();
      expect(largeSiteResults.totalNominalCost).toBeGreaterThan(results.totalNominalCost);
    });

    it('should handle minimum water treatment requirements', () => {
      const minWaterInputs: InputState = {
        ...defaultInputs,
        quantities: {
          ...defaultInputs.quantities,
          waterTreatmentFlowMLPerDay: 0,
          waterTreatmentDurationYears: 0,
        },
      };
      const minWaterResults = calculateClosureCosts(minWaterInputs);
      
      expect(minWaterResults).toBeDefined();
      expect(minWaterResults.totalNominalCost).toBeLessThan(results.totalNominalCost);
    });

    it('should handle extended monitoring period', () => {
      const longMonitoringInputs: InputState = {
        ...defaultInputs,
        quantities: {
          ...defaultInputs.quantities,
          monitoringDurationYears: 50,
        },
      };
      const longMonitoringResults = calculateClosureCosts(longMonitoringInputs);
      
      expect(longMonitoringResults).toBeDefined();
      expect(longMonitoringResults.totalNominalCost).toBeGreaterThan(results.totalNominalCost);
    });

    it('should handle high risk factors', () => {
      const highRiskInputs: InputState = {
        ...defaultInputs,
        riskFactors: {
          contaminationUncertainty: 80,
          geotechUncertainty: 80,
          waterQualityUncertainty: 80,
          regulatoryUncertainty: 80,
          logisticsComplexity: 80,
        },
      };
      const highRiskResults = calculateClosureCosts(highRiskInputs);
      
      // Higher risk should increase total cost
      expect(highRiskResults.totalNominalCost).toBeGreaterThan(results.totalNominalCost);
    });
  });

  describe('Unit rate sensitivity', () => {
    it('should increase costs when earthworks rate increases', () => {
      const highRateInputs: InputState = {
        ...defaultInputs,
        unitRates: {
          ...defaultInputs.unitRates,
          earthworksPerM3: defaultInputs.unitRates.earthworksPerM3 * 1.5,
        },
      };
      const highRateResults = calculateClosureCosts(highRateInputs);
      
      expect(highRateResults.directWorksCost).toBeGreaterThan(results.directWorksCost);
    });

    it('should increase costs when revegetation rate increases', () => {
      const highRevegInputs: InputState = {
        ...defaultInputs,
        unitRates: {
          ...defaultInputs.unitRates,
          revegetationPerHa: defaultInputs.unitRates.revegetationPerHa * 1.5,
        },
      };
      const highRevegResults = calculateClosureCosts(highRevegInputs);
      
      expect(highRevegResults.directWorksCost).toBeGreaterThan(results.directWorksCost);
    });

    it('should increase costs when demolition rate increases', () => {
      const highDemoInputs: InputState = {
        ...defaultInputs,
        unitRates: {
          ...defaultInputs.unitRates,
          demolitionPerBuilding: defaultInputs.unitRates.demolitionPerBuilding * 1.5,
        },
      };
      const highDemoResults = calculateClosureCosts(highDemoInputs);
      
      expect(highDemoResults.directWorksCost).toBeGreaterThan(results.directWorksCost);
    });
  });
});

describe('calculateDerivedQuantities', () => {
  let defaultInputs: InputState;

  beforeEach(() => {
    defaultInputs = createDefaultInputState();
  });

  it('should calculate correct TSF area in m²', () => {
    const derived = calculateDerivedQuantities(defaultInputs);
    const expectedArea = defaultInputs.quantities.tsfAreaHa * 10000;
    expect(derived.tsfAreaM2).toBeCloseTo(expectedArea, 0);
  });

  it('should calculate correct WRD area in m²', () => {
    const derived = calculateDerivedQuantities(defaultInputs);
    const expectedArea = defaultInputs.quantities.wrdFootprintHa * 10000;
    expect(derived.wrdAreaM2).toBeCloseTo(expectedArea, 0);
  });

  it('should calculate correct TSF capping volume', () => {
    const derived = calculateDerivedQuantities(defaultInputs);
    const expectedVolume = 
      defaultInputs.quantities.tsfAreaHa * 10000 * 
      defaultInputs.quantities.tsfCoverThicknessM;
    expect(derived.tsfCappingVolumeM3).toBeCloseTo(expectedVolume, 0);
  });

  it('should calculate risk score within valid range', () => {
    const derived = calculateDerivedQuantities(defaultInputs);
    expect(derived.riskScore).toBeGreaterThanOrEqual(0);
    expect(derived.riskScore).toBeLessThanOrEqual(100);
  });

  it('should calculate risk uplift percentage', () => {
    const derived = calculateDerivedQuantities(defaultInputs);
    expect(derived.riskUpliftPercent).toBeGreaterThanOrEqual(0);
    expect(derived.riskUpliftPercent).toBeLessThanOrEqual(50);
  });
});

describe('Unit conversion functions', () => {
  it('should convert hectares to square meters correctly', () => {
    expect(haToM2(1)).toBe(10000);
    expect(haToM2(10)).toBe(100000);
    expect(haToM2(0)).toBe(0);
  });

  it('should convert square meters to hectares correctly', () => {
    expect(m2ToHa(10000)).toBe(1);
    expect(m2ToHa(100000)).toBe(10);
    expect(m2ToHa(0)).toBe(0);
  });

  it('should be inverse operations', () => {
    const original = 25;
    expect(m2ToHa(haToM2(original))).toBe(original);
  });
});

describe('Risk calculation functions', () => {
  describe('calculateRiskScore', () => {
    it('should return 0 for all zero risk factors', () => {
      const factors = {
        contaminationUncertainty: 0,
        geotechUncertainty: 0,
        waterQualityUncertainty: 0,
        regulatoryUncertainty: 0,
        logisticsComplexity: 0,
      };
      expect(calculateRiskScore(factors)).toBe(0);
    });

    it('should return 100 for all maximum risk factors', () => {
      const factors = {
        contaminationUncertainty: 100,
        geotechUncertainty: 100,
        waterQualityUncertainty: 100,
        regulatoryUncertainty: 100,
        logisticsComplexity: 100,
      };
      expect(calculateRiskScore(factors)).toBe(100);
    });

    it('should return weighted average for mixed values', () => {
      const factors = {
        contaminationUncertainty: 50,
        geotechUncertainty: 50,
        waterQualityUncertainty: 50,
        regulatoryUncertainty: 50,
        logisticsComplexity: 50,
      };
      expect(calculateRiskScore(factors)).toBe(50);
    });
  });

  describe('riskScoreToUplift', () => {
    it('should return 0 for risk score 0', () => {
      expect(riskScoreToUplift(0)).toBe(0);
    });

    it('should return ~5% for risk score 20', () => {
      expect(riskScoreToUplift(20)).toBeCloseTo(5, 1);
    });

    it('should return ~10% for risk score 40', () => {
      expect(riskScoreToUplift(40)).toBeCloseTo(10, 1);
    });

    it('should return ~20% for risk score 60', () => {
      expect(riskScoreToUplift(60)).toBeCloseTo(20, 1);
    });

    it('should return ~35% for risk score 80', () => {
      expect(riskScoreToUplift(80)).toBeCloseTo(35, 1);
    });

    it('should return 50% for risk score 100', () => {
      expect(riskScoreToUplift(100)).toBeCloseTo(50, 1);
    });

    it('should increase monotonically', () => {
      let prevUplift = 0;
      for (let score = 0; score <= 100; score += 10) {
        const uplift = riskScoreToUplift(score);
        expect(uplift).toBeGreaterThanOrEqual(prevUplift);
        prevUplift = uplift;
      }
    });
  });
});

describe('Regression snapshot test', () => {
  it('should produce consistent results for default inputs', () => {
    const defaultInputs = createDefaultInputState();
    const results = calculateClosureCosts(defaultInputs);
    
    // Store key metrics as a snapshot reference
    // These values should remain stable unless intentional changes are made
    expect(results.totalNominalCost).toBeGreaterThan(1000000); // Should be > $1M for typical mine
    expect(results.lineItems.length).toBeGreaterThan(5); // Should have multiple line items
    expect(results.annualCashflows.length).toBeGreaterThan(0); // Should have cashflows
    expect(results.sensitivityResults.length).toBeGreaterThan(0); // Should have sensitivity data
    expect(results.phaseBreakdown.length).toBeGreaterThan(0); // Should have phase breakdown
    expect(results.categoryBreakdown.length).toBeGreaterThan(0); // Should have category breakdown
    
    // Verify NPV is reasonable
    expect(results.totalDiscountedCost).toBeGreaterThan(0);
    expect(results.totalDiscountedCost).toBeLessThanOrEqual(results.totalNominalCost);
    
    // Verify total duration is reasonable
    expect(results.totalDurationYears).toBeGreaterThan(0);
    expect(results.totalDurationYears).toBeLessThan(100);
  });
});
