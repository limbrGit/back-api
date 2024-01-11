// Imports
import { Request } from 'express';

// Interfaces
import { Link } from '../interfaces/content';
import { PaymentOfferName } from '../interfaces/paymentOffer';
import {
  PaymentTransaction,
  PaymentTransactionStatus,
  PaymentTransactionSQL,
} from '../interfaces/paymentTransaction';

// Tools
import Logger from '../tools/logger';

// Constants
import CErrors from '../constants/errors';

// Classes
import AppError from '../classes/AppError';

// Services
import UserService from '../services/user';
import PaymentOfferService from '../services/paymentOffer';
import PaymentTransactionService from '../services/paymentTransaction';
import VivawalletService from '../services/vivawallet';
import { VivaPaymentOrder } from '../interfaces/vivawallet';

const startPayment = async (req: Request): Promise<PaymentTransaction> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/list.ts : startPayment ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const { paymentOfferName }: { paymentOfferName?: PaymentOfferName } =
    req.params;

  // Check param and token
  if (!paymentOfferName) {
    throw new AppError(CErrors.missingParameter);
  }

  // Check user
  const user = await UserService.getUserFromIdSQL(req, req?.user?.id);
  if (!user) {
    throw new AppError(CErrors.userNotFound);
  }
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }

  // Check offer
  const offer = await PaymentOfferService.getPaymentOfferFromIdSQL(
    req,
    paymentOfferName
  );
  if (!offer) {
    throw new AppError(CErrors.offerNotFound);
  }
  if (offer.deleted_at) {
    throw new AppError(CErrors.offerDeleted);
  }

  // Create transaction
  let transaction: PaymentTransactionSQL =
    await PaymentTransactionService.createPaymentTransactionSQL(
      req,
      user,
      paymentOfferName
    );

  // Create a Vivawallet payment order
  const vivaPaymentOrder: VivaPaymentOrder =
    await VivawalletService.createPaymentOrder(req, user, offer, transaction);
  if (!vivaPaymentOrder) {
    throw new AppError(CErrors.vivawalletPaymentOrder);
  }

  // Update transaction
  transaction = await PaymentTransactionService.updatePaymentTransactionSQL(
    req,
    {
      ...transaction,
      status: PaymentTransactionStatus.Waiting,
      vivawallet_order_code: vivaPaymentOrder.orderCode.toString(),
    }
  );

  // Return temporary just to send the link
  return transaction;
};

export default {
  startPayment,
};
