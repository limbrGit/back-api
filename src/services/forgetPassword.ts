// Imports
import { Request } from 'express';
import { Connection } from 'mysql2/promise';

// Interfaces
import { UserSQL } from '../interfaces/user';
import { RessetPassword } from '../interfaces/resetPassword';

// Tools
import Logger from '../tools/logger';

// Classes
import AppError from '../classes/AppError';

// Constants
import CErrors from '../constants/errors';

// Services
import SqlService from './sql';

export const getResetPasswordTokenFromTokenSQL = async (
  req: Request,
  token: string,
  pool: Connection | null = null
): Promise<RessetPassword> => {
  const functionName = (i: number) =>
    'services/user.ts : getResetPasswordTokenFromTokenSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT *
    FROM users_reset_password
    WHERE users_reset_password.token = ?
    LIMIT 1;
  `;
  const result = await SqlService.sendSqlRequest(req, sql, [token], pool);

  return result[0];
};

export const getResetPasswordTokenFromIdSQL = async (
  req: Request,
  id: string,
  pool: Connection | null = null
): Promise<RessetPassword> => {
  const functionName = (i: number) =>
    'services/user.ts : getResetPasswordTokenFromIdSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT *
    FROM users_reset_password
    WHERE users_reset_password.id = ?
    LIMIT 1;
  `;
  const result = await SqlService.sendSqlRequest(req, sql, [id], pool);

  return result[0];
};

export const createRessetpasswordTokenSQL = async (
  req: Request,
  id: string,
  userSQL: UserSQL,
  token: string,
  expireDate: string,
  pool: Connection | null = null
): Promise<RessetPassword> => {
  const functionName = (i: number) =>
    'services/user.ts : createRessetpasswordTokenSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    INSERT INTO users_reset_password (
      id,
      email,
      token,
      created_at,
      expired_at,
      used,
      inserted_at
    ) VALUES (
      '${id}',
      '${userSQL.email}',
      '${token}',
      current_timestamp(),
      '${expireDate}',
      '0',
      NULL
    );
  `;
  const insertResult = await SqlService.sendSqlRequest(req, sql, [], pool);
  if (insertResult.affectedRows !== 1) {
    throw new AppError(CErrors.processing);
  }

  const result = getResetPasswordTokenFromIdSQL(req, id, pool);

  return result;
};

export const updateRessetpasswordTokenSQL = async (
  req: Request,
  id: string,
  pool: Connection | null = null
): Promise<RessetPassword> => {
  const functionName = (i: number) =>
    'services/user.ts : updateRessetpasswordTokenSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    UPDATE users_reset_password
    SET
      used = '1',
      inserted_at = current_timestamp()
    WHERE
      users_reset_password.id = '${id}'
    ;
  `;

  const insertResult = await SqlService.sendSqlRequest(req, sql, [], pool);
  if (insertResult.affectedRows !== 1) {
    throw new AppError(CErrors.processing);
  }

  const result = getResetPasswordTokenFromIdSQL(req, id, pool);

  return result;
};

export default {
  getResetPasswordTokenFromIdSQL,
  getResetPasswordTokenFromTokenSQL,
  createRessetpasswordTokenSQL,
  updateRessetpasswordTokenSQL,
};
