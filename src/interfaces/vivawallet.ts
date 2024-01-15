export interface VivaAccessToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface VivaPaymentOrderCreation {
  orderCode: number;
}

export interface VivaPaymentOrder {
  OrderCode: number;
  SourceCode: string;
  Tags: string[];
  TipAmount: number;
  RequestLang: string;
  MerchantTrns: string;
  CustomerTrns: string;
  MaxInstallments: number;
  RequestAmount: number;
  ExpirationDate: string;
  StateId: number;
}
