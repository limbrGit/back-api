export interface UserContentSQL {
  id: string;
  user_email: string | null;
  content_id: number;
  episode_id: number | null;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}
