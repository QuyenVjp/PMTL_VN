const API = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? "http://localhost:3001";

export function getAuthToken(): null {
  return null;
}

export function buildAuthHeaders(): HeadersInit {
  return {};
}

export function buildJsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

export async function clientFetch<T = unknown>(
  path: string,
  params: Record<string, string | number | boolean> = {},
): Promise<T> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const url = `/api${path}${searchParams.toString() ? `?${searchParams}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message ?? `API Error ${response.status}: ${path}`);
  }

  return response.json();
}

export async function uploadFile(file: File): Promise<{
  id: number;
  url: string;
  name: string;
  mime: string;
  size: number;
}> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload file thất bại");
  }

  const json = await response.json();

  if (!json[0]) {
    throw new Error("Upload trả về dữ liệu trống");
  }

  return {
    id: json[0].id,
    url: json[0].url.startsWith("http") ? json[0].url : `${API}${json[0].url}`,
    name: json[0].name,
    mime: json[0].mime,
    size: json[0].size,
  };
}

export async function uploadMultipleFiles(
  files: File[],
): Promise<Array<{ id: number; url: string; name: string }>> {
  return Promise.all(files.map((file) => uploadFile(file)));
}

export function resolveUrl(media: any): string | null {
  if (!media) {
    return null;
  }

  const url = media?.url ?? null;

  if (!url) {
    return null;
  }

  return url.startsWith("http") ? url : `${API}${url}`;
}

export const CMS_CLIENT_API = API;
