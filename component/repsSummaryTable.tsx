// RepSummaryTable.tsx
import { AssignedAccount, Rep } from "@/lib/assignAccounts"
import { useMemo } from "react"

interface RepSummaryTableProps {
  assignedAccounts: AssignedAccount[]
  reps: Rep[]
  className?: string
}

export function RepSummaryTable({ assignedAccounts, reps, className = "" }: RepSummaryTableProps) {
  const repSummary = useMemo(() => {
    const map = new Map<
      string,
      {
        rep: Rep | undefined
        accountCount: number
        totalARR: number
        totalLoad: number
        locationMatches: number
      }
    >()

    // Initialize every rep (so we show 0s for reps with no accounts)
    reps.forEach((rep) => {
      map.set(rep.Rep_Name, {
        rep,
        accountCount: 0,
        totalARR: 0,
        totalLoad: 0,
        locationMatches: 0,
      })
    })

    // Aggregate from assigned accounts
    assignedAccounts.forEach((acc) => {
      const key = acc.assigned_rep
      if (map.has(key)) {
        const entry = map.get(key)!
        entry.accountCount += 1
        entry.totalARR += acc.ARR || 0
        entry.totalLoad += acc.load || 0
        if (acc.Location === entry.rep?.Location) {
          entry.locationMatches += 1
        }
      }
    })

    return Array.from(map.values())
  }, [assignedAccounts, reps])

  if (repSummary.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No assignments yet — try adjusting the threshold
      </div>
    )
  }

  return (
    <div className={`custom-container overflow-x-auto  ${className}`}>
      <h2 className="text-2xl font-medium my-4">Rep Summary Table</h2>

      <table className="min-w-full divide-y divide-gray-400">
        <thead className="bg-gray-200">
          <tr>
            <th scope="col" className="px-5 py-3.5 text-left text-sm font-semibold text-gray-900">
              Rep
            </th>
            <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
              Segment
            </th>
            <th scope="col" className="px-4 py-3.5 text-right text-sm font-semibold text-gray-900">
              Accounts
            </th>
            <th scope="col" className="px-4 py-3.5 text-right text-sm font-semibold text-gray-900">
              Total ARR
            </th>
            <th scope="col" className="px-4 py-3.5 text-right text-sm font-semibold text-gray-900">
              Avg ARR
            </th>
            <th scope="col" className="px-4 py-3.5 text-right text-sm font-semibold text-gray-900">
              Load Score
            </th>
            <th scope="col" className="px-4 py-3.5 text-right text-sm font-semibold text-gray-900">
              Location Match
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300 bg-white">
          {repSummary.map((rl) => {
            if (!rl.rep) return null

            const isEnterprise = rl.rep.Segment === "Enterprise"
            const segmentClass = isEnterprise
              ? "bg-blue-50 text-blue-800"
              : "bg-orange-50 text-orange-800"

            const avgARR =
              rl.accountCount > 0
                ? (rl.totalARR / rl.accountCount / 1000).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })
                : "-"

            const locationPct =
              rl.accountCount > 0 ? Math.round((rl.locationMatches / rl.accountCount) * 100) : 0

            return (
              <tr key={rl.rep.Rep_Name} className="hover:bg-gray-50/70 transition-colors">
                <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-900">
                  {rl.rep.Rep_Name}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${segmentClass}`}
                  >
                    {rl.rep.Segment}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-right font-medium text-gray-900">
                  {rl.accountCount}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-right text-gray-900">
                  ${(rl.totalARR / 1_000_000).toFixed(2)}M
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-right text-gray-900">
                  {avgARR}K
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-right font-medium text-gray-900">
                  {rl.totalLoad.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-right text-gray-900">
                  {rl.locationMatches} / {rl.accountCount}
                  {rl.accountCount > 0 && (
                    <span className="ml-1.5 text-gray-500 text-xs">({locationPct}%)</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
