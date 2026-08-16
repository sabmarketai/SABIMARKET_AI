import { base_url } from "@/app/constants/api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const redirectTo = searchParams.get("redirectTo");

  if (!redirectTo) {
    return Response.json({ message: "redirectTo is required" }, { status: 400 });
  }

  const response = await fetch(
    `${base_url}/auth/google?redirectTo=${encodeURIComponent(redirectTo)}`,
  );

  const data = await response.json();
  console.log(data)

  return Response.json(data, {
    status: response.status,
  });
}
