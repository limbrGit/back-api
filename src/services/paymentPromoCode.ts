// Imports
import { Request } from 'express';
import { Connection } from 'mysql2/promise';

// Interfaces
import { PaymentPromoCodeSQL } from '../interfaces/paymentPromoCode';

// Tools
import Logger from '../tools/logger';

// Services
import SqlService from './sql';

const columnsGettable = `
  id,
  name,
  tokens,
  discount,
  created_at,
  updated_at,
  deleted_at
`;

export const getPaymentPromoCodeByNameSQL = async (
  req: Request,
  code: string,
  pool: Connection | null = null
): Promise<PaymentPromoCodeSQL> => {
  const functionName = (i: number) =>
    'services/paymentOffer.ts : getPaymentPromoCodeByNameSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT
      ${columnsGettable}
    FROM payment_promo_code
    WHERE
      name = ? AND
      deleted_at IS NULL
    LIMIT 1
    ;
  `;
  const result: PaymentPromoCodeSQL[] = await SqlService.sendSqlRequest(
    req,
    sql,
    [code],
    pool
  );

  if (result[0]) {
    return {
      ...result[0],
      tokens: JSON.parse(result[0].tokens as string),
      discount: JSON.parse(result[0].discount as string),
    };
  }

  return result[0];
};

export default {
  getPaymentPromoCodeByNameSQL,
};
