import { AssignedAccount } from "@/lib/assignAccounts"

// Export function
const exportAssignments = ({
  finalAssignedAccounts,
}: {
  finalAssignedAccounts: AssignedAccount[]
}) => {
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

export function ExportCSV_Button({
  finalAssignedAccounts,
}: {
  finalAssignedAccounts: AssignedAccount[]
}) {
  if (finalAssignedAccounts.length && finalAssignedAccounts.length > 0) {
    return (
      <div className="flex justify-center mt-20">
        {finalAssignedAccounts.length > 0 && (
          <button
            onClick={() => exportAssignments({ finalAssignedAccounts })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition hover:cursor-pointer"
          >
            Export Assignments (CSV)
          </button>
        )}
      </div>
    )
  }
}
