import { Request } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql';

import config from '../configs/config';
import { UserSQL } from '../interfaces/user';
import Logger from '../tools/logger';
import AppError from '../classes/AppError';
import CErrors from '../constants/errors';

const sqlMethod = async (req: Request, sql: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const functionName = (i: number) => 'services/user.ts : SqlMethod ' + i;
    Logger.info({ functionName: functionName(0) }, req);

    const connection = mysql.createConnection({
      host: config.database.host,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
    });
    connection.connect();
    connection.query(sql, (error, results) => {
      if (error) {
        Logger.error(
          { functionName: functionName(1), data: 'SQL KO', error: error },
          req
        );
        return reject(error);
      }
      connection.end();
      Logger.error({ functionName: functionName(1), data: 'SQL OK' }, req);
      return resolve(results);
    });
  });
};

export const getAllUserSQL = async (req: Request): Promise<UserSQL[]> => {
  const functionName = (i: number) => 'services/user.ts : getAllUserSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = 'SELECT * FROM users';
  const result = await sqlMethod(req, sql);

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
  const result = await sqlMethod(req, sql);

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
  const result = await sqlMethod(req, sql);

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
      deleted_at)
    VALUES (
      '${userSQL.id}',
      '${userSQL.email}',
      '${userSQL.password}',
      '${userSQL.hash}',
      '${userSQL.salt}',
      NOW(),
      NOW(),
      NULL
    );
  `;
  const insertResult = await sqlMethod(req, sql);
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
};
