# Territory Slicer

Dynamic sales territory assignment tool for balancing workload across Enterprise and Mid-Market sales reps.

## Overview

Interactive application to find optimal account segmentation thresholds and distribute accounts equitably among sales representatives based on composite load metrics.

## Tech Stack

- **Next.js 15**
- **TypeScript**
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **Papa Parse** - CSV parsing

## Getting Started
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Data Source

Pulls data directly from Google Sheets (Reps and Accounts tabs) via CSV export API.

## Key Features

- **Dynamic threshold slider** - Adjust employee count threshold to segment Enterprise vs Mid-Market
- **Real-time assignment** - Accounts automatically redistributed as threshold changes
- **Load-based balancing** - Greedy algorithm assigns accounts by composite load score
- **Multi-metric visualization** - Toggle between ARR, Load, Employees, Marketers, Risk, and Location Match views
- **Balance metrics** - Statistical analysis of distribution quality per segment

## Project Structure
```
├── app/
│   └── page.tsx                    # Main page
├── component/
│   ├── segmentationAnalyzer.tsx   # Parent orchestrator
│   ├── thresholdSlider.tsx        # Threshold input control
│   ├── segmentDistributionChart.tsx # Pie chart visualization
│   ├── explorationChart.tsx       # ARR vs Employees scatter
│   └── repAssignment.tsx          # Assignment logic & charts
├── lib/
│   ├── assignAccounts.ts          # Core assignment algorithm
│   ├── metrics.ts                 # Balance calculations
│   └── getDataFromSheet.ts        # Data fetching
```

## Algorithm

1. Pre-calculate base load for each account (ARR + Employees + Marketers + Risk)
2. Add location penalty during assignment
3. Sort accounts by load (descending)
4. Greedy assign to rep with lowest current total load
