export enum PaymentOfferName {
  AddictSeries = 'addict-series',
  Discovery = 'discovery',
  MovieLover = 'movie-lover',
}

export interface PaymentOffer {
  name: PaymentOfferName;
  pricing: number;
  tokens: number;
}

export interface PaymentOfferSQL extends PaymentOffer {
  id: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}
