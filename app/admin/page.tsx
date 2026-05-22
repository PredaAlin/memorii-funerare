import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { AdminDashboard } from './AdminDashboard'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    redirect('/auth/signin?callbackUrl=/admin')
  }

  const orders = await db.order.findMany({
    include: { memorial: true },
    orderBy: { createdAt: 'desc' },
  })

  // Serialize dates — Next.js passes props through JSON boundary to client components
  const serialized = orders.map(o => ({
    id: o.id,
    status: o.status,
    price: o.price,
    createdAt: o.createdAt.toISOString(),
    shippingName: o.shippingName,
    shippingEmail: o.shippingEmail,
    shippingPhone: o.shippingPhone,
    shippingAddress: o.shippingAddress,
    shippingCity: o.shippingCity,
    shippingPostalCode: o.shippingPostalCode,
    memorial: {
      id: o.memorial.id,
      deceasedName: o.memorial.deceasedName,
      plan: o.memorial.plan,
      isPublished: o.memorial.isPublished,
    },
  }))

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">Admin</p>
        <h1 className="text-4xl font-bold serif text-stone-800">Dashboard</h1>
      </div>
      <AdminDashboard
        initialOrders={serialized}
        baseUrl={process.env.NEXTAUTH_URL ?? ''}
      />
    </div>
  )
}
