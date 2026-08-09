export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const authorization = req.headers.get("authorization");

  if (!authorization) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${baseUrl}/inventory/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: authorization,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : { message: "Deleted successfully" };

  return Response.json(data, {
    status: response.status,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = (await params).id;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const body = await req.json();

  const authorization = req.headers.get("authorization");

  if (!authorization) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${baseUrl}/inventory/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return Response.json(data, {
    status: response.status,
  });
}
