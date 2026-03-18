import { finishGoogleAuth } from "@/routes/google-auth";

export async function GET(request: Request) {
  return finishGoogleAuth(request);
}
