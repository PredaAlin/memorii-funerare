'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import StatusSelect from './StatusSelect'

type Period = 'today' | 'month' | 'year' | 'all'
type StatusFilter = 'all' | 'pending' | 'paid' | 'shipped' | 'delivered'

interface OrderMemorial {
  id: string
  deceasedName: string
  plan: string
  isPublished: boolean
}

interface Order {
  id: string
  status: string
  price: number
  createdAt: string
  shippingName: string
  shippingEmail: string
  shippingPhone: string | null
  shippingAddress: string
  shippingCity: string
  shippingPostalCode: string
  memorial: OrderMemorial
}

interface Props {
  initialOrders: Order[]
  baseUrl: string
}

const periodLabel: Record<Period, string> = {
  today: 'Azi',
  month: 'Această lună',
  year: 'Acest an',
  all: 'Toate',
}

const statusLabel: Record<string, string> = {
  all: 'Toate',
  pending: 'În așteptare',
  paid: 'Plătite',
  shipped: 'Expediate',
  delivered: 'Livrate',
}

const statusPillActive: Record<string, string> = {
  all: 'bg-stone-900 text-white',
  pending: 'bg-amber-600 text-white',
  paid: 'bg-blue-600 text-white',
  shipped: 'bg-purple-600 text-white',
  delivered: 'bg-green-600 text-white',
}

const statusCardColor: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  paid: 'bg-blue-50 text-blue-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
}

function filterByPeriod(orders: Order[], period: Period): Order[] {
  if (period === 'all') return orders
  const now = new Date()
  let start: Date
  if (period === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  } else if (period === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
  } else {
    start = new Date(now.getFullYear(), 0, 1)
  }
  return orders.filter(o => new Date(o.createdAt) >= start)
}

export function AdminDashboard({ initialOrders, baseUrl }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [period, setPeriod] = useState<Period>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const memorialUrl = (id: string) => `${baseUrl}/memorial/${id}`
  const qrUrl = (id: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(memorialUrl(id))}&size=200x200&margin=10`

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
  }

  const periodOrders = useMemo(() => filterByPeriod(orders, period), [orders, period])

  const stats = useMemo(() => {
    const revenue = periodOrders
      .filter(o => ['paid', 'shipped', 'delivered'].includes(o.status))
      .reduce((sum, o) => sum + o.price, 0)
    return {
      revenue,
      total: periodOrders.length,
      toShip: periodOrders.filter(o => o.status === 'paid').length,
      delivered: periodOrders.filter(o => o.status === 'delivered').length,
      byStatus: {
        all: periodOrders.length,
        pending: periodOrders.filter(o => o.status === 'pending').length,
        paid: periodOrders.filter(o => o.status === 'paid').length,
        shipped: periodOrders.filter(o => o.status === 'shipped').length,
        delivered: periodOrders.filter(o => o.status === 'delivered').length,
      },
    }
  }, [periodOrders])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return periodOrders
    return periodOrders.filter(o => o.status === statusFilter)
  }, [periodOrders, statusFilter])

  return (
    <div className="space-y-8">
      {/* Period filter */}
      <div className="flex gap-2 flex-wrap">
        {(['today', 'month', 'year', 'all'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => { setPeriod(p); setStatusFilter('all') }}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              period === p
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {periodLabel[p]}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Venituri</p>
          <p className="text-3xl font-bold serif text-stone-800">${stats.revenue.toFixed(2)}</p>
          <p className="text-xs text-stone-400 mt-1">comenzi confirmate</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Total Comenzi</p>
          <p className="text-3xl font-bold serif text-stone-800">{stats.total}</p>
          <p className="text-xs text-stone-400 mt-1">în perioada selectată</p>
        </div>
        <div className={`rounded-2xl border p-5 shadow-sm transition-colors ${
          stats.toShip > 0 ? 'bg-amber-50 border-amber-100' : 'bg-white border-stone-200'
        }`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${
            stats.toShip > 0 ? 'text-amber-600' : 'text-stone-400'
          }`}>
            De Expediat
          </p>
          <p className={`text-3xl font-bold serif ${stats.toShip > 0 ? 'text-amber-700' : 'text-stone-800'}`}>
            {stats.toShip}
          </p>
          <p className={`text-xs mt-1 ${stats.toShip > 0 ? 'text-amber-500' : 'text-stone-400'}`}>
            {stats.toShip > 0 ? 'necesită acțiune' : 'toate expediate'}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Livrate</p>
          <p className="text-3xl font-bold serif text-stone-800">{stats.delivered}</p>
          <p className="text-xs text-stone-400 mt-1">finalizate cu succes</p>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status:</span>
        {(['all', 'pending', 'paid', 'shipped', 'delivered'] as StatusFilter[]).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              statusFilter === s
                ? statusPillActive[s]
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {statusLabel[s]} ({stats.byStatus[s]})
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-stone-200 rounded-3xl bg-white">
          <p className="text-stone-400 font-medium">Nicio comandă pentru filtrele selectate.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="p-6 flex flex-col md:flex-row gap-6">
                <div className="shrink-0 flex flex-col items-center gap-2">
                  <Link href={memorialUrl(order.memorial.id)} target="_blank">
                    <div className="w-32 h-32 bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm p-1 hover:shadow-md transition-shadow">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrUrl(order.memorial.id)} alt="QR Code" className="w-full h-full" />
                    </div>
                  </Link>
                  {!order.memorial.isPublished && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                      Nepublicat
                    </span>
                  )}
                  <Link href={memorialUrl(order.memorial.id)} target="_blank" className="text-xs text-amber-600 hover:underline">
                    Vezi pagina ↗
                  </Link>
                </div>

                <div className="flex-grow space-y-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-xl font-bold serif text-stone-800">
                        {order.memorial.deceasedName || 'Memoriu fără titlu'}
                      </h2>
                      <p className="text-stone-500 text-sm">
                        {order.memorial.plan === 'premium' ? 'Moștenire Premium' : 'Memoriu de Bază'} · ${order.price.toFixed(2)}
                      </p>
                    </div>
                    <StatusSelect
                      orderId={order.id}
                      current={order.status}
                      onChange={newStatus => handleStatusChange(order.id, newStatus)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
                    <div>
                      <span className="text-stone-400 text-xs uppercase tracking-wide font-semibold">Client</span>
                      <p className="text-stone-700">{order.shippingName}</p>
                      <p className="text-stone-500">{order.shippingEmail}</p>
                      {order.shippingPhone && <p className="text-stone-500">{order.shippingPhone}</p>}
                    </div>
                    <div>
                      <span className="text-stone-400 text-xs uppercase tracking-wide font-semibold">Livrare către</span>
                      <p className="text-stone-700">{order.shippingAddress}</p>
                      <p className="text-stone-500">{order.shippingCity}, {order.shippingPostalCode}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusCardColor[order.status] || 'bg-stone-50 text-stone-500'}`}>
                      {statusLabel[order.status] || order.status}
                    </span>
                    <p className="text-xs text-stone-400">
                      #{order.id.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
