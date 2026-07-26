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
  return handle<T>(res);
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const { error, detail, code } = body as { error?: string; detail?: string; code?: string };
    throw new ApiError(detail || error || `Request failed: ${res.status}`, res.status, code);
  }
  return res.json() as Promise<T>;
}

/**
 * A GET of PUBLIC content that Next.js is allowed to cache.
 *
 * `request()` sends `credentials: "include"` on everything, and Next treats a
 * credentialed fetch as uncacheable — so a route calling it was dynamic no
 * matter what `export const revalidate` it declared. That is why 4,967 library
 * pages and 1,191 stories were rebuilt, API calls and all, on every single hit
 * from every visitor and every crawler, until the account passed the Workers
 * free plan's 100,000 requests a day and every site returned Error 1027.
 *
 * Two differences from `get`, and both are the point:
 *  · no credentials, so Next will cache the response;
 *  · an explicit `next.revalidate`, because fetch in Next 15 does not cache by
 *    default — omitting it would leave the route dynamic again.
 *
 * ONLY for endpoints whose answer is the same for everybody. A response that
 * depends on who is asking must keep using `get`: caching one would serve one
 * reader's data to the next.
 */
export function getCached<T>(path: string, revalidate: number): Promise<T> {
  return fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    next: { revalidate },
  }).then((res) => handle<T>(res));
}

export const api = {
  base: API_BASE,
  get: <T>(path: string) => request<T>(path),
  /** Public, cacheable GET — see getCached above. */
  getCached,
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  // PATCH, for endpoints that accept a partial update and keep the rest of the
  // row as it is — editing one field of a store product without having to
  // resend the ones you are not touching.
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
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
