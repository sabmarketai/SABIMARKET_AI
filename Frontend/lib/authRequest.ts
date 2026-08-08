export async function authRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = sessionStorage.getItem("accessToken");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}