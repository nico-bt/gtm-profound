// "use client"
// import { Account } from "@/lib/getDataFromSheet"
// import { useMemo, useState } from "react"
// import { ThresholdSlider } from "./thresholdSlider"
// import { SegmentDistribution } from "./segmentDistribution"

// type SegmentationAnalyzerProps = {
//   accounts: Account[]
// }

// function SegmentationAnalyzer({ accounts }: SegmentationAnalyzerProps) {
//   const [threshold, setThreshold] = useState(100000) // default threshold

//   // Derive segmented data from threshold
//   const segmentedAccounts = useMemo(() => {
//     return accounts.map((account) => ({
//       ...account,
//       segment: account.Num_Employees >= threshold ? "Enterprise" : "Mid Market",
//     }))
//   }, [accounts, threshold])

//   return (
//     <>
//       <ThresholdSlider value={threshold} onChange={setThreshold} />
//       <SegmentDistribution accounts={segmentedAccounts} />
//     </>
//   )

//   /* <RepAssignment accounts={segmentedAccounts} reps={reps} /> */
// }

// export default SegmentationAnalyzer

// ***************

"use client"

import { useState, useMemo } from "react"
import { ThresholdSlider } from "./thresholdSlider"
import { SegmentDistributionChart, SegmentedAccount } from "./segmentDistributionChart"
import { ExplorationChart } from "./explorationChart"
import { RepAssignment, type AssignedAccountWithLoad } from "./repAssignment"
import type { Account, Rep } from "@/lib/getDataFromSheet"

interface SegmentationAnalyzerProps {
  accounts: Account[]
  reps: Rep[]
}

export function SegmentationAnalyzer({ accounts, reps }: SegmentationAnalyzerProps) {
  const [threshold, setThreshold] = useState(100000)
  const [finalAssignedAccounts, setFinalAssignedAccounts] = useState<AssignedAccountWithLoad[]>([])

  // Segment accounts based on threshold
  const segmentedAccounts = useMemo<SegmentedAccount[]>(() => {
    return accounts.map((account) => ({
      ...account,
      segment: account.Num_Employees >= threshold ? "Enterprise" : "Mid Market",
    }))
  }, [accounts, threshold])

  // Handler to receive final assignment data
  const handleAssignmentComplete = (assignedAccounts: AssignedAccountWithLoad[]) => {
    setFinalAssignedAccounts(assignedAccounts)
    // console.log("Final assigned accounts with segment, rep, and load:", assignedAccounts)
  }

  // Export function
  const exportAssignments = () => {
    const csv = [
      // Header
      [
        "Account_ID",
        "Account_Name",
        "ARR",
        "Location",
        "Num_Employees",
        "Num_Marketers",
        "Risk_Score",
        "Segment",
        "Assigned_Rep",
        "Load",
      ],
      // Data
      ...finalAssignedAccounts.map((account) => [
        account.Account_ID,
        account.Account_Name,
        account.ARR,
        account.Location,
        account.Num_Employees,
        account.Num_Marketers,
        account.Risk_Score,
        account.segment,
        account.assigned_rep,
        account.load.toFixed(4),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    // Download CSV
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `territory-assignments-${Date.now()}.csv`
    a.click()
  }

  return (
    <div className="py-8 space-y-6">
      {/* Export csv btn */}
      {/* <div className="flex justify-between items-center custom-container">
        <h1 className="text-3xl font-bold">Territory Slicer</h1>
        {finalAssignedAccounts.length > 0 && (
          <button
            onClick={exportAssignments}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Export Assignments (CSV)
          </button>
        )}
      </div> */}

      <ThresholdSlider value={threshold} setThreshold={setThreshold} />

      <div className="grid grid-cols-[420px_1fr] gap-2 items-start w-full max-w-360 mx-auto px-2">
        <SegmentDistributionChart accounts={segmentedAccounts} />

        <RepAssignment
          accounts={accounts}
          segmentedAccounts={segmentedAccounts}
          reps={reps}
          onAssignmentComplete={handleAssignmentComplete}
        />
      </div>

      {/* Optional: Show count of final assignments */}
      {finalAssignedAccounts.length > 0 && (
        <div className="p-4 bg-gray-100 rounded-lg text-sm text-gray-700">
          ✅ {finalAssignedAccounts.length} accounts assigned with segment, rep, and load data
        </div>
      )}
    </div>
  )
}
