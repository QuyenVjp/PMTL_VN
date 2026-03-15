import { NextResponse } from "next/server";

export function POST() {
  return NextResponse.json(
    {
      processed: false,
      reason: "worker-managed-in-cms",
    },
    { status: 410 },
  );
}
