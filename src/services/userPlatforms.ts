// Imports
import { Request } from 'express';
import fetch from 'node-fetch';
import { Connection } from 'mysql2/promise';

// Interfaces
import { UserSQL } from '../interfaces/user';
import { UserPlatformSQL } from '../interfaces/userPlatform';
import { PlatformAccountSQL } from '../interfaces/database';

// Tools
import Logger from '../tools/logger';

// Classes
import AppError from '../classes/AppError';

// Constants
import CErrors from '../constants/errors';

// Services
import SqlService from './sql';

// Config
import config from '../configs/config';
import { Agent } from 'https';

const columnsGettable = `
  id,
  user_email,
  platform_account_email,
  start_date,
  end_date,
  created_at,
  updated_at,
  deleted_at
`;

interface GetUserPlatformsFromUserSQL {
  user: UserSQL;
  active?: boolean;
  pool?: Connection | null;
}

export const getUserPlatformsFromUserSQL = async (
  req: Request,
  data: GetUserPlatformsFromUserSQL
): Promise<UserPlatformSQL[]> => {
  const { user, active = true, pool = null } = data;

  const functionName = (i: number) =>
    'services/userPlatforms.ts : getUserPlatformsFromUserSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT
      ${columnsGettable
        .split(',')
        .map((e) => 'users_platforms.' + e)
        .join(',')},
      platform_accounts.platform
    FROM users_platforms
    INNER JOIN platform_accounts
    ON
      users_platforms.platform_account_email = platform_accounts.email
    WHERE
      ${active ? 'end_date > NOW()  AND' : ''}
      user_email = ?
      AND users_platforms.deleted_at IS NULL
    ;
  `;
  Logger.info({ functionName: functionName(1), sql: sql, email: user.email }, req);

  const result: UserPlatformSQL[] = await SqlService.sendSqlRequest(
    req,
    sql,
    [user.email],
    pool
  );

  return result;
};

interface GetUserPlatformsFromPlatformSQL {
  platformAccount: PlatformAccountSQL;
  active?: boolean;
  pool?: Connection | null;
}

export const getUserPlatformsFromPlatformSQL = async (
  req: Request,
  data: GetUserPlatformsFromPlatformSQL
): Promise<UserPlatformSQL[]> => {
  const { platformAccount, active = true, pool = null } = data;

  const functionName = (i: number) =>
    'services/userPlatforms.ts : getUserPlatformsFromPlatformSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT
    ${columnsGettable
      .split(',')
      .map((e) => 'users_platforms.' + e)
      .join(',')},
      platform_accounts.platform
    FROM users_platforms
    INNER JOIN platform_accounts
    ON
      users_platforms.platform_account_email = platform_accounts.email
    WHERE
      ${active ? 'end_date > DATE(NOW())  AND' : ''}
      platform_account_email = ?
      AND users_platforms.deleted_at IS NULL
    ;
  `;
  const result: UserPlatformSQL[] = await SqlService.sendSqlRequest(
    req,
    sql,
    [platformAccount.email],
    pool
  );

  return result;
};

interface GetUserPlatformsFromUserAndPlatformSQL {
  user: UserSQL;
  platformAccount: PlatformAccountSQL;
  active?: boolean;
  pool?: Connection | null;
}

export const getUserPlatformsFromUserAndPlatformSQL = async (
  req: Request,
  data: GetUserPlatformsFromUserAndPlatformSQL
): Promise<UserPlatformSQL[]> => {
  const { user, platformAccount, active = true, pool = null } = data;

  const functionName = (i: number) =>
    'services/userPlatforms.ts : getUserPlatformsFromUserAndPlatformSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT
    ${columnsGettable
      .split(',')
      .map((e) => 'users_platforms.' + e)
      .join(',')},
      platform_accounts.platform
    FROM users_platforms
    INNER JOIN platform_accounts
    ON
      users_platforms.platform_account_email = platform_accounts.email
    WHERE
      ${active ? 'end_date > DATE(NOW())  AND' : ''}
      user_email = ? AND
      platform_account_email = ?
      AND users_platforms.deleted_at IS NULL
    ;
  `;
  const result: UserPlatformSQL[] = await SqlService.sendSqlRequest(
    req,
    sql,
    [user.email, platformAccount.email],
    pool
  );

  return result;
};

export const createUserPlatformsSQL = async (
  req: Request,
  user: UserSQL,
  platformAccount: PlatformAccountSQL,
  endDate: string,
  pool: Connection | null = null
): Promise<UserPlatformSQL> => {
  const functionName = (i: number) =>
    'services/list.ts : createUserPlatformsSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    INSERT INTO users_platforms (
      id,
      user_email,
      platform_account_email,
      start_date,
      end_date,
      created_at,
      updated_at,
      deleted_at
    )
    VALUES (
      uuid(),
      ?,
      ?,
      current_timestamp(),
      ?,
      current_timestamp(),
      current_timestamp(),
      NULL
    )
    ;
  `;

  const insertResult = await SqlService.sendSqlRequest(
    req,
    sql,
    [user.email, platformAccount.email, endDate],
    pool
  );
  if (insertResult.affectedRows === 0) {
    throw new AppError(CErrors.processing);
  }

  const result: UserPlatformSQL[] =
    await getUserPlatformsFromUserAndPlatformSQL(req, {
      user,
      platformAccount,
      pool,
    });

  return result[0];
};

export const getUserPlatformOtp = async (
  req: Request,
  userPlatform: UserPlatformSQL,
  startTimer: string
): Promise<{ digit: string }> => {
  const functionName = (i: number) =>
    'services/list.ts : getUserPlatformOtp ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Create account
  const response = await fetch(
    `${config.limbr.accountApi}/${userPlatform.platform}/otp?email=${userPlatform.platform_account_email}&startTimer=${startTimer}`,
    {
      method: 'GET',
      headers: {
        Authorization: req.headers.authorization,
      },
    }
  );

  // Get the result
  const data: { digit: string } = await response.json();
  Logger.info({ functionName: functionName(2), data: data }, req);

  return data;
};

export default {
  getUserPlatformsFromUserSQL,
  getUserPlatformsFromPlatformSQL,
  getUserPlatformsFromUserAndPlatformSQL,
  createUserPlatformsSQL,
  getUserPlatformOtp,
};
