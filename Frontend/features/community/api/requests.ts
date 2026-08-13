import { authRequest } from "@/lib/authRequest";
import {
  CommunityPost,
  CreateCommunityPostPayload,
  UpdateCommunityPostPayload,
} from "../types";

export const getCommunityPosts = () =>
  authRequest<CommunityPost[]>("/api/community/posts", { method: "GET" });

export const getCommunityPost = (id: string) =>
  authRequest<CommunityPost>(`/api/community/posts/${id}`, { method: "GET" });

export const createCommunityPost = (payload: CreateCommunityPostPayload) =>
  authRequest<CommunityPost>("/api/community/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateCommunityPost = (
  id: string,
  payload: UpdateCommunityPostPayload
) =>
  authRequest<CommunityPost>(`/api/community/posts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteCommunityPost = (id: string) =>
  authRequest(`/api/community/posts/${id}`, { method: "DELETE" });
