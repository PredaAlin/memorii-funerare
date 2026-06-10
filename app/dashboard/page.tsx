import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { SavedToast } from './SavedToast'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/auth/signin?callbackUrl=/dashboard')

  type OrderWithMemorial = Awaited<ReturnType<typeof db.order.findFirst>> & {
    memorial: NonNullable<Awaited<ReturnType<typeof db.memorial.findFirst>>>
  }

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: { memorial: true },
    orderBy: { createdAt: 'desc' },
  }) as OrderWithMemorial[]

  const memorialUrl = (id: string) =>
    `${process.env.NEXTAUTH_URL}/memorial/${id}`

  const qrUrl = (id: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(memorialUrl(id))}&size=200x200&margin=10`

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    paid: 'bg-blue-50 text-blue-700',
    shipped: 'bg-purple-50 text-purple-700',
    delivered: 'bg-green-50 text-green-700',
  }

  const statusLabel: Record<string, string> = {
    pending: 'în așteptare',
    paid: 'plătit',
    shipped: 'expediat',
    delivered: 'livrat',
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold serif text-stone-800 mb-2">Memorialele mele</h1>
        <p className="text-stone-500">Gestionează paginile tale memoriale și urmărește comenzile.</p>
      </div>

      <Suspense>
        <SavedToast />
      </Suspense>

      {orders.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-stone-200 rounded-3xl bg-white">
          <p className="text-stone-500 mb-6">Nu ai comandat încă niciun memorial.</p>
          <Link href="/" className="px-8 py-4 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all">
            Creează Primul Tău Memorial
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="p-6 flex flex-col md:flex-row gap-6 items-start">
                {/* QR Code */}
                <div className="shrink-0">
                  {order.memorial.isPublished ? (
                    <div className="w-32 h-32 bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrUrl(order.memorial.id)} alt="QR Code" className="w-full h-full" />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-stone-100 rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-8 h-8 text-stone-300 mx-auto mb-1" viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2z" fill="currentColor"/></svg>
                        <p className="text-[8px] text-stone-400 font-bold uppercase">În așteptare</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-grow">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold serif text-stone-800">{order.memorial.deceasedName || 'Memorial fără titlu'}</h2>
                      <p className="text-stone-500 text-sm mt-1">
                        {order.memorial.plan === 'premium' ? 'Moștenire Premium' : 'Memorial de Bază'} · {order.price.toFixed(2)} lei
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${statusColor[order.status] || 'bg-stone-50 text-stone-500'}`}>
                      {statusLabel[order.status] || order.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {order.memorial.isPublished && (
                      <Link
                        href={`/memorial/${order.memorial.id}`}
                        target="_blank"
                        className="px-4 py-2 bg-stone-100 text-stone-700 rounded-full text-sm font-medium hover:bg-stone-200 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        Vezi Pagina Publică
                      </Link>
                    )}
                    <Link
                      href={`/edit/${order.memorial.id}`}
                      className="px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium hover:bg-amber-100 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      Editează
                    </Link>
                    <p className="text-xs text-stone-400 self-center">
                      Comandat {new Date(order.createdAt).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })}
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
