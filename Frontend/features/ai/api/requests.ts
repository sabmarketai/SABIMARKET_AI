import { authRequest } from "@/lib/authRequest";
import { getAccessToken, refreshAccessToken } from "@/lib/session";
import { AiTransactionResult, MarketRecommendation, PricePrediction } from "../types";
// import { base_url } from "@/app/constants/api";

const base_url = process.env.NEXT_PUBLIC_BASE_URL;
export const extractTextTransaction = (transcript: string) =>
  authRequest<AiTransactionResult>("/api/ai/extract-text", {
    method: "POST",
    body: JSON.stringify({ transcript }),
  });

export const predictPrice = (item: string, market?: string) => {
  const params = new URLSearchParams({ item });
  if (market) params.set("market", market);
  return authRequest<PricePrediction>(`/api/ai/predict?${params.toString()}`, {
    method: "GET",
  });
};

export const recommendMarket = (item: string, action: "buy" | "sell") => {
  const params = new URLSearchParams({ item, action });
  return authRequest<MarketRecommendation>(
    `/api/ai/recommend?${params.toString()}`,
    { method: "GET" }
  );
};

async function postAudio(url: string, token: string | null, audio: Blob) {
  const formData = new FormData();
  formData.append("audio", audio, "recording.webm");

  return fetch(url, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
}

export async function voiceTransaction(audio: Blob): Promise<AiTransactionResult> {
  let token = await getAccessToken();
  let response = await postAudio(`${base_url}/ai/voice-transaction`, token, audio);

  if (response.status === 401) {
    token = await refreshAccessToken();
    if (token) {
      response = await postAudio(`${base_url}/ai/voice-transaction`, token, audio);
    }
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong");
  }

  return data as AiTransactionResult;
}
