export interface User {
  id?: string;
  email: string;
  password?: string;
}

export interface UserToken {
  email: string;
  exp: number;
  iat: number;
  id: string;
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
  active_date: number | null;
  confirmation_code: string;
}

export interface HashPassword {
  salt: string;
  hash: string;
}