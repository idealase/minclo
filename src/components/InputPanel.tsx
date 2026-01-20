/**
 * Mine Closure Costing - Input Panel Component
 *
 * Left panel containing all input controls organized in collapsible sections.
 */

import { useCallback, useRef, type ChangeEvent } from 'react';
import { useAppState } from '../state';
import { SCENARIO_PRESETS, getPresetInputs, ClosurePhase, PHASE_NAMES } from '../domain';
import {
  SliderInput,
  CollapsibleSection,
  SelectInput,
  ToggleSwitch,
  type SelectOption,
} from '../ui';
import { downloadScenarioJSON } from '../utils/export';
import styles from './InputPanel.module.css';

const PRESET_OPTIONS: SelectOption[] = [
  { value: '', label: '— Select a preset —' },
  ...SCENARIO_PRESETS.map((p) => ({ value: p.id, label: p.name })),
];

const MONITORING_OPTIONS: SelectOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const DISCOUNT_MODE_OPTIONS: SelectOption[] = [
  { value: 'real', label: 'Real' },
  { value: 'nominal', label: 'Nominal' },
];

export function InputPanel(): React.ReactElement {
  const {
    state,
    setInputs,
    updateQuantities,
    updateUnitRates,
    updateIndirectRates,
    updateRiskFactors,
    updateFinancialParams,
    updatePhaseDurations,
    setScenarioName,
    saveScenario,
    loadScenario,
    deleteScenario,
    importScenario,
    resetToDefault,
  } = useAppState();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePresetChange = useCallback(
    (presetId: string) => {
      if (presetId) {
        const inputs = getPresetInputs(presetId);
        if (inputs) {
          setInputs(inputs);
        }
      }
    },
    [setInputs]
  );

  const handleFileImport = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result;
          if (typeof content === 'string') {
            importScenario(content);
          }
        };
        reader.readAsText(file);
      }
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [importScenario]
  );

  const { inputs, savedScenarios, error } = state;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Input Parameters</h2>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Scenario Management */}
      <CollapsibleSection title="Scenario Management" defaultExpanded={true}>
        <div className={styles.scenarioName}>
          <label className={styles.fieldLabel}>Scenario Name</label>
          <input
            type="text"
            className={styles.textInput}
            value={inputs.scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            placeholder="Enter scenario name"
          />
        </div>

        <SelectInput
          label="Load Preset"
          value=""
          options={PRESET_OPTIONS}
          onChange={handlePresetChange}
        />

        <div className={styles.buttonRow}>
          <button className={styles.button} onClick={saveScenario}>
            Save
          </button>
          <button className={styles.button} onClick={() => downloadScenarioJSON(inputs)}>
            Export JSON
          </button>
          <button
            className={styles.button}
            onClick={() => fileInputRef.current?.click()}
          >
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            style={{ display: 'none' }}
          />
        </div>

        {savedScenarios.length > 0 && (
          <div className={styles.savedScenarios}>
            <label className={styles.fieldLabel}>Saved Scenarios</label>
            {savedScenarios.map((scenario) => (
              <div key={scenario.id} className={styles.savedScenarioItem}>
                <span className={styles.savedScenarioName}>{scenario.name}</span>
                <div className={styles.savedScenarioActions}>
                  <button
                    className={styles.smallButton}
                    onClick={() => loadScenario(scenario.id)}
                  >
                    Load
                  </button>
                  <button
                    className={styles.smallButtonDanger}
                    onClick={() => deleteScenario(scenario.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className={styles.buttonOutline} onClick={resetToDefault}>
          Reset to Defaults
        </button>
      </CollapsibleSection>

      {/* Direct Works Quantities */}
      <CollapsibleSection title="Site Areas & Quantities" defaultExpanded={true}>
        <SliderInput
          label="Disturbed Area"
          value={inputs.quantities.disturbedAreaHa}
          min={0}
          max={5000}
          step={10}
          unit="ha"
          tooltip="Total area requiring rehabilitation including all disturbed land"
          onChange={(v) => updateQuantities({ disturbedAreaHa: v })}
        />
        <SliderInput
          label="TSF Area"
          value={inputs.quantities.tsfAreaHa}
          min={0}
          max={1000}
          step={5}
          unit="ha"
          tooltip="Tailings Storage Facility footprint area"
          onChange={(v) => updateQuantities({ tsfAreaHa: v })}
        />
        <SliderInput
          label="TSF Cover Thickness"
          value={inputs.quantities.tsfCoverThicknessM}
          min={0.1}
          max={2}
          step={0.1}
          unit="m"
          tooltip="Thickness of cover/cap material for TSF"
          onChange={(v) => updateQuantities({ tsfCoverThicknessM: v })}
        />
        <SliderInput
          label="WRD Footprint"
          value={inputs.quantities.wrdFootprintHa}
          min={0}
          max={2000}
          step={10}
          unit="ha"
          tooltip="Waste Rock Dump footprint area"
          onChange={(v) => updateQuantities({ wrdFootprintHa: v })}
        />
        <SliderInput
          label="WRD Reshaping Depth"
          value={inputs.quantities.wrdReshapingDepthM}
          min={0.1}
          max={5}
          step={0.1}
          unit="m"
          tooltip="Average depth of WRD reshaping works"
          onChange={(v) => updateQuantities({ wrdReshapingDepthM: v })}
        />
        <SliderInput
          label="Recontouring Area"
          value={inputs.quantities.recontouringAreaHa}
          min={0}
          max={2000}
          step={10}
          unit="ha"
          tooltip="Area requiring recontouring and landform reshaping"
          onChange={(v) => updateQuantities({ recontouringAreaHa: v })}
        />
        <SliderInput
          label="Topsoil Thickness"
          value={inputs.quantities.topsoilThicknessM}
          min={0.05}
          max={0.5}
          step={0.01}
          unit="m"
          tooltip="Thickness of topsoil to be placed"
          onChange={(v) => updateQuantities({ topsoilThicknessM: v })}
        />
      </CollapsibleSection>

      {/* Infrastructure */}
      <CollapsibleSection title="Infrastructure" defaultExpanded={false}>
        <SliderInput
          label="Number of Buildings"
          value={inputs.quantities.numberOfBuildings}
          min={0}
          max={100}
          step={1}
          unit="count"
          tooltip="Number of buildings/structures requiring demolition"
          onChange={(v) => updateQuantities({ numberOfBuildings: Math.round(v) })}
        />
        <SliderInput
          label="Road Length"
          value={inputs.quantities.roadLengthKm}
          min={0}
          max={100}
          step={1}
          unit="km"
          tooltip="Total length of roads requiring rehabilitation"
          onChange={(v) => updateQuantities({ roadLengthKm: v })}
        />
      </CollapsibleSection>

      {/* Water Management */}
      <CollapsibleSection title="Water Management" defaultExpanded={false}>
        <SliderInput
          label="Treatment Flow Rate"
          value={inputs.quantities.waterTreatmentFlowMLPerDay}
          min={0}
          max={50}
          step={0.5}
          unit="ML/day"
          tooltip="Required water treatment capacity"
          onChange={(v) => updateQuantities({ waterTreatmentFlowMLPerDay: v })}
        />
        <SliderInput
          label="Treatment Duration"
          value={inputs.quantities.waterTreatmentDurationYears}
          min={0}
          max={50}
          step={1}
          unit="years"
          tooltip="Duration of water treatment operations"
          onChange={(v) => updateQuantities({ waterTreatmentDurationYears: Math.round(v) })}
        />
        <SliderInput
          label="Treatment Intensity"
          value={inputs.quantities.waterTreatmentIntensityFactor}
          min={0.5}
          max={2.5}
          step={0.1}
          unit="factor"
          tooltip="Treatment complexity factor (0.5=simple, 1.0=standard, 2.0+=complex)"
          onChange={(v) => updateQuantities({ waterTreatmentIntensityFactor: v })}
        />
      </CollapsibleSection>

      {/* Monitoring */}
      <CollapsibleSection title="Monitoring & Compliance" defaultExpanded={false}>
        <SliderInput
          label="Monitoring Duration"
          value={inputs.quantities.monitoringDurationYears}
          min={5}
          max={50}
          step={1}
          unit="years"
          tooltip="Duration of environmental monitoring program"
          onChange={(v) => updateQuantities({ monitoringDurationYears: Math.round(v) })}
        />
        <SelectInput
          label="Monitoring Intensity"
          value={inputs.quantities.monitoringIntensity}
          options={MONITORING_OPTIONS}
          onChange={(v) =>
            updateQuantities({ monitoringIntensity: v as 'low' | 'medium' | 'high' })
          }
        />
        <ToggleSwitch
          label="Hazardous Materials Handling"
          checked={inputs.quantities.hazardousMaterialsEnabled}
          onChange={(v) => updateQuantities({ hazardousMaterialsEnabled: v })}
        />
        {inputs.quantities.hazardousMaterialsEnabled && (
          <SliderInput
            label="Hazardous Materials Area"
            value={inputs.quantities.hazardousMaterialsAreaHa}
            min={0}
            max={100}
            step={1}
            unit="ha"
            tooltip="Area requiring hazardous materials remediation"
            onChange={(v) => updateQuantities({ hazardousMaterialsAreaHa: v })}
          />
        )}
        <ToggleSwitch
          label="Community/Heritage Management"
          checked={inputs.quantities.communityHeritageEnabled}
          onChange={(v) => updateQuantities({ communityHeritageEnabled: v })}
        />
      </CollapsibleSection>

      {/* Unit Rates */}
      <CollapsibleSection title="Unit Rates" defaultExpanded={false}>
        <SliderInput
          label="Earthworks Rate"
          value={inputs.unitRates.earthworksPerM3}
          min={2}
          max={30}
          step={0.5}
          unit="$/m³"
          tooltip="Cost per cubic meter for general earthworks"
          onChange={(v) => updateUnitRates({ earthworksPerM3: v })}
        />
        <SliderInput
          label="Capping Base Rate"
          value={inputs.unitRates.cappingBasePerM2}
          min={5}
          max={100}
          step={1}
          unit="$/m²"
          tooltip="Base cost per square meter for capping"
          onChange={(v) => updateUnitRates({ cappingBasePerM2: v })}
        />
        <SliderInput
          label="Topsoil Rate"
          value={inputs.unitRates.topsoilPerM3}
          min={5}
          max={50}
          step={1}
          unit="$/m³"
          tooltip="Cost per cubic meter for topsoil placement"
          onChange={(v) => updateUnitRates({ topsoilPerM3: v })}
        />
        <SliderInput
          label="Revegetation Rate"
          value={inputs.unitRates.revegetationPerHa}
          min={2000}
          max={30000}
          step={500}
          unit="$/ha"
          tooltip="Cost per hectare for revegetation works"
          onChange={(v) => updateUnitRates({ revegetationPerHa: v })}
        />
        <SliderInput
          label="Demolition Rate"
          value={inputs.unitRates.demolitionPerBuilding}
          min={20000}
          max={500000}
          step={10000}
          unit="$/building"
          tooltip="Average cost per building for demolition"
          onChange={(v) => updateUnitRates({ demolitionPerBuilding: v })}
        />
        <SliderInput
          label="Road Rehab Rate"
          value={inputs.unitRates.roadRehabPerKm}
          min={10000}
          max={200000}
          step={5000}
          unit="$/km"
          tooltip="Cost per kilometer for road rehabilitation"
          onChange={(v) => updateUnitRates({ roadRehabPerKm: v })}
        />
        <SliderInput
          label="Water Treatment Capex"
          value={inputs.unitRates.waterTreatmentCapex}
          min={100000}
          max={50000000}
          step={100000}
          unit="$"
          tooltip="Capital cost for water treatment plant"
          onChange={(v) => updateUnitRates({ waterTreatmentCapex: v })}
        />
        <SliderInput
          label="Water Treatment Opex"
          value={inputs.unitRates.waterTreatmentOpexPerML}
          min={100}
          max={2000}
          step={50}
          unit="$/ML"
          tooltip="Operating cost per megalitre treated"
          onChange={(v) => updateUnitRates({ waterTreatmentOpexPerML: v })}
        />
        <SliderInput
          label="Bulking Factor"
          value={inputs.unitRates.bulkingFactor}
          min={1.0}
          max={1.5}
          step={0.05}
          unit="factor"
          tooltip="Volume increase factor for disturbed material"
          onChange={(v) => updateUnitRates({ bulkingFactor: v })}
        />
      </CollapsibleSection>

      {/* Indirect Costs */}
      <CollapsibleSection title="Indirect Costs & Margins" defaultExpanded={false}>
        <SliderInput
          label="Site Establishment"
          value={inputs.indirectRates.siteEstablishmentPercent}
          min={5}
          max={25}
          step={0.5}
          unit="% of direct"
          tooltip="Site establishment, HSE, and project management"
          onChange={(v) => updateIndirectRates({ siteEstablishmentPercent: v })}
        />
        <SliderInput
          label="Contractor Margin"
          value={inputs.indirectRates.contractorMarginPercent}
          min={5}
          max={20}
          step={0.5}
          unit="%"
          tooltip="Contractor margin on direct works"
          onChange={(v) => updateIndirectRates({ contractorMarginPercent: v })}
        />
        <SliderInput
          label="Base Contingency"
          value={inputs.indirectRates.contingencyPercent}
          min={5}
          max={35}
          step={1}
          unit="%"
          tooltip="Base contingency allowance"
          onChange={(v) => updateIndirectRates({ contingencyPercent: v })}
        />
        <SliderInput
          label="Owner's Costs"
          value={inputs.indirectRates.ownersCostsPercent}
          min={0}
          max={15}
          step={0.5}
          unit="%"
          tooltip="Owner's costs and overheads"
          onChange={(v) => updateIndirectRates({ ownersCostsPercent: v })}
        />
      </CollapsibleSection>

      {/* Risk Factors */}
      <CollapsibleSection title="Risk Assessment" defaultExpanded={false}>
        <p className={styles.sectionHint}>
          Risk factors (0-100) determine additional contingency uplift
        </p>
        <SliderInput
          label="Contamination Uncertainty"
          value={inputs.riskFactors.contaminationUncertainty}
          min={0}
          max={100}
          step={5}
          unit="/100"
          tooltip="Uncertainty about legacy contamination extent"
          onChange={(v) => updateRiskFactors({ contaminationUncertainty: v })}
        />
        <SliderInput
          label="Geotechnical Uncertainty"
          value={inputs.riskFactors.geotechUncertainty}
          min={0}
          max={100}
          step={5}
          unit="/100"
          tooltip="Uncertainty about geotechnical stability"
          onChange={(v) => updateRiskFactors({ geotechUncertainty: v })}
        />
        <SliderInput
          label="Water Quality Uncertainty"
          value={inputs.riskFactors.waterQualityUncertainty}
          min={0}
          max={100}
          step={5}
          unit="/100"
          tooltip="Uncertainty about long-term water quality"
          onChange={(v) => updateRiskFactors({ waterQualityUncertainty: v })}
        />
        <SliderInput
          label="Regulatory Uncertainty"
          value={inputs.riskFactors.regulatoryUncertainty}
          min={0}
          max={100}
          step={5}
          unit="/100"
          tooltip="Uncertainty about regulatory requirements"
          onChange={(v) => updateRiskFactors({ regulatoryUncertainty: v })}
        />
        <SliderInput
          label="Logistics Complexity"
          value={inputs.riskFactors.logisticsComplexity}
          min={0}
          max={100}
          step={5}
          unit="/100"
          tooltip="Complexity due to remote location or access"
          onChange={(v) => updateRiskFactors({ logisticsComplexity: v })}
        />
      </CollapsibleSection>

      {/* Financial Parameters */}
      <CollapsibleSection title="Financial Parameters" defaultExpanded={false}>
        <SliderInput
          label="Closure Start Year"
          value={inputs.financialParams.closureStartYear}
          min={2024}
          max={2050}
          step={1}
          unit="year"
          tooltip="Year when closure activities commence"
          onChange={(v) => updateFinancialParams({ closureStartYear: Math.round(v) })}
        />
        <SliderInput
          label="Escalation Rate"
          value={inputs.financialParams.escalationRatePercent}
          min={0}
          max={10}
          step={0.25}
          unit="% p.a."
          tooltip="Annual cost escalation rate (inflation)"
          onChange={(v) => updateFinancialParams({ escalationRatePercent: v })}
        />
        <SliderInput
          label="Discount Rate"
          value={inputs.financialParams.discountRatePercent}
          min={0}
          max={15}
          step={0.25}
          unit="% p.a."
          tooltip="Discount rate for NPV calculation"
          onChange={(v) => updateFinancialParams({ discountRatePercent: v })}
        />
        <SelectInput
          label="Discount Rate Mode"
          value={inputs.financialParams.discountRateMode}
          options={DISCOUNT_MODE_OPTIONS}
          onChange={(v) =>
            updateFinancialParams({ discountRateMode: v as 'real' | 'nominal' })
          }
        />
      </CollapsibleSection>

      {/* Phase Durations */}
      <CollapsibleSection title="Phase Durations" defaultExpanded={false}>
        <p className={styles.sectionHint}>
          Configure the duration (in years) for each closure phase
        </p>
        <SliderInput
          label={PHASE_NAMES[ClosurePhase.PlanningApprovals]}
          value={inputs.phaseDurations[ClosurePhase.PlanningApprovals]}
          min={0}
          max={5}
          step={1}
          unit="years"
          onChange={(v) =>
            updatePhaseDurations({ [ClosurePhase.PlanningApprovals]: Math.round(v) })
          }
        />
        <SliderInput
          label={PHASE_NAMES[ClosurePhase.DecommissioningDemolition]}
          value={inputs.phaseDurations[ClosurePhase.DecommissioningDemolition]}
          min={0}
          max={5}
          step={1}
          unit="years"
          onChange={(v) =>
            updatePhaseDurations({ [ClosurePhase.DecommissioningDemolition]: Math.round(v) })
          }
        />
        <SliderInput
          label={PHASE_NAMES[ClosurePhase.EarthworksLandform]}
          value={inputs.phaseDurations[ClosurePhase.EarthworksLandform]}
          min={0}
          max={10}
          step={1}
          unit="years"
          onChange={(v) =>
            updatePhaseDurations({ [ClosurePhase.EarthworksLandform]: Math.round(v) })
          }
        />
        <SliderInput
          label={PHASE_NAMES[ClosurePhase.TailingsWRDRehabilitation]}
          value={inputs.phaseDurations[ClosurePhase.TailingsWRDRehabilitation]}
          min={0}
          max={10}
          step={1}
          unit="years"
          onChange={(v) =>
            updatePhaseDurations({ [ClosurePhase.TailingsWRDRehabilitation]: Math.round(v) })
          }
        />
        <SliderInput
          label={PHASE_NAMES[ClosurePhase.WaterManagement]}
          value={inputs.phaseDurations[ClosurePhase.WaterManagement]}
          min={0}
          max={50}
          step={1}
          unit="years"
          onChange={(v) =>
            updatePhaseDurations({ [ClosurePhase.WaterManagement]: Math.round(v) })
          }
        />
        <SliderInput
          label={PHASE_NAMES[ClosurePhase.RevegetationEcosystem]}
          value={inputs.phaseDurations[ClosurePhase.RevegetationEcosystem]}
          min={0}
          max={10}
          step={1}
          unit="years"
          onChange={(v) =>
            updatePhaseDurations({ [ClosurePhase.RevegetationEcosystem]: Math.round(v) })
          }
        />
        <SliderInput
          label={PHASE_NAMES[ClosurePhase.MonitoringMaintenance]}
          value={inputs.phaseDurations[ClosurePhase.MonitoringMaintenance]}
          min={5}
          max={50}
          step={1}
          unit="years"
          onChange={(v) =>
            updatePhaseDurations({ [ClosurePhase.MonitoringMaintenance]: Math.round(v) })
          }
        />
        <SliderInput
          label={PHASE_NAMES[ClosurePhase.RelinquishmentPostClosure]}
          value={inputs.phaseDurations[ClosurePhase.RelinquishmentPostClosure]}
          min={0}
          max={5}
          step={1}
          unit="years"
          onChange={(v) =>
            updatePhaseDurations({ [ClosurePhase.RelinquishmentPostClosure]: Math.round(v) })
          }
        />
      </CollapsibleSection>
    </div>
  );
}
