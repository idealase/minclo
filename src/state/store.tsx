/**
 * Mine Closure Costing - Application State Store
 *
 * React-based state management using Context and hooks.
 * Provides centralized state with automatic recalculation on input changes.
 */

/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  InputState,
  Results,
  SavedScenario,
  CurrencyConfig,
  DirectWorksQuantities,
  UnitRates,
  IndirectCostRates,
  RiskFactors,
  FinancialParams,
  PhaseDurations,
} from '../domain/types';
import { calculateClosureCosts, createDefaultInputState, DEFAULT_CURRENCY } from '../domain';
import { generateId, deepClone } from '../utils/formatting';
import { importScenarioJSON } from '../utils/export';

// ============================================================================
// State Types
// ============================================================================

interface AppState {
  inputs: InputState;
  results: Results | null;
  isCalculating: boolean;
  savedScenarios: SavedScenario[];
  currency: CurrencyConfig;
  error: string | null;
}

type AppAction =
  | { type: 'SET_INPUTS'; payload: InputState }
  | { type: 'UPDATE_QUANTITIES'; payload: Partial<DirectWorksQuantities> }
  | { type: 'UPDATE_UNIT_RATES'; payload: Partial<UnitRates> }
  | { type: 'UPDATE_INDIRECT_RATES'; payload: Partial<IndirectCostRates> }
  | { type: 'UPDATE_RISK_FACTORS'; payload: Partial<RiskFactors> }
  | { type: 'UPDATE_FINANCIAL_PARAMS'; payload: Partial<FinancialParams> }
  | { type: 'UPDATE_PHASE_DURATIONS'; payload: Partial<PhaseDurations> }
  | { type: 'SET_SCENARIO_NAME'; payload: string }
  | { type: 'SET_RESULTS'; payload: Results }
  | { type: 'SET_CALCULATING'; payload: boolean }
  | { type: 'SAVE_SCENARIO' }
  | { type: 'LOAD_SCENARIO'; payload: string }
  | { type: 'DELETE_SCENARIO'; payload: string }
  | { type: 'IMPORT_SCENARIO'; payload: string }
  | { type: 'SET_CURRENCY'; payload: CurrencyConfig }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_TO_DEFAULT' };

// ============================================================================
// Local Storage Keys
// ============================================================================

const STORAGE_KEY_SCENARIOS = 'mine-closure-costing-scenarios';
const STORAGE_KEY_CURRENT = 'mine-closure-costing-current';

// ============================================================================
// Local Storage Helpers
// ============================================================================

function loadSavedScenarios(): SavedScenario[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SCENARIOS);
    if (stored) {
      return JSON.parse(stored) as SavedScenario[];
    }
  } catch {
    console.warn('Failed to load saved scenarios');
  }
  return [];
}

function saveScenariosToStorage(scenarios: SavedScenario[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SCENARIOS, JSON.stringify(scenarios));
  } catch {
    console.warn('Failed to save scenarios');
  }
}

function loadCurrentInputs(): InputState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CURRENT);
    if (stored) {
      return JSON.parse(stored) as InputState;
    }
  } catch {
    console.warn('Failed to load current inputs');
  }
  return null;
}

function saveCurrentInputs(inputs: InputState): void {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(inputs));
  } catch {
    console.warn('Failed to save current inputs');
  }
}

// ============================================================================
// Reducer
// ============================================================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_INPUTS':
      return { ...state, inputs: action.payload, error: null };

    case 'UPDATE_QUANTITIES':
      return {
        ...state,
        inputs: {
          ...state.inputs,
          quantities: { ...state.inputs.quantities, ...action.payload },
        },
        error: null,
      };

    case 'UPDATE_UNIT_RATES':
      return {
        ...state,
        inputs: {
          ...state.inputs,
          unitRates: { ...state.inputs.unitRates, ...action.payload },
        },
        error: null,
      };

    case 'UPDATE_INDIRECT_RATES':
      return {
        ...state,
        inputs: {
          ...state.inputs,
          indirectRates: { ...state.inputs.indirectRates, ...action.payload },
        },
        error: null,
      };

    case 'UPDATE_RISK_FACTORS':
      return {
        ...state,
        inputs: {
          ...state.inputs,
          riskFactors: { ...state.inputs.riskFactors, ...action.payload },
        },
        error: null,
      };

    case 'UPDATE_FINANCIAL_PARAMS':
      return {
        ...state,
        inputs: {
          ...state.inputs,
          financialParams: { ...state.inputs.financialParams, ...action.payload },
        },
        error: null,
      };

    case 'UPDATE_PHASE_DURATIONS':
      return {
        ...state,
        inputs: {
          ...state.inputs,
          phaseDurations: { ...state.inputs.phaseDurations, ...action.payload },
        },
        error: null,
      };

    case 'SET_SCENARIO_NAME':
      return {
        ...state,
        inputs: { ...state.inputs, scenarioName: action.payload },
      };

    case 'SET_RESULTS':
      return { ...state, results: action.payload, isCalculating: false };

    case 'SET_CALCULATING':
      return { ...state, isCalculating: action.payload };

    case 'SAVE_SCENARIO': {
      const newScenario: SavedScenario = {
        id: generateId(),
        name: state.inputs.scenarioName,
        savedAt: new Date().toISOString(),
        inputs: deepClone(state.inputs),
      };
      const updated = [...state.savedScenarios, newScenario];
      saveScenariosToStorage(updated);
      return { ...state, savedScenarios: updated };
    }

    case 'LOAD_SCENARIO': {
      const scenario = state.savedScenarios.find((s) => s.id === action.payload);
      if (scenario) {
        return { ...state, inputs: deepClone(scenario.inputs), error: null };
      }
      return state;
    }

    case 'DELETE_SCENARIO': {
      const filtered = state.savedScenarios.filter((s) => s.id !== action.payload);
      saveScenariosToStorage(filtered);
      return { ...state, savedScenarios: filtered };
    }

    case 'IMPORT_SCENARIO': {
      try {
        const imported = importScenarioJSON(action.payload);
        return { ...state, inputs: imported, error: null };
      } catch {
        return { ...state, error: 'Failed to import scenario: invalid JSON format' };
      }
    }

    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'RESET_TO_DEFAULT':
      return {
        ...state,
        inputs: createDefaultInputState(),
        error: null,
      };

    default:
      return state;
  }
}

// ============================================================================
// Context
// ============================================================================

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Convenience action creators
  setInputs: (inputs: InputState) => void;
  updateQuantities: (updates: Partial<DirectWorksQuantities>) => void;
  updateUnitRates: (updates: Partial<UnitRates>) => void;
  updateIndirectRates: (updates: Partial<IndirectCostRates>) => void;
  updateRiskFactors: (updates: Partial<RiskFactors>) => void;
  updateFinancialParams: (updates: Partial<FinancialParams>) => void;
  updatePhaseDurations: (updates: Partial<PhaseDurations>) => void;
  setScenarioName: (name: string) => void;
  saveScenario: () => void;
  loadScenario: (id: string) => void;
  deleteScenario: (id: string) => void;
  importScenario: (json: string) => void;
  resetToDefault: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps): React.ReactElement {
  // Initialize state
  const initialState: AppState = useMemo(() => {
    const savedInputs = loadCurrentInputs();
    const inputs = savedInputs ?? createDefaultInputState();
    const savedScenarios = loadSavedScenarios();

    return {
      inputs,
      results: null,
      isCalculating: false,
      savedScenarios,
      currency: DEFAULT_CURRENCY,
      error: null,
    };
  }, []);

  const [state, dispatch] = useReducer(appReducer, initialState);

  // Auto-calculate results when inputs change
  useEffect(() => {
    const calculate = () => {
      dispatch({ type: 'SET_CALCULATING', payload: true });
      try {
        const results = calculateClosureCosts(state.inputs);
        dispatch({ type: 'SET_RESULTS', payload: results });
        saveCurrentInputs(state.inputs);
      } catch (err) {
        console.error('Calculation error:', err);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Calculation failed. Please check your inputs.',
        });
        dispatch({ type: 'SET_CALCULATING', payload: false });
      }
    };

    // Small debounce to batch rapid changes
    const timeoutId = setTimeout(calculate, 50);
    return () => clearTimeout(timeoutId);
  }, [state.inputs]);

  // Action creators
  const setInputs = useCallback(
    (inputs: InputState) => dispatch({ type: 'SET_INPUTS', payload: inputs }),
    []
  );

  const updateQuantities = useCallback(
    (updates: Partial<DirectWorksQuantities>) =>
      dispatch({ type: 'UPDATE_QUANTITIES', payload: updates }),
    []
  );

  const updateUnitRates = useCallback(
    (updates: Partial<UnitRates>) => dispatch({ type: 'UPDATE_UNIT_RATES', payload: updates }),
    []
  );

  const updateIndirectRates = useCallback(
    (updates: Partial<IndirectCostRates>) =>
      dispatch({ type: 'UPDATE_INDIRECT_RATES', payload: updates }),
    []
  );

  const updateRiskFactors = useCallback(
    (updates: Partial<RiskFactors>) => dispatch({ type: 'UPDATE_RISK_FACTORS', payload: updates }),
    []
  );

  const updateFinancialParams = useCallback(
    (updates: Partial<FinancialParams>) =>
      dispatch({ type: 'UPDATE_FINANCIAL_PARAMS', payload: updates }),
    []
  );

  const updatePhaseDurations = useCallback(
    (updates: Partial<PhaseDurations>) =>
      dispatch({ type: 'UPDATE_PHASE_DURATIONS', payload: updates }),
    []
  );

  const setScenarioName = useCallback(
    (name: string) => dispatch({ type: 'SET_SCENARIO_NAME', payload: name }),
    []
  );

  const saveScenario = useCallback(() => dispatch({ type: 'SAVE_SCENARIO' }), []);

  const loadScenario = useCallback(
    (id: string) => dispatch({ type: 'LOAD_SCENARIO', payload: id }),
    []
  );

  const deleteScenario = useCallback(
    (id: string) => dispatch({ type: 'DELETE_SCENARIO', payload: id }),
    []
  );

  const importScenario = useCallback(
    (json: string) => dispatch({ type: 'IMPORT_SCENARIO', payload: json }),
    []
  );

  const resetToDefault = useCallback(() => dispatch({ type: 'RESET_TO_DEFAULT' }), []);

  const contextValue: AppContextValue = useMemo(
    () => ({
      state,
      dispatch,
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
    }),
    [
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
    ]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useAppState(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}
