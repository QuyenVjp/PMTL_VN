import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params

  return NextResponse.json(
    {
      data: null,
      error: `Bài cộng đồng "${documentId}" chưa sẵn sàng trên Payload API.`,
    },
    {
      status: 404,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
}
