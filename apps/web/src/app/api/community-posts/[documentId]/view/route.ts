export async function POST(
  _req: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params
  return Response.json(
    {
      error: `Chức năng ghi nhận lượt xem cho bài cộng đồng (${documentId}) chưa được migrate sang Payload.`,
      views: 0,
    },
    { status: 501 },
  )
}
