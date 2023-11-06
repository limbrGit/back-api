// Imports
import { Request } from 'express';
import mysql from 'mysql';

// Configs
import config from '../configs/config';

// Interfaces
import { UserSQL } from '../interfaces/user';

// Tools
import Logger from '../tools/logger';

// Classes
import AppError from '../classes/AppError';

// Constants
import CErrors from '../constants/errors';

// Services
import SqlService from './sql';

export const getAllUserSQL = async (req: Request): Promise<UserSQL[]> => {
  const functionName = (i: number) => 'services/user.ts : getAllUserSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = 'SELECT * FROM users';
  const result = await SqlService.sendSqlRequest(req, sql);

  return result;
};

export const getUserFromEmailSQL = async (
  req: Request,
  email: string
): Promise<UserSQL> => {
  const functionName = (i: number) =>
    'services/user.ts : getUserFromEmailSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `SELECT * FROM users WHERE users.email = "${email}" LIMIT 1`;
  const result = await SqlService.sendSqlRequest(req, sql);

  return result[0];
};

export const getUserFromIdSQL = async (
  req: Request,
  id: string
): Promise<UserSQL> => {
  const functionName = (i: number) =>
    'services/user.ts : getUserFromIdSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `SELECT * FROM users WHERE users.id = "${id}" LIMIT 1`;
  const result = await SqlService.sendSqlRequest(req, sql);

  return result[0];
};

export const createUserSQL = async (
  req: Request,
  userSQL: UserSQL
): Promise<UserSQL> => {
  const functionName = (i: number) => 'services/user.ts : createUserSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    INSERT INTO users (
      id,
      email,
      password,
      hash,
      salt,
      created_at,
      updated_at,
      deleted_at,
      active_date,
      confirmation_code
    )
    VALUES (
      '${userSQL.id}',
      '${userSQL.email}',
      '${userSQL.password}',
      '${userSQL.hash}',
      '${userSQL.salt}',
      NOW(),
      NOW(),
      NULL,
      NULL,
      '${userSQL.confirmation_code}'
    );
  `;
  const insertResult = await SqlService.sendSqlRequest(req, sql);
  if (insertResult.affectedRows !== 1) {
    throw new AppError(CErrors.processing);
  }

  const result = getUserFromIdSQL(req, userSQL.id);

  return result;
};

export const changePasswordUserSQL = async (
  req: Request,
  userSQL: UserSQL,
  password: string,
  salt: string,
  hash: string
): Promise<UserSQL> => {
  const functionName = (i: number) => 'services/user.ts : updateUserSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    UPDATE users
    SET
      password = '${password}',
      salt = '${salt}',
      hash = '${hash}',
      updated_at = NOW()
    WHERE
      users.id = '${userSQL.id}'
    ;
  `;

  const insertResult = await SqlService.sendSqlRequest(req, sql);
  if (insertResult.affectedRows !== 1) {
    throw new AppError(CErrors.processing);
  }

  const result = getUserFromIdSQL(req, userSQL.id);

  return result;
};

export const valideConfirmationCode = async (
  req: Request,
  userSQL: UserSQL
): Promise<UserSQL> => {
  const functionName = (i: number) =>
    'services/user.ts : valideConfirmationCode ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
  UPDATE users
  SET
    updated_at = NOW(),
    active_date = NOW()
  WHERE
    users.id = '${userSQL.id}';
  `;
  const insertResult = await SqlService.sendSqlRequest(req, sql);
  if (insertResult.affectedRows !== 1) {
    throw new AppError(CErrors.processing);
  }

  const result = getUserFromIdSQL(req, userSQL.id);

  return result;
};

export default {
  getAllUserSQL,
  getUserFromEmailSQL,
  getUserFromIdSQL,
  createUserSQL,
  changePasswordUserSQL,
  valideConfirmationCode,
};
