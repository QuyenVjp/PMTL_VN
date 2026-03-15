export async function POST() {
  return Response.json(
    {
      error: 'Chức năng gửi bài cộng đồng chưa được migrate sang Payload.',
    },
    { status: 501 },
  )
}
