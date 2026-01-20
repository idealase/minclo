# Mine Closure Costing Tool

A production-quality, static web application for estimating mine closure costs using parametric inputs. Built with TypeScript, React, D3.js, and Vite.

## 🎯 Overview

This tool provides real-time parametric cost estimation for mine closure and rehabilitation projects. Users can adjust various input parameters using sliders and numeric inputs, and instantly see:

- **Total Cost Breakdown** - Direct works, indirect costs, and contingency
- **Category Analysis** - Costs by major closure activity
- **Annual Cashflows** - Year-by-year spending profile across closure phases
- **NPV Calculation** - Net Present Value with configurable discount rate
- **Sensitivity Analysis** - Tornado chart showing cost drivers

## ✨ Features

- **Real-time Updates**: All outputs update instantly as inputs change
- **Scenario Presets**: Quick-load common mine scenarios (small pit, large pit + WRD, TSF-dominant, high water)
- **Save/Load**: Persist scenarios to localStorage for later use
- **Export Options**: Download results as JSON or CSV
- **Responsive Design**: Works on desktop and tablet devices
- **Accessible**: Keyboard navigation and screen reader support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/mine-closure-costing.git
cd mine-closure-costing

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
# Run tests
npm test

# Build static site
npm run build

# Preview production build locally
npm run preview
```

## 📊 Input Parameters

### Site Physical Dimensions
| Parameter | Unit | Description |
|-----------|------|-------------|
| Pit Area | hectares | Open pit surface area |
| Pit Depth | meters | Final pit depth |
| WRD Area | hectares | Waste rock dump surface area |
| WRD Height | meters | Waste rock dump height |
| TSF Area | hectares | Tailings storage facility area |
| TSF Depth | meters | Average tailings depth |

### Infrastructure
| Parameter | Unit | Description |
|-----------|------|-------------|
| Infrastructure Area | hectares | Buildings, plant, workshops |
| Haul Roads Area | hectares | Roads requiring rehabilitation |
| Number of Buildings | count | Structures requiring demolition |

### Water Management
| Parameter | Unit | Description |
|-----------|------|-------------|
| Water Treatment Rate | ML/day | Ongoing water treatment capacity |
| Treatment Years | years | Duration of water treatment |

### Unit Rates
| Parameter | Unit | Description |
|-----------|------|-------------|
| Earthworks Rate | $/m³ | Bulk earthmoving cost |
| Revegetation Rate | $/ha | Seeding and planting cost |
| Demolition Rate | $/m² | Building demolition cost |
| Water Treatment CapEx | $/ML/day | Treatment plant capital cost |
| Water Treatment OpEx | $/ML | Operating cost per ML treated |
| Monitoring Rate | $/year | Annual environmental monitoring |

### Financial Parameters
| Parameter | Unit | Description |
|-----------|------|-------------|
| Contingency | % | Allowance for unknowns |
| EPCM | % | Engineering, procurement, construction management |
| Discount Rate | % | For NPV calculation |

## 📈 Output Displays

### KPI Cards
- **Total Cost** - Grand total including contingency
- **NPV** - Net Present Value at specified discount rate
- **Direct Costs** - Earthworks, demolition, revegetation, water treatment
- **Cost per Hectare** - Total cost normalized by disturbed area

### Charts
1. **Cost Breakdown** - Horizontal bar chart by cost category
2. **Annual Cashflow** - Stacked bar chart showing spending by year/phase
3. **Sensitivity (Tornado)** - Shows impact of ±20% parameter variation

### Line Item Table
- Detailed cost breakdown by category and phase
- Searchable and sortable
- Exportable to CSV

## 🧮 Methodology

See [docs/MODEL_METHOD.md](docs/MODEL_METHOD.md) for detailed documentation of:
- Calculation algorithms
- Cost estimation formulas
- Default unit rates and assumptions
- Phase allocation methodology

## 🏗️ Project Structure

```
src/
├── domain/          # Core business logic
│   ├── types.ts     # TypeScript interfaces
│   ├── defaults.ts  # Default parameter values
│   ├── validation.ts # Zod validation schemas
│   ├── calcEngine.ts # Cost calculation engine
│   └── presets.ts   # Scenario presets
├── state/           # State management
│   └── store.tsx    # React Context + useReducer
├── charts/          # D3.js visualizations
│   ├── BreakdownChart.ts
│   ├── CashflowChart.ts
│   └── TornadoChart.ts
├── ui/              # Reusable UI components
│   ├── SliderInput.tsx
│   ├── SelectInput.tsx
│   ├── CollapsibleSection.tsx
│   ├── KPICard.tsx
│   └── ToggleSwitch.tsx
├── components/      # Main application components
│   ├── InputPanel.tsx
│   └── OutputPanel.tsx
├── utils/           # Utility functions
│   ├── formatting.ts
│   └── export.ts
└── App.tsx          # Root component
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

Tests cover:
- Calculation engine correctness
- Input validation schemas
- Edge cases and boundary conditions
- Regression snapshot tests

## 🚀 Deployment

The application automatically deploys to GitHub Pages on push to `main` branch via GitHub Actions.

### Manual Deployment

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to any static hosting service

### GitHub Pages Setup

1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Push to main branch to trigger deployment

## ⚠️ Disclaimer

**This tool is for preliminary estimation purposes only.**

- Outputs are indicative estimates, not detailed cost studies
- Unit rates are generic and may not reflect local conditions
- Always engage qualified professionals for actual closure planning
- Results should be validated against site-specific assessments

## 🛠️ Technology Stack

- **Build Tool**: Vite 7.x
- **Language**: TypeScript 5.x (strict mode)
- **UI Framework**: React 19.x
- **Charts**: D3.js 7.x
- **Validation**: Zod 4.x
- **Testing**: Vitest
- **Linting**: ESLint with Prettier

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request
