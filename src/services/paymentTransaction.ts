// Imports
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Interfaces
import { PaymentTransactionSQL } from '../interfaces/paymentTransaction';
import { PaymentOfferName } from '../interfaces/paymentOffer';
import { UserSQL, User } from '../interfaces/user';

// Tools
import Logger from '../tools/logger';

// Services
import SqlService from './sql';

// Classes
import AppError from '../classes/AppError';

// Constants
import CErrors from '../constants/errors';

const columnsGettable = `
  id,
  user_email,
  payment_offer_name,
  status,
  vivawallet_order_code,
  created_at,
  updated_at,
  deleted_at
`;

export const getAllPaymentTransactionFromUserSQL = async (
  req: Request,
  user: UserSQL | User
): Promise<PaymentTransactionSQL[]> => {
  const functionName = (i: number) =>
    'services/paymentTransaction.ts : getAllPaymentTransactionFromUserSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT
      ${columnsGettable}
    FROM payment_transactions
    WHERE
      user_email = ? AND
      deleted_at IS NULL
    ;
  `;
  const result: PaymentTransactionSQL[] = await SqlService.sendSqlRequest(
    req,
    sql,
    [user.email]
  );

  return result;
};

export const getPaymentTransactionFromIdSQL = async (
  req: Request,
  paymentTransactionId: string
): Promise<PaymentTransactionSQL> => {
  const functionName = (i: number) =>
    'services/paymentTransaction.ts : getPaymentTransactionFromIdSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT
      ${columnsGettable}
    FROM payment_transactions
    WHERE
      id = ? AND
      deleted_at IS NULL
    LIMIT 1
    ;
  `;
  const result: PaymentTransactionSQL[] = await SqlService.sendSqlRequest(
    req,
    sql,
    [paymentTransactionId]
  );

  return result[0];
};

export const createPaymentTransactionSQL = async (
  req: Request,
  user: UserSQL | User,
  paymentOfferName: PaymentOfferName
): Promise<PaymentTransactionSQL> => {
  const functionName = (i: number) =>
    'services/paymentTransaction.ts : createPaymentTransactionSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const id = uuidv4();

  const sql = `
    INSERT INTO payment_transactions (
      id,
      user_email,
      payment_offer_name
    )
    VALUES (
      ?,
      ?,
      ?
    )
    ;
  `;

  const insertResult = await SqlService.sendSqlRequest(req, sql, [
    id,
    user.email,
    paymentOfferName,
  ]);
  if (insertResult.affectedRows === 0) {
    throw new AppError(CErrors.processing);
  }

  const result = getPaymentTransactionFromIdSQL(req, id);

  return result;
};

export const updatePaymentTransactionSQL = async (
  req: Request,
  transaction: PaymentTransactionSQL
): Promise<PaymentTransactionSQL> => {
  const functionName = (i: number) =>
    'services/paymentTransaction.ts : updatePaymentTransactionSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    UPDATE payment_transactions
    SET
      ${transaction.status ? "status = '" + transaction.status + "'," : ''}
      ${
        transaction.vivawallet_order_code
          ? "vivawallet_order_code = '" +
            transaction.vivawallet_order_code +
            "',"
          : ''
      }
      updated_at = NOW()
    WHERE
      id = '${transaction.id}'
    ;
  `;
  const insertResult = await SqlService.sendSqlRequest(req, sql);
  if (insertResult.affectedRows !== 1) {
    throw new AppError(CErrors.processing);
  }

  const result = getPaymentTransactionFromIdSQL(req, transaction.id);

  return result;
};

export default {
  getAllPaymentTransactionFromUserSQL,
  getPaymentTransactionFromIdSQL,
  createPaymentTransactionSQL,
  updatePaymentTransactionSQL,
};
