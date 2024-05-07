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
  // password?: string;
  username: string;
  tokens: number;
  token_end_date: number | string | null;
  firstname?: string | null;
  lastname?: string | null;
  birthdate?: string | null;
  gender?: string | null;
  description?: string | null;
  picture?: string | null;
  subs?: string[] | string;
  admin?: boolean;
}

export interface UserToken {
  email: string;
  exp: number;
  iat: number;
  id: string;
}

export interface UserSQL extends User {
  // id: string;
  // email: string;
  // username: string;
  // password: string;
  hash?: string;
  salt?: string;
  // tokens: number;
  // token_valid: number;
  active_date: number | null;
  confirmation_code?: string;
  // firstname?: string | null;
  // lastname?: string | null;
  // birthdate?: string | null;
  // gender?: string | null;
  // description?: string | null;
  // picture?: string | null;
  // subs: string | null;
  assignmentFrom: string | null;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface HashPassword {
  salt: string;
  hash: string;
}

export enum Gender {
  Male = 'male',
  Female = 'female',
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
  subs?: string | string[];
}
