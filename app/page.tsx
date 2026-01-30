import { ExplorationChart } from "@/component/explorationChart"
import { SegmentationAnalyzer } from "@/component/segmentationAnalyzer"
import { getDataFromSheet } from "@/lib/getDataFromSheet"

export default async function Home() {
  const { reps, accounts } = await getDataFromSheet()

  return (
    <>
      <ExplorationChart accounts={accounts} />

      <SegmentationAnalyzer accounts={accounts} reps={reps} />
    </>
  )
}
