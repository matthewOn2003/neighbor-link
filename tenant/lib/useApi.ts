type ApiOptions = RequestInit & {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
};

function getErrorMessage(data: unknown) {
  if (typeof data === "object" && data !== null && "error" in data && typeof data.error === "string") {
    return data.error;
  }
  return "Request failed";
}

export function useApi() {
  return async function request<TResponse = unknown>(route: string, params?: unknown, options: ApiOptions = {}) {
    const response = await fetch(`/api${route}`, {
      ...options,
      method: options.method ?? "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options.headers },
      body: params === undefined ? options.body : JSON.stringify(params),
    });
    const data: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(getErrorMessage(data));
    }
    return data as TResponse;
  };
}