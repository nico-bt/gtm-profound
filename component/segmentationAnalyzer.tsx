"use client"

import { useState, useMemo } from "react"
import { ThresholdSlider } from "./thresholdSlider"
import { SegmentDistributionChart } from "./segmentDistributionChart"
import { RepAssignment, SegmentedAccount } from "./repAssignment"
import type { Account, Rep } from "@/lib/getDataFromSheet"
import { AssignedAccount } from "@/lib/assignAccounts"
import { ExportCSV_Button } from "./exportCSV"
import { RepSummaryTable } from "./repsSummaryTable"

interface SegmentationAnalyzerProps {
  accounts: Account[]
  reps: Rep[]
}

export function SegmentationAnalyzer({ accounts, reps }: SegmentationAnalyzerProps) {
  const [threshold, setThreshold] = useState(100000)
  const [finalAssignedAccounts, setFinalAssignedAccounts] = useState<AssignedAccount[]>([])

  // Segment accounts based on threshold
  const segmentedAccounts = useMemo<SegmentedAccount[]>(() => {
    return accounts.map((account) => ({
      ...account,
      segment: account.Num_Employees >= threshold ? "Enterprise" : "Mid Market",
    }))
  }, [accounts, threshold])

  // Handler to receive final assignment data
  const handleAssignmentComplete = (assignedAccounts: AssignedAccount[]) => {
    setFinalAssignedAccounts(assignedAccounts)
  }

  return (
    <div className="space-y-6 mb-24 relative">
      <ThresholdSlider value={threshold} setThreshold={setThreshold} />

      <div className="grid min-[920px]:grid-cols-[420px_1fr] gap-2 w-full max-w-360 mx-auto px-2">
        <SegmentDistributionChart accounts={segmentedAccounts} />

        <RepAssignment
          accounts={accounts}
          segmentedAccounts={segmentedAccounts}
          reps={reps}
          threshold={threshold}
          onAssignmentComplete={handleAssignmentComplete}
        />
      </div>

      <ExportCSV_Button finalAssignedAccounts={finalAssignedAccounts} />

      <RepSummaryTable assignedAccounts={finalAssignedAccounts} reps={reps} />
    </div>
  )
}
