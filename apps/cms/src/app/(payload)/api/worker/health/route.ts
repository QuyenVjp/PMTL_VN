import { getCmsPayload, jsonResponse, mapRouteError } from "@/routes/public";
import { getWorkerHealthStatus } from "@/services/worker-health.service";

export async function GET() {
  try {
    const payload = await getCmsPayload();
    const status = await getWorkerHealthStatus(payload);

    return jsonResponse(status.status === "ok" ? 200 : 503, status);
  } catch (error) {
    return mapRouteError(error);
  }
}
