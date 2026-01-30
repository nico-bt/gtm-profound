# Territory Slicer

Dynamic sales territory assignment tool for balancing workload across Enterprise and Mid-Market sales reps.

## Overview

Interactive app to choose segmentation thresholds and distribute accounts across reps based on composite load metrics.

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

Open http://localhost:3000

## Data Source

Pulls data directly from Google Sheets (Reps and Accounts tabs) via CSV export API.

## Key Features

- Dynamic threshold slider to toggle Enterprise vs Mid-Market
- Real-time assignment and load-based balancing (greedy algorithm)
- Multiple visualizations for ARR, Employees, Load and Risk

## Project Structure

Top-level files:

- `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`

- `app/`
  - `globals.css` — global styles
  - `layout.tsx` — root layout
  - `page.tsx` — main page

- `component/` (UI pieces)
  - `segmentationAnalyzer.tsx` — parent orchestrator
  - `thresholdSlider.tsx` — threshold control (sticky input)
  - `segmentDistributionChart.tsx` — segment pie chart
  - `explorationChart.tsx` — ARR vs employees scatter
  - `repAssignment.tsx` — assignment UI and controls
  - `loadsExplanation.tsx` — explanation/notes section
  - `exportCSV.tsx` — CSV export button
  - `repsSummaryTable.tsx` — summary table per rep
  - `header.tsx`, `footer.tsx`

- `lib/` (logic)
  - `assignAccounts.ts` — core assignment algorithm
  - `metrics.ts` — balance and utility calculations
  - `getDataFromSheet.ts` — Google Sheets CSV parsing

- `public/` — static assets

## Algorithm (short)

1. Compute base load for each account (ARR + Employees + Marketers + Risk)
2. Apply location penalty during assignment
3. Sort accounts by load (desc) and greedily assign to the rep with the lowest current load

Notes:

- More details are explained in the web UI .
