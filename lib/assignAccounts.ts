import { SegmentedAccount } from "@/component/segmentDistributionChart"
import { Account } from "./getDataFromSheet"

export interface Rep {
  Rep_Name: string
  Location: string
  Segment: string
}

export interface AssignedAccount extends SegmentedAccount {
  assigned_rep: string
}

export interface RepLoad {
  rep: Rep
  accounts: AssignedAccount[]
  totalARR: number
  totalLoad: number
  accountCount: number
  locationMatches: number
}

interface AssignmentWeights {
  arr: number
  employees: number
  marketers: number
  risk: number
  location: number
}

export interface Metrics {
  enterprise: {
    arr: {
      mean: number
      stdDev: number
      variance: number
      coefficientOfVariation: number
      min: number
      max: number
    }
    load: {
      mean: number
      stdDev: number
      variance: number
      coefficientOfVariation: number
      min: number
      max: number
    }
    locationMatchRate: number
  }
  midMarket: {
    arr: {
      mean: number
      stdDev: number
      variance: number
      coefficientOfVariation: number
      min: number
      max: number
    }
    load: {
      mean: number
      stdDev: number
      variance: number
      coefficientOfVariation: number
      min: number
      max: number
    }
    locationMatchRate: number
  }
  overall: {
    locationMatchRate: number
  }
}

// Default weights
const DEFAULT_WEIGHTS: AssignmentWeights = {
  arr: 0.45,
  employees: 0.2,
  marketers: 0.1,
  risk: 0.2,
  location: 0.05,
}

/**
 * Normalize a value to 0-1 scale
 */
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5 // avoid division by zero
  return (value - min) / (max - min)
}

/**
 * Calculate account load (complexity score) for a specific rep
 */
function calculateAccountLoad(
  account: Account,
  rep: Rep,
  allAccounts: Account[], // ALL accounts for normalization
  weights: AssignmentWeights = DEFAULT_WEIGHTS,
): number {
  // Get min/max for normalization
  const arrs = allAccounts.map((a) => a.ARR)
  const employees = allAccounts.map((a) => a.Num_Employees)
  const marketers = allAccounts.map((a) => a.Num_Marketers)
  const risks = allAccounts.map((a) => a.Risk_Score)

  // Normalized values
  const arrNorm = normalize(account.ARR, Math.min(...arrs), Math.max(...arrs))
  const empNorm = normalize(account.Num_Employees, Math.min(...employees), Math.max(...employees))
  const mktNorm = normalize(account.Num_Marketers, Math.min(...marketers), Math.max(...marketers))
  const riskNorm = normalize(account.Risk_Score, Math.min(...risks), Math.max(...risks))

  // Location mismatch adds to load (1 = mismatch, 0 = match)
  const locationMismatch = account.Location !== rep.Location ? 1 : 0

  return (
    arrNorm * weights.arr +
    empNorm * weights.employees +
    mktNorm * weights.marketers +
    riskNorm * weights.risk +
    locationMismatch * weights.location
  )
}

/**
 * Assign accounts to reps using greedy algorithm
 */
export function assignAccountsToReps(
  accounts: Account[],
  segmentedAccounts: SegmentedAccount[],
  reps: Rep[],
  weights?: AssignmentWeights,
): RepLoad[] {
  const actualWeights = weights || DEFAULT_WEIGHTS

  // Separate reps by segment
  const enterpriseReps = reps.filter((r) => r.Segment === "Enterprise")
  const midMarketReps = reps.filter((r) => r.Segment === "Mid Market")

  // Separate accounts by segment
  const enterpriseAccounts = segmentedAccounts.filter((a) => a.segment === "Enterprise")
  const midMarketAccounts = segmentedAccounts.filter((a) => a.segment === "Mid Market")

  // Initialize rep loads
  const repLoads: Map<string, RepLoad> = new Map()

  reps.forEach((rep) => {
    repLoads.set(rep.Rep_Name, {
      rep,
      accounts: [],
      totalARR: 0,
      totalLoad: 0,
      accountCount: 0,
      locationMatches: 0,
    })
  })

  // Greedy assignment function
  function assignToLightestRep(account: SegmentedAccount, availableReps: Rep[]) {
    // Calculate load for this account with each potential rep
    let bestRep = availableReps[0]
    let bestTotalLoad = Infinity

    for (const rep of availableReps) {
      const accountLoad = calculateAccountLoad(account, rep, accounts, actualWeights)
      const currentRepLoad = repLoads.get(rep.Rep_Name)!.totalLoad
      const potentialTotalLoad = currentRepLoad + accountLoad

      // Choose rep that would have the lowest total load after this assignment
      if (potentialTotalLoad < bestTotalLoad) {
        bestTotalLoad = potentialTotalLoad
        bestRep = rep
      }
    }

    // Assign account to best rep
    const repLoad = repLoads.get(bestRep.Rep_Name)!
    const accountLoad = calculateAccountLoad(account, bestRep, accounts, actualWeights)

    const assignedAccount: AssignedAccount = {
      ...account,
      assigned_rep: bestRep.Rep_Name,
    }

    repLoad.accounts.push(assignedAccount)
    repLoad.totalARR += assignedAccount.ARR
    repLoad.totalLoad += accountLoad
    repLoad.accountCount += 1

    // Track location matches
    if (account.Location === bestRep.Location) {
      repLoad.locationMatches += 1
    }
  }

  // Sort accounts by ARR (descending) to assign biggest first
  const sortedEnterpriseAccounts = [...enterpriseAccounts].sort((a, b) => b.ARR - a.ARR)
  const sortedMidMarketAccounts = [...midMarketAccounts].sort((a, b) => b.ARR - a.ARR)

  // Assign Enterprise accounts
  for (const account of sortedEnterpriseAccounts) {
    assignToLightestRep(account, enterpriseReps)
  }

  // Assign Mid Market accounts
  for (const account of sortedMidMarketAccounts) {
    assignToLightestRep(account, midMarketReps)
  }

  return Array.from(repLoads.values())
}

/**
 * Calculate distribution quality metrics
 */
export function calculateDistributionMetrics(repLoads: RepLoad[]): Metrics {
  const enterpriseLoads = repLoads.filter((r) => r.rep.Segment === "Enterprise")
  const midMarketLoads = repLoads.filter((r) => r.rep.Segment === "Mid Market")

  function calculateVariance(loads: RepLoad[], key: "totalARR" | "totalLoad") {
    const values = loads.map((l) => l[key])
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)
    const coefficientOfVariation = (stdDev / mean) * 100 // as percentage
    return {
      mean,
      stdDev,
      variance,
      coefficientOfVariation,
      min: Math.min(...values),
      max: Math.max(...values),
    }
  }

  function calculateLocationMatchRate(loads: RepLoad[]) {
    const totalAccounts = loads.reduce((sum, l) => sum + l.accountCount, 0)
    const totalMatches = loads.reduce((sum, l) => sum + l.locationMatches, 0)
    return totalAccounts > 0 ? (totalMatches / totalAccounts) * 100 : 0
  }

  return {
    enterprise: {
      arr: calculateVariance(enterpriseLoads, "totalARR"),
      load: calculateVariance(enterpriseLoads, "totalLoad"),
      locationMatchRate: calculateLocationMatchRate(enterpriseLoads),
    },
    midMarket: {
      arr: calculateVariance(midMarketLoads, "totalARR"),
      load: calculateVariance(midMarketLoads, "totalLoad"),
      locationMatchRate: calculateLocationMatchRate(midMarketLoads),
    },
    overall: {
      locationMatchRate: calculateLocationMatchRate(repLoads),
    },
  }
}
