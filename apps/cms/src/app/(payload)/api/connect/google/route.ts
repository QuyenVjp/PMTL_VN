import { startGoogleAuth } from "@/routes/google-auth";

export async function GET(request: Request) {
  return startGoogleAuth(request);
}
