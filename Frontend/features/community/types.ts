export interface CommunityPostAuthor {
  id: string;
  full_name: string | null;
  market_location: string | null;
}

export interface CommunityPost {
  id: string;
  user_id: string | null;
  title: string | null;
  content: string | null;
  created_at: string | null;
  users?: CommunityPostAuthor | null;
}

export interface CreateCommunityPostPayload {
  title: string;
  content: string;
}

export interface UpdateCommunityPostPayload {
  title?: string;
  content?: string;
}
