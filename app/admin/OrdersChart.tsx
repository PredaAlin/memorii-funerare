'use client'

import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

type ChartPeriod = 'week' | 'month' | 'year'

interface Props {
  orders: { createdAt: string }[]
}

const periodLabel: Record<ChartPeriod, string> = {
  week: 'Săptămână',
  month: 'Lună',
  year: 'An',
}

function buildWeekData(orders: { createdAt: string }[]) {
  const days: { label: string; date: string; count: number }[] = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({
      label: d.toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric' }),
      date: key,
      count: 0,
    })
  }
  for (const o of orders) {
    const key = o.createdAt.slice(0, 10)
    const slot = days.find(d => d.date === key)
    if (slot) slot.count++
  }
  return days
}

function buildMonthData(orders: { createdAt: string }[]) {
  const days: { label: string; date: string; count: number }[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({
      label: d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' }),
      date: key,
      count: 0,
    })
  }
  for (const o of orders) {
    const key = o.createdAt.slice(0, 10)
    const slot = days.find(d => d.date === key)
    if (slot) slot.count++
  }
  // Only label every 5th day to avoid crowding
  return days.map((d, i) => ({ ...d, label: i % 5 === 0 ? d.label : '' }))
}

function buildYearData(orders: { createdAt: string }[]) {
  const months: { label: string; date: string; count: number }[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    months.push({
      label: d.toLocaleDateString('ro-RO', { month: 'short', year: '2-digit' }),
      date,
      count: 0,
    })
  }
  for (const o of orders) {
    const key = o.createdAt.slice(0, 7)
    const slot = months.find(m => m.date === key)
    if (slot) slot.count++
  }
  return months
}

export function OrdersChart({ orders }: Props) {
  const [period, setPeriod] = useState<ChartPeriod>('week')

  const data = useMemo(() => {
    if (period === 'week') return buildWeekData(orders)
    if (period === 'month') return buildMonthData(orders)
    return buildYearData(orders)
  }, [orders, period])

  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Comenzi</p>
          <p className="text-2xl font-bold serif text-stone-800">
            {total} <span className="text-sm font-normal text-stone-400">în perioada selectată</span>
          </p>
        </div>
        <div className="flex gap-1">
          {(['week', 'month', 'year'] as ChartPeriod[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                period === p
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              {periodLabel[p]}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={period === 'year' ? 24 : period === 'month' ? 8 : 20}>
          <CartesianGrid vertical={false} stroke="#e7e5e4" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#a8a29e', fontFamily: 'Arial, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#a8a29e', fontFamily: 'Arial, sans-serif' }}
            axisLine={false}
            tickLine={false}
            width={24}
          />
          <Tooltip
            cursor={{ fill: '#f5f4f0' }}
            contentStyle={{
              background: '#fff',
              border: '1px solid #e7e5e4',
              borderRadius: 12,
              fontSize: 12,
              fontFamily: 'Arial, sans-serif',
            }}
            formatter={(value) => [value, 'Comenzi']}
            labelFormatter={(label) => String(label ?? '')}
          />
          <Bar dataKey="count" fill="#1c1917" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
