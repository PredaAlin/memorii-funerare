import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') ?? ''

  // Client-side upload: browser requests a token, then uploads directly to Blob
  if (contentType.includes('application/json')) {
    const body = (await req.json()) as HandleUploadBody
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'video/*'],
        maximumSizeInBytes: 500 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(jsonResponse)
  }

  // Server-side upload for compressed images (always small after canvas compression)
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const ext = file.name.split('.').pop() ?? file.type.split('/')[1] ?? 'bin'
  const blob = await put(
    `media/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`,
    file,
    { access: 'public', contentType: file.type }
  )

  return NextResponse.json({ url: blob.url })
}
