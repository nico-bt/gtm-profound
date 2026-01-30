"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  assignAccountsToReps,
  calculateBaseLoads,
  calculateDistributionMetrics,
} from "@/lib/assignAccounts"
import type { AccountWithLoad, AssignedAccount, Metrics, Rep } from "@/lib/assignAccounts"
import { Account } from "@/lib/getDataFromSheet"
import { BalanceBySegment, calculateMetrics, computeBalance } from "@/lib/metrics"

export interface SegmentedAccount extends Account {
  segment: "Enterprise" | "Mid Market"
}

interface RepAssignmentProps {
  accounts: Account[]
  segmentedAccounts: SegmentedAccount[]
  reps: Rep[]
  threshold: number
  onAssignmentComplete?: (assignedAccounts: AssignedAccount[]) => void
}

type ChartMetric =
  | "arr"
  | "load"
  | "employees"
  | "marketers"
  | "risk"
  | "accounts"
  | "locationMatches"

export interface ChartData {
  name: string
  segment: string
  arr: number
  load: number
  employees: number
  marketers: number
  risk: number
  accounts: number
  locationMatches: number
}
;[]

const METRIC_OPTIONS: { value: ChartMetric; label: string; formatter: (val: number) => string }[] =
  [
    {
      value: "arr",
      label: "Total ARR",
      formatter: (val) => `$${(val / 1000000).toFixed(0)}M`,
    },
    {
      value: "load",
      label: "Total Load",
      formatter: (val) => val.toFixed(2),
    },
    {
      value: "employees",
      label: "Total Employees",
      formatter: (val) => `${(val / 1000).toFixed(0)}K`,
    },
    {
      value: "marketers",
      label: "Total Marketers",
      formatter: (val) => `${(val / 1000).toFixed(0)}K`,
    },
    {
      value: "risk",
      label: "Avg Risk Score",
      formatter: (val) => val.toFixed(1),
    },
    {
      value: "accounts",
      label: "Total Accounts",
      formatter: (val) => val.toFixed(0),
    },
    {
      value: "locationMatches",
      label: "Location Matches %",
      formatter: (val) => val.toFixed(2),
    },
  ]

export function RepAssignment({
  accounts,
  segmentedAccounts,
  reps,
  threshold,
  onAssignmentComplete,
}: RepAssignmentProps) {
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>("arr")

  // Calculate base loads ONCE - only when accounts change
  const accountsWithLoad = useMemo<AccountWithLoad[]>(() => {
    return calculateBaseLoads(accounts)
  }, [accounts])

  // Fast reassignment when threshold changes
  const repLoads = useMemo(() => {
    return assignAccountsToReps(accountsWithLoad, threshold, reps)
  }, [accountsWithLoad, threshold, reps])

  // Flatten assigned accounts for callback
  const assignedAccounts = useMemo(() => {
    return repLoads.flatMap((rl) => rl.accounts)
  }, [repLoads])

  // Call callback
  useEffect(() => {
    if (onAssignmentComplete && assignedAccounts.length > 0) {
      onAssignmentComplete(assignedAccounts)
    }
  }, [assignedAccounts, onAssignmentComplete])

  // Prepare data for chart with all metrics
  const chartData: ChartData[] = repLoads.map((rl) => ({
    name: rl.rep.Rep_Name,
    segment: rl.rep.Segment,
    arr: rl.totalARR,
    load: rl.totalLoad,
    employees: rl.accounts.reduce((sum, acc) => sum + acc.Num_Employees, 0),
    marketers: rl.accounts.reduce((sum, acc) => sum + acc.Num_Marketers, 0),
    risk:
      rl.accountCount > 0
        ? rl.accounts.reduce((sum, acc) => sum + acc.Risk_Score, 0) / rl.accountCount
        : 0,
    accounts: rl.accountCount,
    locationMatches: rl.locationMatches / rl.accountCount,
  }))

  const balanceBySegment = useMemo<BalanceBySegment>(() => {
    return calculateMetrics({ chartData })
  }, [chartData])

  // Separate by segment for display
  const enterpriseData = chartData.filter((d) => d.segment === "Enterprise")
  const midMarketData = chartData.filter((d) => d.segment === "Mid Market")

  const currentMetricConfig = METRIC_OPTIONS.find((m) => m.value === selectedMetric)!

  return (
    <div className="w-full space-y-6">
      {/* Rep Balance Chart */}
      <div className="px-6 bg-white rounded-lg shadow py-3">
        <div className="flex items-center mb-4 gap-3">
          <h3 className="text-xl font-medium text-gray-700">Rep Distribution by</h3>

          {/* Metric Selector */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as ChartMetric)}
            className="text-black px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 text-lg"
          >
            {METRIC_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="text-sm">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-[1fr_220px] gap-6">
          <div className="space-y-6">
            {/* Enterprise Chart */}
            <div>
              <h4 className="text-lg font-semibold text-blue-900 mb-2">Enterprise Reps</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={enterpriseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={currentMetricConfig.formatter} />
                  <Tooltip
                    isAnimationActive={false}
                    formatter={(value) => currentMetricConfig.formatter(Number(value))}
                  />
                  <Legend />
                  <Bar
                    dataKey={selectedMetric}
                    fill="#3B82F6"
                    name={currentMetricConfig.label}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Mid Market Chart */}
            <div>
              <h4 className="text-lg font-semibold text-orange-900 mb-2">Mid Market Reps</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={midMarketData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ width: 90 }} />
                  <YAxis tickFormatter={currentMetricConfig.formatter} />
                  <Tooltip
                    isAnimationActive={false}
                    formatter={(value) => currentMetricConfig.formatter(Number(value))}
                  />
                  <Legend />
                  <Bar
                    dataKey={selectedMetric}
                    fill="#F97316"
                    name={currentMetricConfig.label}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid gap-3">
            <MetricsCard
              // metrics={metrics}
              segment="enterprise"
              chartMetric={selectedMetric}
              balanceBySegment={balanceBySegment}
            />
            <MetricsCard
              // metrics={metrics}
              segment="midMarket"
              chartMetric={selectedMetric}
              balanceBySegment={balanceBySegment}
            />
          </div>
        </div>
      </div>

      {/* Detailed Rep Cards  */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repLoads.map((rl) => (
          <div
            key={rl.rep.Rep_Name}
            className="p-4 bg-white rounded-lg shadow border-l-4"
            style={{
              borderLeftColor: rl.rep.Segment === "Enterprise" ? "#3B82F6" : "#F97316",
            }}
          >
            <h4 className="font-bold text-lg">{rl.rep.Rep_Name}</h4>
            <p className="text-sm text-gray-600 mb-3">
              {rl.rep.Location} • {rl.rep.Segment}
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Accounts:</span>
                <span className="font-semibold">{rl.accountCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total ARR:</span>
                <span className="font-semibold">${(rl.totalARR / 1000000).toFixed(2)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg ARR:</span>
                <span className="font-semibold">
                  ${(rl.totalARR / rl.accountCount / 1000).toFixed(0)}K
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Load Score:</span>
                <span className="font-semibold">{rl.totalLoad.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location Match:</span>
                <span className="font-semibold">
                  {rl.locationMatches}/{rl.accountCount} (
                  {((rl.locationMatches / rl.accountCount) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div> */}
    </div>
  )
}

const MetricsCard = ({
  segment,
  chartMetric,
  balanceBySegment,
}: {
  segment: "enterprise" | "midMarket"
  chartMetric: ChartMetric
  balanceBySegment: BalanceBySegment
}) => {
  const stats = balanceBySegment[segment][chartMetric] ?? {
    balance: null,
    mean: null,
    stdDev: null,
  }

  return (
    <div
      className={`p-3 items-center justify-center rounded-lg shadow flex flex-col gap-2 text-center ${
        segment === "enterprise" ? "bg-blue-50" : "bg-orange-50"
      }`}
    >
      <h3
        className={`text-xl font-bold mb-2 capitalize ${
          segment === "enterprise" ? "text-blue-900" : "text-orange-900"
        }`}
      >
        {segment}
        <br />
        {chartMetric} balance
      </h3>

      <div className="text-sm grid gap-2">
        <div>
          <p
            className={`text-2xl font-bold ${
              segment === "enterprise" ? "text-blue-600" : "text-orange-600"
            }`}
          >
            {stats.balance !== null ? `${stats.balance.toFixed(1)}%` : "-"}
          </p>
          <p className="text-xs text-gray-500">Balance Score</p>
          <p className="text-xs text-gray-500">100 − (σ / μ) × 100</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-gray-500 mt-3 text-xs">
          <div>
            <p className="text-sm">μ</p>
            <p className="font-medium">
              {stats.mean !== null
                ? stats.mean.toLocaleString("en-US", { maximumFractionDigits: 2 })
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm">σ</p>
            <p className="font-medium">
              {stats.stdDev !== null
                ? stats.stdDev.toLocaleString("en-US", { maximumFractionDigits: 2 })
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
