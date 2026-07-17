const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ulyah.com";

/** Error carrying the API's machine-readable `code` (e.g. "email_not_found")
 * so callers can branch on it — e.g. show a "Daftar" CTA — not just a string. */
export class ApiError extends Error {
  code?: string;
  status: number;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const { error, detail, code } = body as { error?: string; detail?: string; code?: string };
    throw new ApiError(detail || error || `Request failed: ${res.status}`, res.status, code);
  }
  return res.json() as Promise<T>;
}

export const api = {
  base: API_BASE,
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  // multipart upload — browser sets the boundary Content-Type itself
  upload: async <T>(path: string, form: FormData): Promise<T> => {
    const res = await fetch(`${API_BASE}${path}`, { method: "POST", body: form, credentials: "include" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const { error, detail } = body as { error?: string; detail?: string };
      throw new Error(detail || error || `Upload failed: ${res.status}`);
    }
    return res.json() as Promise<T>;
  },
};

export function storyAudioUrl(storyId: number): string {
  return `${API_BASE}/audio/story/${storyId}`;
}

export function ebookDownloadUrl(id: number): string {
  return `${API_BASE}/content/ebooks/${id}/download`;
}
