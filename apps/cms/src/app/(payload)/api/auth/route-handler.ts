import { handleAuthRoute } from "@/routes/auth";

export async function handleCompatibleAuthRoute(request: Request): Promise<Response> {
  const response = await handleAuthRoute(request);

  if (response) {
    return response;
  }

  return Response.json(
    {
      message: "Not found",
    },
    {
      status: 404,
    },
  );
}
