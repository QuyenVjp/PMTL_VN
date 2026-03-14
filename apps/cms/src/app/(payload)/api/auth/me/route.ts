import { handleCompatibleAuthRoute } from "../route-handler";

export async function GET(request: Request) {
  return handleCompatibleAuthRoute(request);
}
