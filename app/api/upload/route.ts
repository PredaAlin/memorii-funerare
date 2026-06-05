import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const folder = file.type.startsWith('video/') ? 'videos' : 'media'
  const ext = file.name.split('.').pop() ?? file.type.split('/')[1] ?? 'bin'

  const blob = await put(
    `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`,
    file,
    { access: 'public', contentType: file.type }
  )

  return NextResponse.json({ url: blob.url })
}
