"use client"

import { useState, useMemo } from "react"
import { ThresholdSlider } from "./thresholdSlider"
import { SegmentDistributionChart } from "./segmentDistributionChart"
import { RepAssignment, SegmentedAccount } from "./repAssignment"
import type { Account, Rep } from "@/lib/getDataFromSheet"
import { AssignedAccount } from "@/lib/assignAccounts"

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
          threshold={threshold}
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
