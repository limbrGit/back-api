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
import { UserSQL } from '../interfaces/user';

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
    throw new AppError(CErrors.vivawalletCreatePaymentOrder);
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

const checkPayment = async (req: Request): Promise<PaymentTransaction> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/list.ts : checkPayment ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const { vivawalletOfferCode }: { vivawalletOfferCode?: string } = req.params;

  // Check param and token
  if (!vivawalletOfferCode) {
    throw new AppError(CErrors.missingParameter);
  }

  // Check user
  let user = await UserService.getUserFromIdSQL(req, req?.user?.id);
  if (!user) {
    throw new AppError(CErrors.userNotFound);
  }
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }

  // Get transaction
  let transaction: PaymentTransactionSQL =
    await PaymentTransactionService.getPaymentTransactionFromVivawalletOrderCodeSQL(
      req,
      vivawalletOfferCode
    );
  if (!transaction) {
    throw new AppError(CErrors.transactionNotFound);
  }
  if (transaction.status !== PaymentTransactionStatus.Waiting) {
    throw new AppError(CErrors.transactionOver);
  }

  // Check Vivawallet payment order
  const vivawalletPaymentOrder =
    await VivawalletService.getPaymentOrderFromOrderCode(req, transaction);
  if (!vivawalletPaymentOrder) {
    throw new AppError(CErrors.vivawalletGetPaymentOrder);
  }

  // Get new status
  const getNewStatus = (stateId: number): PaymentTransactionStatus => {
    if (stateId === 0) {
      return PaymentTransactionStatus.Waiting;
    } else if (stateId === 1) {
      return PaymentTransactionStatus.Expired;
    } else if (stateId === 2) {
      return PaymentTransactionStatus.Canceled;
    } else if (stateId === 3) {
      return PaymentTransactionStatus.Paid;
    }
    return PaymentTransactionStatus.Error;
  };
  const newStatus = getNewStatus(vivawalletPaymentOrder.StateId);

  // If transaction is paid
  if (newStatus === PaymentTransactionStatus.Paid) {
    // Get offer
    const offer = await PaymentOfferService.getPaymentOfferFromIdSQL(
      req,
      transaction.payment_offer_name
    );
    if (!offer) {
      throw new AppError(CErrors.offerNotFound);
    }

    // Update user in DB with new tokens
    user = await UserService.updateUserSQL(req, {
      ...user,
      birthdate: undefined,
      tokens: user.tokens + offer.tokens,
    });
    if (!user) {
      throw new AppError(CErrors.getUser);
    }
  }

  // Update transaction
  transaction = await PaymentTransactionService.updatePaymentTransactionSQL(
    req,
    {
      ...transaction,
      status: newStatus,
    }
  );

  // Return temporary just to send the link
  return transaction;
};

export default {
  startPayment,
  checkPayment,
};
