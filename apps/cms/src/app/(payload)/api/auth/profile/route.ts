import { handleCompatibleAuthRoute } from "../route-handler";

export async function PATCH(request: Request) {
  return handleCompatibleAuthRoute(request);
}
