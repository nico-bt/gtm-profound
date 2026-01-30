import { ExplorationChart } from "@/component/explorationChart"
import { LoadsExplanation } from "@/component/loadsExplanation"
import { SegmentationAnalyzer } from "@/component/segmentationAnalyzer"
import { getDataFromSheet } from "@/lib/getDataFromSheet"
import { Github, SquareArrowOutUpRightIcon, VideoIcon } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  const { reps, accounts } = await getDataFromSheet()

  return (
    <main>
      <div className="custom-container flex items-baseline justify-between my-2">
        <h1 className="text-4xl font-semibold small-caps cust">Territory Slicer</h1>

        <div className="flex gap-12">
          <Link
            href={"https://github.com/nico-bt/gtm-profound"}
            target="_blank"
            className="flex gap-1 items-center hover:underline-offset-2 hover:underline"
          >
            <Github size={18} />
            <span>Github</span>
            <SquareArrowOutUpRightIcon size={16} />
          </Link>

          <Link
            href={"https://github.com/nico-bt/gtm-profound"}
            target="_blank"
            className="flex gap-1 items-center hover:underline-offset-2 hover:underline"
          >
            <VideoIcon size={18} />
            <span>Video</span>
            <SquareArrowOutUpRightIcon size={16} />
          </Link>
        </div>
      </div>

      <ExplorationChart accounts={accounts} />

      <LoadsExplanation />

      <SegmentationAnalyzer accounts={accounts} reps={reps} />
    </main>
  )
}
