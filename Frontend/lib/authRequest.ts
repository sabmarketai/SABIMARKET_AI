import { getAccessToken, refreshAccessToken } from "./session";

async function doFetch(url: string, token: string | null, options: RequestInit) {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

export async function authRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  let token = await getAccessToken();
  let response = await doFetch(url, token, options);

  if (response.status === 401) {
    token = await refreshAccessToken();

    if (token) {
      response = await doFetch(url, token, options);
    }

    if (!token || response.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
      throw new Error("Your session has expired. Please log in again.");
    }
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong");
  }

  return data as T;
}
