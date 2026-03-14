export function GET() {
  return Response.json({
    status: "ok",
    service: "cms",
    now: new Date().toISOString(),
  });
}
