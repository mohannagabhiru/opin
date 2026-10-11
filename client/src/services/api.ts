// const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = "http://localhost:5000/api";

if (!API_BASE_URL) {
  throw new Error("VITE_API_URL is not configured");
}

type ApiOptions = Omit<RequestInit, "credentials">;

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);

    throw new ApiError(
      response.status,
      body?.message ?? "Something went wrong"
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}