import { NextRequest, NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Explicit allowlist — no `image/*` / `video/*` wildcards (those would admit
// SVG and other script-capable types). Covers browser-compressed photos and
// the video formats the editor accepts.
const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-m4v',
]

const MAX_UPLOAD_BYTES = 200 * 1024 * 1024 // 200MB per file

export async function POST(req: NextRequest) {
  const body = (await req.json()) as HandleUploadBody
  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      // H1: only signed-in users may mint an upload token. Without this the
      // endpoint is an open door to dump arbitrary files into Blob storage.
      onBeforeGenerateToken: async () => {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
          throw new Error('Unauthorized')
        }
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
        }
      },
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(jsonResponse)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload error'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
