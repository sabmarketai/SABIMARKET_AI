import { base_url } from "@/app/constants/api";

export async function PATCH(req: Request) {
  const authorization = req.headers.get("Authorization");

  if (!authorization) {
    return Response.json({
      status: 401,
      message: "Unauthorized please log in",
    });
  }
  const body = await req.json();
  const response = await fetch(`${base_url}/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  console.log(data)
  return Response.json(data, {
    status: response.status,
  });
}
