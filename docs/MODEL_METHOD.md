# Mine Closure Costing - Model Methodology

This document describes the calculation methodology, formulas, and assumptions used in the Mine Closure Costing Tool.

## Table of Contents

1. [Overview](#overview)
2. [Calculation Architecture](#calculation-architecture)
3. [Derived Quantities](#derived-quantities)
4. [Direct Works Costs](#direct-works-costs)
5. [Indirect Costs](#indirect-costs)
6. [Contingency Calculation](#contingency-calculation)
7. [Cashflow Generation](#cashflow-generation)
8. [NPV Calculation](#npv-calculation)
9. [Sensitivity Analysis](#sensitivity-analysis)
10. [Default Values and Assumptions](#default-values-and-assumptions)
11. [Limitations](#limitations)

---

## Overview

The Mine Closure Costing Tool uses a **parametric estimation approach** to calculate mine closure costs. This methodology:

- Uses physical quantities (areas, volumes) as primary cost drivers
- Applies unit rates to calculate individual cost items
- Aggregates costs by category and phase
- Distributes costs over time to generate cashflows
- Calculates NPV using standard discounting

The model is **deterministic** - given the same inputs, it will always produce the same outputs.

---

## Calculation Architecture

```
┌─────────────────┐
│  User Inputs    │
│  (InputState)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Derived         │
│ Quantities      │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│Direct │ │Indirect│
│Works  │ │Costs   │
└───┬───┘ └───┬───┘
    │         │
    └────┬────┘
         ▼
┌─────────────────┐
│ Contingency     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Cashflow        │
│ Distribution    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ NPV &           │
│ Sensitivity     │
└─────────────────┘
```

---

## Derived Quantities

Physical quantities are derived from user inputs before cost calculations:

### Pit Volume
```
pitVolume_m³ = pitArea_ha × 10,000 × pitDepth_m
```

### Waste Rock Dump (WRD) Volume
```
wrdVolume_m³ = wrdArea_ha × 10,000 × wrdHeight_m
```

### Tailings Storage Facility (TSF) Volume
```
tsfVolume_m³ = tsfArea_ha × 10,000 × tsfDepth_m
```

### Total Disturbed Area
```
totalDisturbedArea_ha = pitArea_ha + wrdArea_ha + tsfArea_ha + 
                        infraArea_ha + haulsRoadsArea_ha
```

### Total Closure Duration
```
totalClosureDuration_years = decommissioningDuration + demolitionDuration + 
                             earthworksDuration + revegetationDuration + 
                             monitoringYears
```

---

## Direct Works Costs

### 1. Pit Closure Costs

#### Pit Lake Management
For pits that will form a pit lake (passive closure strategy):
```
pitLakeCost = pitArea_ha × pitLakeManagementRate_$/ha
```

Default: $5,000/ha for pit lake monitoring and management infrastructure.

#### Pit Bunding/Fencing
Safety bunding around pit perimeter:
```
pitPerimeter_m = 2 × √(π × pitArea_ha × 10,000)  // Approximate circular perimeter
pitBundingCost = pitPerimeter_m × bundingRate_$/m
```

Default bunding rate: $150/m for earthen safety bunds.

### 2. Waste Rock Dump (WRD) Rehabilitation

#### WRD Reshaping
Earthworks to achieve stable slopes:
```
reshapeVolume_m³ = wrdArea_ha × 10,000 × reshapeDepth_m × reshapeFactor
wrdReshapingCost = reshapeVolume_m³ × earthworksRate_$/m³
```

Where:
- `reshapeDepth_m` = average cut/fill depth (default: 0.5m)
- `reshapeFactor` = proportion of area requiring reshaping (default: 0.3)

#### WRD Cover System
Soil cover and drainage layer:
```
wrdCoverCost = wrdArea_ha × coverSystemRate_$/ha
```

Default cover system rate: $25,000/ha (includes growth medium, drainage layer, topsoil).

#### WRD Revegetation
```
wrdRevegCost = wrdArea_ha × revegetationRate_$/ha
```

### 3. Tailings Storage Facility (TSF) Closure

#### TSF Dewatering
```
dewaterVolume_ML = tsfArea_ha × tsfDepth_m × 10 × moistureContent
dewateringCost = dewaterVolume_ML × dewateringRate_$/ML
```

Where `moistureContent` = 0.3 (30% water content assumption).

#### TSF Capping
```
tsfCappingCost = tsfArea_ha × tsfCappingRate_$/ha
```

Default capping rate: $50,000/ha (engineered cover system with multiple layers).

#### TSF Revegetation
```
tsfRevegCost = tsfArea_ha × revegetationRate_$/ha
```

### 4. Infrastructure Demolition

#### Building Demolition
```
buildingFootprint_m² = numberOfBuildings × avgBuildingSize_m²
demolitionCost = buildingFootprint_m² × demolitionRate_$/m²
```

Default average building size: 500 m².

#### Site Clearance
Removal of hardstands, concrete pads, and miscellaneous infrastructure:
```
siteClearanceCost = infraArea_ha × siteClearanceRate_$/ha
```

### 5. Roads and Access

#### Haul Road Rehabilitation
```
haulRoadRehabCost = haulsRoadsArea_ha × roadRehabRate_$/ha
```

Default: $15,000/ha for ripping, drainage, and revegetation.

### 6. Water Management

#### Treatment Plant Capital
```
waterTreatmentCapex = waterTreatment_ML_day × waterTreatmentCapexRate_$/ML/day
```

#### Treatment Operating Costs
```
annualTreatmentVolume_ML = waterTreatment_ML_day × 365
waterTreatmentOpex = annualTreatmentVolume_ML × waterTreatmentOpexRate_$/ML × waterTreatmentYears
```

### 7. Revegetation

General area revegetation (excluding specific facilities):
```
generalRevegArea_ha = infraArea_ha + haulsRoadsArea_ha
generalRevegCost = generalRevegArea_ha × revegetationRate_$/ha
```

### 8. Environmental Monitoring

```
monitoringCost = monitoringRate_$/year × monitoringYears
```

Includes:
- Groundwater monitoring
- Surface water quality
- Air quality
- Flora and fauna surveys
- Geotechnical inspections

---

## Indirect Costs

### Project Management
```
projectManagementCost = totalDirectCosts × projectManagementPct / 100
```

Default: 8% of direct costs.

### Engineering, Procurement, Construction Management (EPCM)
```
epcmCost = totalDirectCosts × epcmPct / 100
```

Default: 12% of direct costs.

### Environmental Studies & Approvals
```
environmentalCost = totalDirectCosts × environmentalPct / 100
```

Default: 5% of direct costs (includes closure plan updates, EIA amendments, regulatory approvals).

### Stakeholder Engagement
```
stakeholderCost = totalDirectCosts × stakeholderPct / 100
```

Default: 2% of direct costs.

---

## Contingency Calculation

```
contingency = (totalDirectCosts + totalIndirectCosts) × contingencyPct / 100
```

Default contingency: 20%

Contingency covers:
- Quantity uncertainty
- Rate uncertainty
- Unforeseen conditions
- Market fluctuations
- Schedule risk

---

## Cashflow Generation

Costs are distributed across closure phases based on activity timing:

### Closure Phases

| Phase | Typical Duration | Activities |
|-------|------------------|------------|
| Decommissioning | 1-2 years | Equipment removal, dewatering |
| Demolition | 1-2 years | Building demolition, site clearance |
| Earthworks | 2-5 years | Reshaping, capping, drainage |
| Revegetation | 1-3 years | Seeding, planting, soil preparation |
| Monitoring | 5-30 years | Environmental monitoring, maintenance |
| Post-closure | 10+ years | Long-term stewardship |

### Phase Cost Allocation

Each cost item is assigned to a phase based on its nature:

| Cost Category | Primary Phase |
|---------------|---------------|
| Pit closure | Earthworks |
| WRD reshaping | Earthworks |
| WRD cover/revegetation | Revegetation |
| TSF dewatering | Decommissioning |
| TSF capping | Earthworks |
| Demolition | Demolition |
| Water treatment CapEx | Decommissioning |
| Water treatment OpEx | Monitoring |
| Environmental monitoring | Monitoring |

### Annual Distribution

Costs within each phase are distributed evenly across the phase duration:
```
annualCost_phase = totalPhaseCost / phaseDuration_years
```

---

## NPV Calculation

Net Present Value is calculated using standard discounting:

```
NPV = Σ (cashflow_year_n / (1 + r)^n)
```

Where:
- `cashflow_year_n` = total cost in year n
- `r` = discount rate (expressed as decimal)
- `n` = year number (1, 2, 3, ...)

### Discount Rate Selection

Default: 7% (real, pre-tax)

Considerations for rate selection:
- Government bond rate + risk premium
- Corporate cost of capital
- Project-specific risk factors
- Regulatory requirements

---

## Sensitivity Analysis

The tool calculates cost sensitivity to key parameters by varying each ±20% from base value:

### Sensitivity Calculation
```
lowValue = baseResult × parameterValue × 0.8 / baseParameterValue
highValue = baseResult × parameterValue × 1.2 / baseParameterValue
```

### Parameters Analyzed

1. Pit Area
2. WRD Area
3. TSF Area
4. Earthworks Rate
5. Revegetation Rate
6. Demolition Rate
7. Water Treatment Duration
8. Contingency %
9. EPCM %
10. Discount Rate (for NPV)

### Tornado Chart

Results are displayed as a tornado diagram showing:
- Base value (center line)
- Low estimate (left bar)
- High estimate (right bar)
- Sorted by impact magnitude

---

## Default Values and Assumptions

### Unit Rates

| Parameter | Default Value | Unit | Source/Basis |
|-----------|---------------|------|--------------|
| Earthworks | $15 | /m³ | Industry average for bulk earthmoving |
| Revegetation | $25,000 | /ha | Full revegetation including soil prep |
| Demolition | $150 | /m² | Building demolition and disposal |
| Cover system | $25,000 | /ha | WRD cover with drainage |
| TSF capping | $50,000 | /ha | Engineered multi-layer cap |
| Water treatment CapEx | $2,000,000 | /ML/day | Treatment plant capital |
| Water treatment OpEx | $500 | /ML | Operating cost per ML |
| Monitoring | $250,000 | /year | Comprehensive environmental monitoring |

### Percentage Rates

| Parameter | Default | Range |
|-----------|---------|-------|
| Project Management | 8% | 5-15% |
| EPCM | 12% | 8-18% |
| Environmental | 5% | 3-8% |
| Stakeholder | 2% | 1-5% |
| Contingency | 20% | 10-35% |

### Phase Durations

| Phase | Default Duration |
|-------|------------------|
| Decommissioning | 1 year |
| Demolition | 1 year |
| Earthworks | 2 years |
| Revegetation | 2 years |
| Monitoring | 10 years |

---

## Limitations

### Model Limitations

1. **Simplified Geometry**: Uses area-based calculations; does not account for complex topography

2. **Linear Scaling**: Assumes costs scale linearly with area/volume; economies of scale not modeled

3. **Deterministic**: Single-point estimates only; no probabilistic analysis

4. **Generic Rates**: Default rates are generic; site-specific rates should be used where available

5. **No Regional Factors**: Does not adjust for regional cost differences, remoteness, or labor availability

6. **Static Rates**: Does not account for inflation or commodity price fluctuations

### Usage Recommendations

1. **Use as Screening Tool**: Appropriate for early-stage estimates and comparative analysis

2. **Validate Rates**: Replace default rates with site-specific data where available

3. **Professional Review**: Results should be reviewed by qualified closure specialists

4. **Update Regularly**: Re-run estimates as project develops and better data becomes available

5. **Consider Uncertainty**: Use sensitivity analysis to understand estimate uncertainty

### Accuracy Classification

Per AACE International Cost Estimate Classification:
- **Class 5 estimate** (Concept Screening): Expected accuracy -30% to +50%

This tool is appropriate for:
- Feasibility studies
- Strategic planning
- Comparative analysis
- Stakeholder discussions

Not appropriate for:
- Detailed closure plans
- Financial provisioning
- Bonding calculations
- Contract pricing

---

## References

1. ICMM (2019). *Integrated Mine Closure: Good Practice Guide*. 2nd Edition.
2. DIIS (2016). *Leading Practice Sustainable Development Program for the Mining Industry: Mine Closure*.
3. AACE International (2020). *Cost Estimate Classification System*.
4. GARD Guide (2014). *Global Acid Rock Drainage Guide*.

---

*Document Version: 1.0*
*Last Updated: 2024*
