import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-black flex justify-center items-center w-full h-14">
      <Image src={"/logo.svg"} width={90} height={90} alt="Profound Logo" className="size-10" />
      <span className="text-2xl">👋</span>
    </footer>
  )
}
