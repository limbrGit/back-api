// Imports
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Connection } from 'mysql2/promise';
import crypto from 'crypto';

// Interfaces
import { Card, CardSQL } from '../interfaces/card';

// Tools
import Logger from '../tools/logger';
import { rdmString } from '../tools/strings';

// Classes
import AppError from '../classes/AppError';

// Constants
import CErrors from '../constants/errors';

// Services
import SqlService from './sql';

// Config
import config from '../configs/config';

const columnsGettable = `
  id,
  name,
  last_numbers,
  number_iv,
  number_cipher,
  month,
  year,
  crypto,
  active,
  disney,
  paramount,
  canal,
  netflix,
  created_at,
  updated_at,
  deleted_at
`;

export const getCardFromIdSQL = async (
  req: Request,
  id: string,
  pool: Connection | null = null
): Promise<CardSQL> => {
  const functionName = (i: number) =>
    'services/card.ts : getCardFromIdSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT
      ${columnsGettable}
    FROM payment_cards
    WHERE
      id = ?
      AND deleted_at IS NULL
    LIMIT 1
    ;
  `;
  const result = await SqlService.sendSqlRequest(req, sql, [id], pool);

  return result[0];
};

export const getCardFromLastNumberMonthYearAndCryptoSQL = async (
  req: Request,
  card: CardSQL,
  pool: Connection | null = null
): Promise<CardSQL> => {
  const functionName = (i: number) =>
    'services/card.ts : getCardFromLastNumberMonthYearAndCryptoSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT
      ${columnsGettable}
    FROM payment_cards
    WHERE
      last_numbers  = ?
      AND month = ?
      AND year = ?
      AND crypto = ?
      AND deleted_at IS NULL
    LIMIT 1
    ;
  `;
  const result = await SqlService.sendSqlRequest(
    req,
    sql,
    [card.last_numbers, card.month, card.year, card.crypto],
    pool
  );

  return result[0];
};

export const addCardSQL = async (
  req: Request,
  card: Card,
  pool: Connection | null = null
): Promise<CardSQL> => {
  const functionName = (i: number) => 'services/card.ts : addCardSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const id = uuidv4();

  const iv = rdmString({
    length: 16,
    speSelect: true,
  });

  const cipher = crypto.createCipheriv(
    config.cipher.algorithm,
    Buffer.from(config.cipher.cardNumber),
    Buffer.from(iv)
  );

  const cipherPhrase = Buffer.concat([
    cipher.update(card.number!),
    cipher.final(),
  ]).toString('hex');

  const sql = `
    INSERT INTO payment_cards (
      id,
      name,
      last_numbers,
      number_iv,
      number_cipher,
      month,
      year,
      crypto
    )
    VALUES (
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?
    )
    ON DUPLICATE KEY
    UPDATE
      deleted_at = NULL
    ;
  `;

  const insertResult = await SqlService.sendSqlRequest(
    req,
    sql,
    [
      id,
      card.name,
      card.number!.slice(-4),
      iv,
      cipherPhrase,
      card.month,
      card.year,
      card.crypto,
    ],
    pool
  );
  if (insertResult.affectedRows === 0) {
    throw new AppError(CErrors.processing);
  }

  const result = getCardFromLastNumberMonthYearAndCryptoSQL(
    req,
    { ...card, last_numbers: card.number!.slice(-4) } as CardSQL,
    pool
  );

  return result;
};

export const getCardNumber = (req: Request, card: CardSQL): string => {
  const functionName = (i: number) => 'services/user.ts : getCardNumber ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const deciphered = crypto.createDecipheriv(
    config.cipher.algorithm,
    Buffer.from(config.cipher.cardNumber),
    Buffer.from(card.number_iv!)
  );
  const decipheredPhrase =
    deciphered.update(card.number_cipher!, 'hex', 'utf-8') +
    deciphered.final('utf-8');

  return decipheredPhrase;
};

export const getCardFromIdWithNumberSQL = async (
  req: Request,
  id: string,
  pool: Connection | null = null
): Promise<CardSQL> => {
  const functionName = (i: number) =>
    'services/card.ts : getCardFromIdWithNumberSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const card = await getCardFromIdSQL(req, id, pool);

  const number = getCardNumber(req, card);

  return {
    ...card,
    number: number,
    last_numbers: undefined,
    number_iv: undefined,
    number_cipher: undefined,
  };
};

export const getCardForAPlatformSQL = async (
  req: Request,
  platform: string,
  pool: Connection | null = null
): Promise<CardSQL> => {
  const functionName = (i: number) =>
    'services/card.ts : getCardForAPlatformSQL ' + i;
  Logger.info({ functionName: functionName(0), platform }, req);

  const sql = `
    SELECT
      ${columnsGettable}
    FROM payment_cards
    WHERE
      deleted_at IS NULL
    ORDER BY
      ${platform} ASC,
      id DESC
    LIMIT 1
    ;
  `;
  const result = await SqlService.sendSqlRequest(req, sql, [], pool);

  return result[0];
};

export default {
  getCardFromIdSQL,
  addCardSQL,
  getCardFromIdWithNumberSQL,
  getCardForAPlatformSQL,
};
