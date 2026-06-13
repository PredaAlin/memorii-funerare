import { NextRequest, NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

export async function POST(req: NextRequest) {
  const body = (await req.json()) as HandleUploadBody
  const jsonResponse = await handleUpload({
    body,
    request: req,
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: ['image/*', 'video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'video/*'],
      maximumSizeInBytes: 500 * 1024 * 1024,
    }),
    onUploadCompleted: async () => {},
  })
  return NextResponse.json(jsonResponse)
}
