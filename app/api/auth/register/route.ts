import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { rateLimit, clientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  // L1: throttle account creation per IP to slow automated signups and
  // brute-force email enumeration. Best-effort in-memory guard.
  if (!rateLimit(`register:${clientIp(req)}`, 5, 15 * 60_000)) {
    return NextResponse.json({ error: 'Prea multe încercări. Încearcă din nou mai târziu.' }, { status: 429 })
  }

  const { name, email, password } = await req.json()

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await db.user.create({ data: { name, email, password: hashed } })

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
}
