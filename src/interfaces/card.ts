export interface Card {
  name: string;
  number?: string;
  month: string;
  year: string;
  crypto: string;
}

export interface CardSQL extends Card {
  id: string;
  last_numbers?: string;
  number_iv?: string;
  number_cipher?: string;
  active: boolean;
  disney: number;
  paramount: number;
  canal: number;
  netflix: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}
