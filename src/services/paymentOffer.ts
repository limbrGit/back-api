// Imports
import { Request } from 'express';

// Interfaces
import { PaymentOfferSQL, PaymentOfferName } from '../interfaces/paymentOffer';

// Tools
import Logger from '../tools/logger';

// Services
import SqlService from './sql';

const columnsGettable = `
  id,
  name,
  pricing,
  tokens,
  created_at,
  updated_at,
  deleted_at
`;

export const getPaymentOfferFromIdSQL = async (
  req: Request,
  paymentOfferName: PaymentOfferName
): Promise<PaymentOfferSQL> => {
  const functionName = (i: number) =>
    'services/paymentOffer.ts : getPaymentOfferFromIdSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT
      ${columnsGettable}
    FROM payment_offers
    WHERE
      name = '${paymentOfferName}' AND
      deleted_at IS NULL
    LIMIT 1
    ;
  `;
  const result: PaymentOfferSQL[] = await SqlService.sendSqlRequest(
    req,
    sql,
    []
  );

  return result[0];
};

export default {
  getPaymentOfferFromIdSQL,
};
