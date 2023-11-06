export interface RessetPassword {
  id: string;
  email: string;
  token: string;
  created_at: string;
  expired_at: string;
  used: boolean;
  inserted_at: string | null;
}
