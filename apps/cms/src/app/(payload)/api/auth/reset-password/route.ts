import { handleCompatibleAuthRoute } from "../route-handler";

export async function POST(request: Request) {
  return handleCompatibleAuthRoute(request);
}
