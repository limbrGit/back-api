export interface PlatformAccountSQL {
  id: string;
  email: string;
  password: string;
  iv: string;
  cipher: string;
  platform: string;
  date_start: number | null;
  date_end: number | null;
  active: Boolean;
  subscribed: Boolean;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface PlatformInfoSQL {
  id: string;
  name: string;
  users_per_account: number;
  free_days: number;
  price: number | string;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}