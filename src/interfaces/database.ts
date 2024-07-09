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
  registration?: string;
  creation_waiting_list: number;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
  users?: number;
  users_per_account?: number;
}

export interface PlatformInfoSQL {
  id: string;
  name: string;
  users_per_account: number;
  free_days: number;
  price: number | string;
  month_before_end: number;
  valid: number;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}