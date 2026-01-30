"use client"

import {
  PieChart,
  Pie,
  ResponsiveContainer,
  PieSectorShapeProps,
  Sector,
  PieLabelRenderProps,
} from "recharts"
import { useMemo } from "react"
import { Account } from "@/lib/getDataFromSheet"

export interface SegmentedAccount extends Account {
  segment: "Enterprise" | "Mid Market"
}

interface SegmentDistributionProps {
  accounts: SegmentedAccount[]
}

const COLORS = ["#3B82F6", "#F97316"]
const RADIAN = Math.PI / 180

export function SegmentDistributionChart({ accounts }: SegmentDistributionProps) {
  const segmentData = useMemo(() => {
    const enterprise = accounts.filter((a) => a.segment === "Enterprise")
    const midMarket = accounts.filter((a) => a.segment === "Mid Market")

    return [
      {
        name: "Enterprise",
        value: enterprise.length,
        arr: enterprise.reduce((sum, a) => sum + a.ARR, 0),
      },
      {
        name: "Mid Market",
        value: midMarket.length,
        arr: midMarket.reduce((sum, a) => sum + a.ARR, 0),
      },
    ]
  }, [accounts])

  const totalAccounts = accounts.length
  const totalARR = accounts.reduce((sum, a) => sum + a.ARR, 0)

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow">
      <div className="flex flex-col">
        <h3 className="text-xl font-medium text-gray-700 mb-2 text-center">Segmentation</h3>
        {/* Pie Chart */}
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                isAnimationActive={false}
                data={segmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                dataKey="value"
                shape={MyCustomPie}
              />
              {/* <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                        <p className="font-semibold">{data.name}</p>
                        <p className="text-sm">Accounts: {data.value}</p>
                        <p className="text-sm">Total ARR: ${(data.arr / 1000000).toFixed(2)}M</p>
                        <p className="text-sm">
                          Avg ARR: ${(data.arr / data.value / 1000).toFixed(0)}K
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              /> */}
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Cards */}
        <div className="space-y-2">
          {segmentData.map((segment) => (
            <div
              key={segment.name}
              className="p-4 rounded-lg border-2"
              style={{ borderColor: segment.name === "Enterprise" ? COLORS[0] : COLORS[1] }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: segment.name === "Enterprise" ? COLORS[0] : COLORS[1] }}
                />
                <h3 className="font-medium font-sans text-lg text-black">{segment.name}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-900">
                  <p>Accounts</p>
                  <p className="text-xl font-bold">{segment.value}</p>
                  <p>{((segment.value / totalAccounts) * 100).toFixed(1)}%</p>
                </div>

                <div className="text-gray-900">
                  <p>Total ARR</p>
                  <p className="text-xl font-bold">${(segment.arr / 1000000).toFixed(1)}M</p>
                  <p>{((segment.arr / totalARR) * 100).toFixed(1)}%</p>
                </div>

                {/* The distribution is so uniform that this section is commented out, could be a good insight if different */}
                {/* <div className="col-span-2 text-gray-800">
                  <p>Avg ARR per Account</p>
                  <p className="text-lg font-semibold">
                    ${(segment.arr / segment.value / 1000).toFixed(0)}K
                  </p>
                </div> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const MyCustomPie = (props: PieSectorShapeProps) => {
  return <Sector {...props} fill={COLORS[props.index % COLORS.length]} />
}

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
  value,
}: PieLabelRenderProps) => {
  if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
    return null
  }
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const ncx = Number(cx)
  const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN)
  const ncy = Number(cy)
  const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="black"
      textAnchor={x > ncx ? "start" : "end"}
      dominantBaseline="central"
      className="font-medium font-sans"
    >
      <tspan x={x} dy="0">
        {name}: {value}
      </tspan>
      <tspan x={x} dy="1.2em">
        ({((percent ?? 0) * 100).toFixed(1)}%)
      </tspan>
    </text>
  )
}
