'use client'

import { useState } from 'react'

const STATUSES = ['pending', 'paid', 'shipped', 'delivered']

const statusLabel: Record<string, string> = {
  pending: 'în așteptare',
  paid: 'plătit',
  shipped: 'expediat',
  delivered: 'livrat',
}

const statusColor: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
}

export default function StatusSelect({ orderId, current, onChange }: { orderId: string; current: string; onChange?: (newStatus: string) => void }) {
  const [status, setStatus] = useState(current)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)

  const update = async (next: string) => {
    const prev = status
    setSaving(true)
    setError(false)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (res.ok) {
        setStatus(next)
        onChange?.(next)
      } else {
        setStatus(prev)
        setError(true)
      }
    } catch {
      setStatus(prev)
      setError(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        value={status}
        disabled={saving}
        onChange={(e) => update(e.target.value)}
        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border cursor-pointer disabled:opacity-50 ${statusColor[status] || 'bg-stone-50 text-stone-500 border-stone-200'}`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{statusLabel[s] || s}</option>
        ))}
      </select>
      {error && <p className="text-[10px] text-red-500">Salvare eșuată</p>}
    </div>
  )
}
