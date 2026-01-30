import { ExplorationChart } from "@/component/explorationChart"
import { LoadsExplanation } from "@/component/loadsExplanation"
import { SegmentationAnalyzer } from "@/component/segmentationAnalyzer"
import { getDataFromSheet } from "@/lib/getDataFromSheet"

export default async function Home() {
  const { reps, accounts } = await getDataFromSheet()

  return (
    <main>
      <ExplorationChart accounts={accounts} />

      <LoadsExplanation />

      <SegmentationAnalyzer accounts={accounts} reps={reps} />
    </main>
  )
}
