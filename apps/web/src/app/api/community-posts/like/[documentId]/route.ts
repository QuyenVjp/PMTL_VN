export async function POST(
  _req: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params
  return Response.json(
    {
      error: `Chức năng thích bài viết cộng đồng (${documentId}) chưa được migrate sang Payload.`,
    },
    { status: 501 },
  )
}
