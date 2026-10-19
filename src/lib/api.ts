export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(
      "Could not reach the server. Check that the backend is running.",
      0
    );
  }

  let result: { message?: string } | null = null;
  try {
    result = (await response.json()) as { message?: string } | null;
  } catch {
    result = null;
  }

  if (!response.ok) {
    throw new ApiError(result?.message || "Request failed", response.status);
  }

  return result as T;
}
