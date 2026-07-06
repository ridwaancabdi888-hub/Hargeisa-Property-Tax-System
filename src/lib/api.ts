export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface ApiResponse {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Reads the non-httpOnly csrf_token cookie the backend sets on every response
// (double-submit-cookie CSRF pattern) so it can be echoed back as a header on
// mutating requests. The cookie is set before any user-initiated action happens
// (e.g. the initial GET /api/auth/me on app load), so it's always present by
// the time a form gets submitted.
function getCsrfCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function csrfHeaders(method: string): Record<string, string> {
  if (SAFE_METHODS.has(method.toUpperCase())) return {};
  const token = getCsrfCookie();
  return token ? { "X-CSRF-Token": token } : {};
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method ?? "GET";
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeaders(method),
      ...options.headers,
    },
    ...options,
  });

  const body = (await res.json().catch(() => ({}))) as ApiResponse;

  if (!res.ok) {
    throw new ApiError(body.message ?? "Request failed", res.status);
  }

  return body as T;
}

// For multipart/form-data uploads — no Content-Type header set here, so the browser
// can attach its own boundary. Never use apiFetch (which forces JSON) for file uploads.
export async function apiUpload<T = unknown>(path: string, formData: FormData, options: RequestInit = {}): Promise<T> {
  const method = options.method ?? "POST";
  const res = await fetch(`/api${path}`, {
    method,
    credentials: "include",
    body: formData,
    ...options,
    headers: {
      ...csrfHeaders(method),
      ...options.headers,
    },
  });

  const body = (await res.json().catch(() => ({}))) as ApiResponse;

  if (!res.ok) {
    throw new ApiError(body.message ?? "Upload failed", res.status);
  }

  return body as T;
}
