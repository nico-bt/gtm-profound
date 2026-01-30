"use client"

interface ThresholdSliderProps {
  value: number
  setThreshold: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export function ThresholdSlider({
  value,
  setThreshold,
  min = 1000,
  max = 200000,
  step = 1000,
}: ThresholdSliderProps) {
  return (
    <>
      <div className="w-full mt-6 mb-2 custom-container">
        <h2 className="text-3xl small-caps font-medium mb-3 border-b-2 pb-1 border-gray-400">
          Enterprise Threshold
        </h2>

        <p className="text-sm">
          Accounts with <span className="font-semibold">{value.toLocaleString()}+ employees</span>{" "}
          will be classified as <span className="text-[#3B82F6] font-semibold">Enterprise</span>.
          Accounts below this threshold will be{" "}
          <span className="text-[#F97316] font-semibold">Mid-Market</span>.
        </p>
      </div>

      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md py-2 shadow-sm">
        <div className="text-xl font-bold text-center">{value.toLocaleString()} employees</div>
        <div className="max-w-200 mx-auto px-12">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          <div className="flex justify-between text-xs text-gray-500">
            <span>{min.toLocaleString()}</span>
            <span>{((min + max) / 2).toLocaleString()}</span>
            <span>{max.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </>
  )
}
