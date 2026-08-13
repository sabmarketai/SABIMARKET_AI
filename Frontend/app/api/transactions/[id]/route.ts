import { base_url } from "@/app/constants/api";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authorization = req.headers.get("authorization");

  if (!authorization) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${base_url}/transactions/${id}`, {
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authorization = req.headers.get("authorization");

  if (!authorization) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const response = await fetch(`${base_url}/transactions/${id}`, {
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authorization = req.headers.get("authorization");

  if (!authorization) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${base_url}/transactions/${id}`, {
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
