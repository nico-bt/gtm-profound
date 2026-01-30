import { ChartData } from "@/component/repAssignment"

export interface MetricStats {
  balance: number | null
  mean: number | null
  stdDev: number | null
}

export type MetricKey =
  | "arr"
  | "load"
  | "employees"
  | "marketers"
  | "risk"
  | "accounts"
  | "locationMatches"

export interface BalanceBySegment {
  enterprise: Record<MetricKey, MetricStats>
  midMarket: Record<MetricKey, MetricStats>
}

export function computeBalance(values: number[]): {
  balance: number | null
  mean: number | null
  stdDev: number | null
} {
  const n = values.length
  if (n === 0) return { balance: null, mean: null, stdDev: null }

  const mean = values.reduce((a, b) => a + b, 0) / n
  if (mean === 0) return { balance: null, mean: 0, stdDev: null }

  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n
  const stdDev = Math.sqrt(variance)
  const balance = 100 - (stdDev / mean) * 100

  return { balance, mean, stdDev }
}

export const calculateMetrics = ({ chartData }: { chartData: ChartData[] }) => {
  const METRICS = [
    "arr",
    "load",
    "employees",
    "marketers",
    "risk",
    "accounts",
    "locationMatches",
  ] as const

  const balanceBySegment: BalanceBySegment = {
    enterprise: {} as Record<MetricKey, MetricStats>,
    midMarket: {} as Record<MetricKey, MetricStats>,
  }

  ;(["Enterprise", "Mid Market"] as const).forEach((segment) => {
    const segmentKey = segment === "Enterprise" ? "enterprise" : "midMarket"
    const segmentData = chartData.filter((d) => d.segment === segment)

    METRICS.forEach((metric) => {
      balanceBySegment[segmentKey][metric] = computeBalance(segmentData.map((d) => d[metric]))
    })
  })

  return balanceBySegment
}
