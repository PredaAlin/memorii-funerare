import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import StatusSelect from './StatusSelect'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    redirect('/auth/signin?callbackUrl=/admin')
  }

  const orders = await db.order.findMany({
    include: { memorial: true, user: true },
    orderBy: { createdAt: 'desc' },
  })

  const memorialUrl = (id: string) =>
    `${process.env.NEXTAUTH_URL}/memorial/${id}`

  const qrUrl = (id: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(memorialUrl(id))}&size=200x200&margin=10`

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">Admin</p>
          <h1 className="text-4xl font-bold serif text-stone-800">All Orders</h1>
        </div>
        <span className="text-stone-400 text-sm">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-stone-200 rounded-3xl bg-white">
          <p className="text-stone-500">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="p-6 flex flex-col md:flex-row gap-6">

                {/* QR Code */}
                <div className="shrink-0 flex flex-col items-center gap-2">
                  {order.memorial.isPublished ? (
                    <>
                      <div className="w-32 h-32 bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrUrl(order.memorial.id)} alt="QR Code" className="w-full h-full" />
                      </div>
                      <Link
                        href={memorialUrl(order.memorial.id)}
                        target="_blank"
                        className="text-xs text-amber-600 hover:underline"
                      >
                        View page ↗
                      </Link>
                    </>
                  ) : (
                    <div className="w-32 h-32 bg-stone-100 rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-8 h-8 text-stone-300 mx-auto mb-1" viewBox="0 0 24 24">
                          <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2z" fill="currentColor"/>
                        </svg>
                        <p className="text-[8px] text-stone-400 font-bold uppercase">Unpublished</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-grow space-y-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-xl font-bold serif text-stone-800">
                        {order.memorial.deceasedName || 'Untitled Memorial'}
                      </h2>
                      <p className="text-stone-500 text-sm">
                        {order.memorial.plan === 'premium' ? 'Premium Legacy' : 'Basic Memorial'} · ${order.price.toFixed(2)}
                      </p>
                    </div>
                    <StatusSelect orderId={order.id} current={order.status} />
                  </div>

                  {/* Customer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
                    <div>
                      <span className="text-stone-400 text-xs uppercase tracking-wide font-semibold">Customer</span>
                      <p className="text-stone-700">{order.shippingName}</p>
                      <p className="text-stone-500">{order.shippingEmail}</p>
                      {order.shippingPhone && <p className="text-stone-500">{order.shippingPhone}</p>}
                    </div>
                    <div>
                      <span className="text-stone-400 text-xs uppercase tracking-wide font-semibold">Ship to</span>
                      <p className="text-stone-700">{order.shippingAddress}</p>
                      <p className="text-stone-500">{order.shippingCity}, {order.shippingPostalCode}</p>
                    </div>
                  </div>

                  <p className="text-xs text-stone-400">
                    Order #{order.id.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
