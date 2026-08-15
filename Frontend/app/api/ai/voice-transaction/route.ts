import { base_url } from "@/app/constants/api";

export async function POST(req: Request) {
  const authorization = req.headers.get("authorization");

  if (!authorization) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const incomingForm = await req.formData();
  const audio = incomingForm.get("audio");

  if (!audio) {
    return Response.json({ message: "Audio file is required" }, { status: 400 });
  }

  const outgoingForm = new FormData();
  outgoingForm.append("audio", audio);

  const response = await fetch(`${base_url}/ai/voice-transaction`, {
    method: "POST",
    headers: {
      Authorization: authorization,
    },
    body: outgoingForm,
  });

  const data = await response.json();

  return Response.json(data, {
    status: response.status,
  });
}
