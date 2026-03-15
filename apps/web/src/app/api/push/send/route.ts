import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { queuePushJob } from "@/lib/push-server";

export async function POST(req: NextRequest) {
  const secret = process.env.PUSH_SEND_SECRET;
  const authHeader = req.headers.get("Authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      kind = "daily_chant",
      title = "Nhắc Niệm Kinh",
      body = "Đến giờ niệm kinh hôm nay rồi, hãy dành vài phút tu tập nhé!",
      url = "/niem-kinh",
      tag = "daily-reminder",
      chunkSize = 100,
      payload = {},
    } = await req.json().catch(() => ({}));

    const job = await queuePushJob({
      kind,
      title,
      body,
      url,
      tag,
      payload,
      chunkSize: Math.max(1, Math.min(500, Number(chunkSize) || 100)),
    });

    return NextResponse.json({
      queued: true,
      workerDriven: true,
      job,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Không thể tạo hàng đợi push" },
      { status: 500 },
    );
  }
}
