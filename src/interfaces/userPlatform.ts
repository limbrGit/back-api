export interface UserPlatformSQL {
  id: string;
  user_email: string | null;
  platform_account_email: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  platform?: string;
}
