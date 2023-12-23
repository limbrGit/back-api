export interface List {
  user_email: string;
  content_id: number;
}

export interface ListSQL extends List {
  id: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}
