import { base_url } from "@/app/constants/api";

export async function GET(req: Request) {
  const authorization = req.headers.get("authorization");

  if (!authorization) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${base_url}/notifications/unread`, {
    method: "GET",
    headers: {
      Authorization: authorization,
    },
  });

  const data = await response.json();

  return Response.json(data, {
    status: response.status,
  });
}
