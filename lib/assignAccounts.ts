import { Account } from "./getDataFromSheet"

export interface Rep {
  Rep_Name: string
  Location: string
  Segment: string
}

export interface AccountWithLoad extends Account {
  baseLoad: number // Load without location consideration
}

export interface SegmentedAccountWithLoad extends AccountWithLoad {
  segment: string
}

export interface AssignedAccount extends SegmentedAccountWithLoad {
  load: number
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
 * Pre-calculate base load for all accounts (without location)
 * This only needs to run once when accounts or weights change
 * No need to recalculate for each rep-account pairing
 * Just add location penalty later
 */
export function calculateBaseLoads(
  accounts: Account[],
  weights: AssignmentWeights = DEFAULT_WEIGHTS,
): AccountWithLoad[] {
  // Calculate min/max once for normalization
  const arrs = accounts.map((a) => a.ARR)
  const employees = accounts.map((a) => a.Num_Employees)
  const marketers = accounts.map((a) => a.Num_Marketers)
  const risks = accounts.map((a) => a.Risk_Score)

  const minARR = Math.min(...arrs)
  const maxARR = Math.max(...arrs)
  const minEmp = Math.min(...employees)
  const maxEmp = Math.max(...employees)
  const minMkt = Math.min(...marketers)
  const maxMkt = Math.max(...marketers)
  const minRisk = Math.min(...risks)
  const maxRisk = Math.max(...risks)

  // Calculate base load for each account and add to new array accountsWithLoad
  return accounts.map((account) => {
    const arrNorm = normalize(account.ARR, minARR, maxARR)
    const empNorm = normalize(account.Num_Employees, minEmp, maxEmp)
    const mktNorm = normalize(account.Num_Marketers, minMkt, maxMkt)
    const riskNorm = normalize(account.Risk_Score, minRisk, maxRisk)

    // Base load without location penalty
    const baseLoad =
      arrNorm * weights.arr +
      empNorm * weights.employees +
      mktNorm * weights.marketers +
      riskNorm * weights.risk

    return {
      ...account,
      baseLoad,
    }
  })
}

/**
 * Calculate final load for an account-rep pairing
 * Just adds location penalty to pre-calculated base load
 */
function getFinalLoadWithLocation(
  account: AccountWithLoad,
  rep: Rep,
  weights: AssignmentWeights,
): number {
  const locationPenalty = account.Location !== rep.Location ? weights.location : 0
  return account.baseLoad + locationPenalty
}

/**
 * Assign accounts to reps using greedy algorithm
 */
export function assignAccountsToReps(
  accountsWithLoad: AccountWithLoad[],
  threshold: number,
  reps: Rep[],
  weights: AssignmentWeights = DEFAULT_WEIGHTS,
): RepLoad[] {
  // Segment accounts based on threshold
  const segmentedAccounts: SegmentedAccountWithLoad[] = accountsWithLoad.map((account) => ({
    ...account,
    segment: account.Num_Employees >= threshold ? "Enterprise" : "Mid Market",
  }))

  // Separate by segment
  const enterpriseReps = reps.filter((r) => r.Segment === "Enterprise")
  const midMarketReps = reps.filter((r) => r.Segment === "Mid Market")
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
  function assignToLightestRep(account: SegmentedAccountWithLoad, availableReps: Rep[]) {
    let bestRep = availableReps[0]
    let bestTotalLoad = Infinity
    let bestAccountLoad = 0

    for (const rep of availableReps) {
      // Calculate final load: base + location penalty
      const accountLoad = getFinalLoadWithLocation(account, rep, weights)
      const currentRepLoad = repLoads.get(rep.Rep_Name)!.totalLoad
      const potentialTotalLoad = currentRepLoad + accountLoad

      if (potentialTotalLoad < bestTotalLoad) {
        bestTotalLoad = potentialTotalLoad
        bestRep = rep
        bestAccountLoad = accountLoad
      }
    }

    // Assign to best rep
    const repLoad = repLoads.get(bestRep.Rep_Name)!

    const assignedAccount: AssignedAccount = {
      ...account,
      load: bestAccountLoad,
      assigned_rep: bestRep.Rep_Name,
    }

    repLoad.accounts.push(assignedAccount)
    repLoad.totalARR += account.ARR
    repLoad.totalLoad += bestAccountLoad
    repLoad.accountCount += 1

    if (account.Location === bestRep.Location) {
      repLoad.locationMatches += 1
    }
  }

  // Sort by baseLoad and assign
  const sortedEnterpriseAccounts = [...enterpriseAccounts].sort((a, b) => b.baseLoad - a.baseLoad)
  const sortedMidMarketAccounts = [...midMarketAccounts].sort((a, b) => b.baseLoad - a.baseLoad)

  for (const account of sortedEnterpriseAccounts) {
    assignToLightestRep(account, enterpriseReps)
  }
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

  // console.log({ enterpriseLoadsAccounts: enterpriseLoads.map((item) => item.accounts) })

  function calculateVariance(loads: RepLoad[], key: "totalARR" | "totalLoad") {
    const values = loads.map((l) => l[key])
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)
    const coefficientOfVariation = (stdDev / mean) * 100
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
