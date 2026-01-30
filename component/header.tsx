import { Github, SquareArrowOutUpRightIcon, VideoIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Header() {
  return (
    <header className="bg-[#000000b3] w-full">
      <div className="custom-container flex items-center justify-between my-2">
        <div className="flex gap-2 items-center">
          <Image src={"/logo.svg"} width={90} height={90} alt="Profound Logo" className="size-12" />
          <h1 className="text-4xl font-semibold small-caps cust">Territory Slicer</h1>
        </div>

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
    </header>
  )
}
