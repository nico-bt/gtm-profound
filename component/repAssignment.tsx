"use client"

import { useEffect, useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label,
} from "recharts"
import {
  assignAccountsToReps,
  calculateBaseLoads,
  calculateDistributionMetrics,
  type RepLoad,
} from "@/lib/assignAccounts"
import type { AccountWithLoad, AssignedAccount, Metrics, Rep } from "@/lib/assignAccounts"
import { Account } from "@/lib/getDataFromSheet"

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

export function RepAssignment({
  accounts,
  segmentedAccounts,
  reps,
  threshold,
  onAssignmentComplete,
}: RepAssignmentProps) {
  // Calculate base loads ONCE - only when accounts change
  const accountsWithLoad = useMemo<AccountWithLoad[]>(() => {
    return calculateBaseLoads(accounts)
  }, [accounts])

  // Fast reassignment when threshold changes
  const repLoads = useMemo(() => {
    return assignAccountsToReps(accountsWithLoad, threshold, reps)
  }, [accountsWithLoad, threshold, reps])

  const metrics = useMemo(() => {
    return calculateDistributionMetrics(repLoads)
  }, [repLoads])

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

  // Prepare data for chart
  const chartData = repLoads.map((rl) => ({
    name: rl.rep.Rep_Name,
    segment: rl.rep.Segment,
    ARR: rl.totalARR,
    accounts: rl.accountCount,
    load: rl.totalLoad,
  }))

  // Separate by segment for display
  const enterpriseData = chartData.filter((d) => d.segment === "Enterprise")
  const midMarketData = chartData.filter((d) => d.segment === "Mid Market")

  return (
    <div className="w-full space-y-6">
      {/* Rep Balance Chart */}
      <div className="px-6 bg-white rounded-lg shadow py-3">
        <h3 className="text-xl font-medium text-gray-700 mb-2 text-center">
          Rep Load Distribution
        </h3>

        <div className="grid grid-cols-[1fr_320px] gap-6">
          <div className="space-y-8">
            {/* Enterprise Chart */}
            <div>
              <h4 className="text-lg font-semibold text-blue-900 mb-2">Enterprise Reps</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={enterpriseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    isAnimationActive={false}
                    formatter={(value, name) => {
                      if (name === "ARR") return `$${(Number(value) / 1000000).toFixed(2)}M`
                      return value
                    }}
                  />
                  <Legend />
                  <Bar dataKey="ARR" fill="#3B82F6" name="Total ARR" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Mid Market Chart */}
            <div>
              <h4 className="text-lg font-semibold text-orange-900 mb-2">Mid Market Reps</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={midMarketData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    isAnimationActive={false}
                    formatter={(value, name) => {
                      if (name === "ARR") return `$${(Number(value) / 1000000).toFixed(2)}M`
                      return value
                    }}
                  />
                  <Legend />
                  <Bar dataKey="ARR" fill="#F97316" name="Total ARR" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid gap-2">
            <MetricsCard metrics={metrics} segment="enterprise" />
            <MetricsCard metrics={metrics} segment="midMarket" />
          </div>
        </div>
      </div>

      {/* Detailed Rep Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>
    </div>
  )
}

const MetricsCard = ({
  metrics,
  segment,
}: {
  metrics: Metrics
  segment: "enterprise" | "midMarket"
}) => {
  return (
    <div
      className={` p-3 items-center justify-center rounded-lg shadow flex flex-col gap-2 text-center ${segment === "enterprise" ? "bg-blue-50" : "bg-orange-50"}`}
    >
      <h3
        className={`text-xl font-bold mb-2 capitalize ${segment === "enterprise" ? "text-blue-900" : "text-orange-900"}`}
      >
        {segment} Balance
      </h3>
      <div className="text-sm grid gap-6">
        <div>
          <p
            className={`text-2xl font-bold ${segment === "enterprise" ? "text-blue-600" : "text-orange-600"}`}
          >
            {metrics[segment].arr.coefficientOfVariation
              ? (100 - metrics[segment].arr.coefficientOfVariation).toFixed(1) + "%"
              : "-"}
          </p>
          <p className="text-gray-700">
            <span>ARR Balance:</span>
            <span className="text-xs text-gray-500">100 − (σ / μ) × 100</span>
          </p>

          <p className="text-xs text-gray-600">
            Variance:{" "}
            {metrics[segment].arr.coefficientOfVariation
              ? metrics[segment].arr.coefficientOfVariation.toFixed(1) + "%"
              : "-"}
          </p>
        </div>
        <div className="flex gap-2 justify-around">
          <div>
            <p className="text-gray-600 text-xs">Avg ARR/Rep</p>
            <p className="font-semibold text-gray-800">
              ${(metrics[segment].arr.mean / 1000000).toFixed(2)}M
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-xs">Range</p>
            <p className="font-semibold text-gray-800">
              ${(metrics[segment].arr.min / 1000000).toFixed(2)}M - $
              {(metrics[segment].arr.max / 1000000).toFixed(2)}M
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-2 text-xs justify-center">
        <p className="text-gray-600">Location Match</p>
        <p className="font-semibold text-gray-800">
          {metrics[segment].locationMatchRate.toFixed(1)}%
        </p>
      </div>
    </div>
  )
}
