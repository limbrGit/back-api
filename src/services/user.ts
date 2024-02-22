// Imports
import { Request } from 'express';

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

const columnsGettable = `
  id,
  email,
  username,
  password,
  hash,
  salt,
  tokens,
  token_end_date,
  active_date,
  confirmation_code,
  username,
  firstname,
  lastname,
  birthdate,
  gender,
  description,
  picture,
  subs,
  created_at,
  updated_at,
  deleted_at
`;

export const getAllUserSQL = async (req: Request): Promise<UserSQL[]> => {
  const functionName = (i: number) => 'services/user.ts : getAllUserSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT
      ${columnsGettable}
    FROM users
    ;
  `;
  const result = await SqlService.sendSqlRequest(req, sql);

  return result;
};

export const getUserFromUsernameSQL = async (
  req: Request,
  username: string
): Promise<UserSQL> => {
  const functionName = (i: number) =>
    'services/user.ts : getUserFromUsernameSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT
      ${columnsGettable}
    FROM users
    WHERE
      users.username = "${username}"
    LIMIT 1
    ;
  `;
  const result = await SqlService.sendSqlRequest(req, sql);

  return result[0];
};

export const getUserFromEmailSQL = async (
  req: Request,
  email: string
): Promise<UserSQL> => {
  const functionName = (i: number) =>
    'services/user.ts : getUserFromEmailSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT
      ${columnsGettable}
    FROM users
    WHERE
      users.email = "${email}"
    LIMIT 1
    ;
  `;
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

  const sql = `
    SELECT
      ${columnsGettable}
    FROM users
    WHERE
      users.id = "${id}"
    LIMIT 1
    ;
  `;
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
      username,
      password,
      hash,
      salt,
      tokens,
      active_date,
      confirmation_code,
      subs,
      created_at,
      updated_at,
      deleted_at
    )
    VALUES (
      '${userSQL.id}',
      '${userSQL.email}',
      '${userSQL.username}',
      '${userSQL.password}',
      '${userSQL.hash}',
      '${userSQL.salt}',
      0,
      NULL,
      '${userSQL.confirmation_code}',
      ${userSQL.subs ? "'" + userSQL.subs + "'" : 'NULL'},
      NOW(),
      NOW(),
      NULL
    );
  `;
  const insertResult = await SqlService.sendSqlRequest(req, sql);
  if (insertResult.affectedRows !== 1) {
    throw new AppError(CErrors.processing);
  }

  const result = getUserFromIdSQL(req, userSQL.id);

  return result;
};

export const updateUserSQL = async (
  req: Request,
  userSQL: UserSQL
): Promise<UserSQL> => {
  const functionName = (i: number) => 'services/user.ts : updateUserSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    UPDATE users
    SET
      username = '${userSQL.username}',
      ${userSQL.tokens ? "tokens = " + userSQL.tokens + "," : ''}
      ${userSQL.token_end_date ? "token_end_date = '" + userSQL.token_end_date + "'," : ''}
      ${userSQL.firstname ? "firstname = '" + userSQL.firstname + "'," : ''}
      ${userSQL.lastname ? "lastname = '" + userSQL.lastname + "'," : ''}
      ${userSQL.birthdate ? "birthdate = '" + userSQL.birthdate + "'," : ''}
      ${userSQL.gender ? "gender = '" + userSQL.gender + "'," : ''}
      ${userSQL.description ? "description = '" + userSQL.description + "'," : ''}
      ${typeof userSQL.picture === "number" ? "picture = " + userSQL.picture + "," : ''}
      ${userSQL.subs ? "subs = '" + userSQL.subs + "'," : ''}
      updated_at = NOW()
    WHERE
      users.id = '${userSQL.id}'
  `;
  Logger.info({ functionName: functionName(1), sql }, req);

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

export const deleteUserSQL = async (
  req: Request,
  userId: string
): Promise<UserSQL> => {
  const functionName = (i: number) =>
    'services/user.ts : deleteUserSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
  UPDATE users
  SET
    firstname = NULL,
    lastname = NULL,
    birthdate = NULL,
    gender = NULL,
    description = NULL,
    deleted_at = NOW()
  WHERE
    users.id = '${userId}';
  `;
  const insertResult = await SqlService.sendSqlRequest(req, sql);
  if (insertResult.affectedRows !== 1) {
    throw new AppError(CErrors.processing);
  }

  const result = getUserFromIdSQL(req, userId);

  return result;
};


export default {
  getAllUserSQL,
  getUserFromUsernameSQL,
  getUserFromEmailSQL,
  getUserFromIdSQL,
  createUserSQL,
  updateUserSQL,
  changePasswordUserSQL,
  valideConfirmationCode,
  deleteUserSQL
};
