const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ulyah.com";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  base: API_BASE,
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export function audioUrl(qoriId: number, surah: number, ayah: number): string {
  return `${API_BASE}/audio/${qoriId}/${surah}/${ayah}`;
}

export function storyAudioUrl(storyId: number): string {
  return `${API_BASE}/audio/story/${storyId}`;
}

export function ebookDownloadUrl(id: number): string {
  return `${API_BASE}/content/ebooks/${id}/download`;
}
