export interface PaymentOffersValues {
  discovery: number;
  'movie-lover': number;
  'addict-series': number;
}

export interface PaymentPromoCode {
  name: string;
  tokens: PaymentOffersValues | string;
  discount: PaymentOffersValues | string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export interface PaymentPromoCodeSQL extends PaymentPromoCode {
  id: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}
