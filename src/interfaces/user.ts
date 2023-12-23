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
  firstname?: string | null;
  lastname?: string | null;
  birthdate?: string | null;
  gender?: string | null;
  description?: string | null;
  picture?: string | null;
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
  firstname?: string | null;
  lastname?: string | null;
  birthdate?: string | null;
  gender?: string | null;
  description?: string | null;
  picture?: string | null;
  subs: string | null;
}

export interface HashPassword {
  salt: string;
  hash: string;
}

export enum Gender {
  Male = 'male',
  Female = 'Female',
  Other = 'other',
}

export interface UpdateBody {
  username?: string;
  firstname?: string;
  lastname?: string;
  birthdate?: string;
  gender?: Gender;
  description?: string;
  picture?: string;
  subs?: Subs;
}
