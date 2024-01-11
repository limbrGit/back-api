// Interfaces
import { PaymentOfferName } from './paymentOffer';

export enum PaymentTransactionStatus {
  Start = 'start',
  Waiting = 'waiting',
  Paid = 'paid',
  Expired = 'expired',
}

export interface PaymentTransaction {
  user_email: string;
  payment_offer_name: PaymentOfferName;
  status: PaymentTransactionStatus;
  vivawallet_order_code?: string | null;
}

export interface PaymentTransactionSQL extends PaymentTransaction {
  id: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}
