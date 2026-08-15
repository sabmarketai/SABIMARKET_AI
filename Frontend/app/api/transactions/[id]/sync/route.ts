import { base_url } from "@/app/constants/api";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authorization = req.headers.get("authorization");

  if (!authorization) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${base_url}/transactions/${id}/sync`, {
    method: "POST",
    headers: {
      Authorization: authorization,
    },
  });

  const data = await response.json();

  return Response.json(data, {
    status: response.status,
  });
}
