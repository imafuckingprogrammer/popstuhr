'use client'

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface DataPoint {
  date: string
  messages: number
  conversations: number
}

interface Props {
  data: DataPoint[]
}

export function MessagesChart({ data }: Props) {
  // Only show every 5th label to avoid crowding
  const tickFormatter = (value: string, index: number) => {
    if (index % 5 === 0) return value
    return ''
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="oklch(0.92 0 0)" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: 'oklch(0.49 0 0)' }}
          tickFormatter={tickFormatter}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: 'oklch(0.49 0 0)' }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            border: '1px solid oklch(0.92 0 0)',
            borderRadius: 8,
            fontSize: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
          cursor={{ fill: 'oklch(0.97 0 0)' }}
          formatter={(value: number) => [value, 'Messages']}
        />
        <Bar
          dataKey="messages"
          fill="oklch(0.527 0.224 27)"
          radius={[3, 3, 0, 0]}
          maxBarSize={32}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
