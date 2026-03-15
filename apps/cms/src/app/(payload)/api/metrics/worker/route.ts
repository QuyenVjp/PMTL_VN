import { getCmsPayload, mapRouteError } from "@/routes/public";
import { formatWorkerMetrics, getWorkerHealthStatus } from "@/services/worker-health.service";

export async function GET() {
  try {
    const payload = await getCmsPayload();
    const status = await getWorkerHealthStatus(payload);

    return new Response(formatWorkerMetrics(status), {
      status: 200,
      headers: {
        "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return mapRouteError(error);
  }
}
