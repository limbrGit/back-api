export interface VivaAccessToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface VivaPaymentOrder {
  orderCode: number;
}
