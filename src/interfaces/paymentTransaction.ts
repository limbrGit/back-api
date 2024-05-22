// Interfaces
import { PaymentOfferName } from './paymentOffer';

export enum PaymentTransactionStatus {
  Error = 'Error',
  Start = 'start',
  Waiting = 'waiting',
  Paid = 'paid',
  Expired = 'expired',
  Canceled = 'canceled',
}

export interface PaymentTransaction {
  user_email: string;
  payment_offer_name: PaymentOfferName;
  promo_code: string | null;
  status: PaymentTransactionStatus;
  vivawallet_order_code?: string | null;
}

export interface PaymentTransactionSQL extends PaymentTransaction {
  id: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}
