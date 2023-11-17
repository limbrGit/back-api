export interface Subs {
  netflix?: boolean;
  prime?: boolean;
  disney?: boolean;
  ocs?: boolean;
  canal?: boolean;
  paramount?: boolean;
  apple?: boolean;
  bein?: boolean;
  crunchyroll?: boolean;
}

export interface User {
  id?: string;
  email: string;
  password?: string;
  username: string;
  subs?: Subs;
  admin?: boolean;
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
  username: string;
  password: string;
  hash: string;
  salt: string;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
  active_date: number | null;
  confirmation_code: string;
  subs: string | null;
}

export interface HashPassword {
  salt: string;
  hash: string;
}
