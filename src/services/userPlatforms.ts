// Imports
import { Request } from 'express';

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

export const getUserPlatformsFromUserSQL = async (
  req: Request,
  user: UserSQL,
  active: boolean = true
): Promise<UserPlatformSQL[]> => {
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
      ${active ? 'end_date > DATE(NOW())  AND' : ''}
      user_email = ?
    ;
  `;
  const result: UserPlatformSQL[] = await SqlService.sendSqlRequest(req, sql, [
    user.email,
  ]);

  return result;
};

export const getUserPlatformsFromPlatformSQL = async (
  req: Request,
  platformAccount: PlatformAccountSQL,
  active: boolean = true
): Promise<UserPlatformSQL[]> => {
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
    ;
  `;
  const result: UserPlatformSQL[] = await SqlService.sendSqlRequest(req, sql, [
    platformAccount.email,
  ]);

  return result;
};

export const getUserPlatformsFromUserAndPlatformSQL = async (
  req: Request,
  user: UserSQL,
  platformAccount: PlatformAccountSQL,
  active: boolean = true
): Promise<UserPlatformSQL[]> => {
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
      user_email = ? AND
      platform_account_email = ?
    ;
  `;
  const result: UserPlatformSQL[] = await SqlService.sendSqlRequest(req, sql, [
    user.email,
    platformAccount.email,
  ]);

  return result;
};

export const createUserPlatformsSQL = async (
  req: Request,
  user: UserSQL,
  platformAccount: PlatformAccountSQL,
  endDate: string
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

  const insertResult = await SqlService.sendSqlRequest(req, sql, [
    user.email,
    platformAccount.email,
    endDate,
  ]);
  if (insertResult.affectedRows === 0) {
    throw new AppError(CErrors.processing);
  }

  const result: UserPlatformSQL[] =
    await getUserPlatformsFromUserAndPlatformSQL(req, user, platformAccount);

  return result[0];
};

export default {
  getUserPlatformsFromUserSQL,
  getUserPlatformsFromPlatformSQL,
  getUserPlatformsFromUserAndPlatformSQL,
  createUserPlatformsSQL,
};
