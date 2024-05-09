// Imports
import { Request } from 'express';
import { Connection } from 'mysql2/promise';

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
  assignment_from,
  created_at,
  updated_at,
  deleted_at
`;

export const getAllUserSQL = async (
  req: Request,
  pool: Connection | null = null
): Promise<UserSQL[]> => {
  const functionName = (i: number) => 'services/user.ts : getAllUserSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT
      ${columnsGettable}
    FROM users
    ;
  `;
  const result = await SqlService.sendSqlRequest(req, sql, [], pool);

  return result;
};

export const getUserFromUsernameSQL = async (
  req: Request,
  username: string,
  pool: Connection | null = null
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
  const result = await SqlService.sendSqlRequest(req, sql, [], pool);

  return result[0];
};

export const getUserFromEmailSQL = async (
  req: Request,
  email: string,
  pool: Connection | null = null
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
  const result = await SqlService.sendSqlRequest(req, sql, [], pool);

  return result[0];
};

export const getUserFromIdSQL = async (
  req: Request,
  id: string,
  pool: Connection | null = null
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
  const result = await SqlService.sendSqlRequest(req, sql, [], pool);

  return result[0];
};

export const createUserSQL = async (
  req: Request,
  userSQL: UserSQL,
  pool: Connection | null = null
): Promise<UserSQL> => {
  const functionName = (i: number) => 'services/user.ts : createUserSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    INSERT INTO users (
      id,
      email,
      username,
      hash,
      salt,
      confirmation_code,
      subs,
      assignment_from,
      marketing
    )
    VALUES (
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?
    );
  `;
  const insertResult = await SqlService.sendSqlRequest(
    req,
    sql,
    [
      userSQL.id,
      userSQL.email,
      userSQL.username,
      userSQL.hash,
      userSQL.salt,
      userSQL.confirmation_code,
      userSQL.subs || null,
      userSQL.assignmentFrom || null,
      userSQL.marketing,
    ],
    pool
  );
  if (insertResult.affectedRows !== 1) {
    throw new AppError(CErrors.processing);
  }

  const result = getUserFromIdSQL(req, userSQL.id!, pool);

  return result;
};

export const updateUserSQL = async (
  req: Request,
  userSQL: UserSQL,
  pool: Connection | null = null
): Promise<UserSQL> => {
  const functionName = (i: number) => 'services/user.ts : updateUserSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    UPDATE users
    SET
      ${userSQL.tokens !== undefined ? 'tokens = ' + userSQL.tokens + ',' : ''}
      ${
        userSQL.token_end_date
          ? "token_end_date = '" + userSQL.token_end_date + "',"
          : ''
      }
      ${
        userSQL.firstname
          ? "firstname = '" + userSQL.firstname?.replaceAll("'", "\\'") + "',"
          : ''
      }
      ${
        userSQL.lastname
          ? "lastname = '" + userSQL.lastname?.replaceAll("'", "\\'") + "',"
          : ''
      }
      ${userSQL.birthdate ? "birthdate = '" + userSQL.birthdate + "'," : ''}
      ${userSQL.gender ? "gender = '" + userSQL.gender + "'," : ''}
      ${
        userSQL.description
          ? "description = '" + userSQL.description?.replaceAll("'", "\\'") + "',"
          : ''
      }
      ${
        typeof userSQL.picture === 'number'
          ? 'picture = ' + userSQL.picture + ','
          : ''
      }
      ${userSQL.subs ? "subs = '" + userSQL.subs + "'," : ''}
      username = '${userSQL.username}'
    WHERE
      users.id = '${userSQL.id}'
  `;
  Logger.info({ functionName: functionName(1), sql }, req);

  const insertResult = await SqlService.sendSqlRequest(req, sql, [], pool);
  if (insertResult.affectedRows !== 1) {
    throw new AppError(CErrors.processing);
  }

  const result = getUserFromIdSQL(req, userSQL.id!, pool);

  return result;
};

export const changePasswordUserSQL = async (
  req: Request,
  userSQL: UserSQL,
  // password: string,
  salt: string,
  hash: string,
  pool: Connection | null = null
): Promise<UserSQL> => {
  const functionName = (i: number) =>
    'services/user.ts : changePasswordUserSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    UPDATE users
    SET
      salt = '${salt}',
      hash = '${hash}',
      updated_at = NOW()
    WHERE
      users.id = '${userSQL.id}'
    ;
  `;

  const insertResult = await SqlService.sendSqlRequest(req, sql, [], pool);
  if (insertResult.affectedRows !== 1) {
    throw new AppError(CErrors.processing);
  }

  const result = getUserFromIdSQL(req, userSQL.id!, pool);

  return result;
};

export const valideConfirmationCode = async (
  req: Request,
  userSQL: UserSQL,
  pool: Connection | null = null
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
  const insertResult = await SqlService.sendSqlRequest(req, sql, [], pool);
  if (insertResult.affectedRows !== 1) {
    throw new AppError(CErrors.processing);
  }

  const result = getUserFromIdSQL(req, userSQL.id!, pool);

  return result;
};

export const deleteUserSQL = async (
  req: Request,
  userId: string,
  pool: Connection | null = null
): Promise<UserSQL> => {
  const functionName = (i: number) => 'services/user.ts : deleteUserSQL ' + i;
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
  const insertResult = await SqlService.sendSqlRequest(req, sql, [], pool);
  if (insertResult.affectedRows !== 1) {
    throw new AppError(CErrors.processing);
  }

  const result = getUserFromIdSQL(req, userId, pool);

  return result;
};

export const getUserFromIdWithAdminSQL = async (
  req: Request,
  id: string,
  pool: Connection | null = null
): Promise<UserSQL> => {
  const functionName = (i: number) =>
    'services/user.ts : getUserFromIdWithAdminSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT
      admin,
      ${columnsGettable}
    FROM users
    WHERE
      users.id = "${id}"
    LIMIT 1
    ;
  `;
  const result = await SqlService.sendSqlRequest(req, sql, [], pool);

  return result[0];
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
  deleteUserSQL,
  getUserFromIdWithAdminSQL,
};
