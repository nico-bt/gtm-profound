"use client"

import { Account } from "@/lib/getDataFromSheet"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts"

interface ExplorationChartProps {
  accounts: Account[]
}

export function ExplorationChart({ accounts }: ExplorationChartProps) {
  // Transform data for recharts
  const chartData = accounts.map((account) => ({
    name: account.Account_Name,
    employees: account.Num_Employees,
    arr: account.ARR,
  }))

  return (
    <div className="w-full mx-auto grid gap-4 font-sans custom-container">
      <div>
        <h2 className="text-3xl small-caps font-medium mb-3 border-b-2 pb-1 border-gray-400">
          Some exploration before
        </h2>
        <p>
          Let's plot ARR vs Employees to see if there is some clue or natural pattern to segment
          markets:
        </p>
      </div>
      <div className="w-full rounded-lg shadow h-100 bg-gray-100 p-6">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 15, left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              type="number"
              dataKey="employees"
              name="Employees"
              domain={[0, "auto"]}
              tickFormatter={(value) => `${value.toLocaleString()}`}
            >
              <Label value="Number of Employees" offset={-12} position="insideBottom" />
            </XAxis>

            <YAxis
              type="number"
              dataKey="arr"
              name="ARR"
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            >
              <Label value="ARR ($)" angle={-90} position="left" />
            </YAxis>

            <Tooltip
              isAnimationActive={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white p-3 border border-gray-300 rounded shadow-lg text-black">
                      <p className="font-semibold">{data.name}</p>
                      <p className="text-sm">Employees: {data.employees.toLocaleString()}</p>
                      <p className="text-sm">ARR: ${data.arr.toLocaleString()}</p>
                    </div>
                  )
                }
                return null
              }}
            />

            <Scatter
              activeShape={{ fill: "red" }}
              data={chartData}
              fill="#3B82F6"
              fillOpacity={0.85}
              className="hover:cursor-pointer"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-2">
        <p>
          The data is too well equally distributed, looks like a uniform random sampling across both
          dimensions. Confirming the data has been synthetically generated for this challenge.
        </p>
        <p>
          So I will focus on <span className="font-bold">balancing workload</span> across the
          predetermined rep structure (4 Enterprise, 6 Mid-Market).
        </p>
        <div>
          <p>
            However, in a production environment, I think it would be a good idea to reverse the
            approach:
          </p>
          <ol className="list-decimal list-inside ml-6">
            <li>
              First, try to identify natural market segments (clustering algorithms or others?)
            </li>
            <li>Then determine optimal rep allocation.</li>
          </ol>
          <p>
            This data-driven segmentation first, then staffing approach could yield better territory
            balance and more natural account groupings than arbitrary threshold-based segmentation.
          </p>
        </div>
      </div>
    </div>
  )
}
