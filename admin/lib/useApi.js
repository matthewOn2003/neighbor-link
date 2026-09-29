function getErrorMessage(data) {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof data.error === "object" &&
    data.error !== null &&
    "message" in data.error &&
    typeof data.error.message === "string"
  ) {
    return data.error.message;
  }
  return "Request failed";
}

export function useApi() {
  return async function request(route, params, options = {}) {
    const response = await fetch(`/api${route}`, {
      ...options,
      method: options.method ?? "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options.headers },
      body: params === undefined ? options.body : JSON.stringify(params),
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(getErrorMessage(data));
    }
    return data;
  };
}
