export interface User {
  email: string;
  password: string;
}

export interface UserSQL {
  id: string;
  email: string;
  password: string;
  hash: string;
  salt: string;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}
