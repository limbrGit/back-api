// Imports
import { Request } from 'express';
import crypto from 'crypto';
import fetch from 'node-fetch';

// Config
import config from '../configs/config';

// Interfaces
import { User } from '../interfaces/user';
import { PlatformAccountSQL, PlatformInfoSQL } from '../interfaces/database';

// Tools
import { rdmString } from '../tools/strings';
import Logger from '../tools/logger';

// Constants
import CErrors from '../constants/errors';

// Classes
import AppError from '../classes/AppError';

// Services
import SqlService from './sql';

const columnsGettable = `
  id,
  email,
  iv,
  cipher,
  platform,
  date_start,
  date_end,
  active,
  subscribed,
  created_at,
  updated_at,
  deleted_at
`;

export const getPlatformAccountPassword = (
  req: Request,
  platformAccount: PlatformAccountSQL
): string => {
  const functionName = (i: number) =>
    'services/platformAccount.ts : getPlatformAccountPassword ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const deciphered = crypto.createDecipheriv(
    config.cipher.algorithm,
    Buffer.from(config.cipher[platformAccount.platform]),
    Buffer.from(platformAccount.iv)
  );
  const decipheredPhrase =
    deciphered.update(platformAccount.cipher, 'hex', 'utf-8') +
    deciphered.final('utf-8');

  return decipheredPhrase;
};

// export const getPlatformAccountsFromIds = async (
//   req: Request,
//   ids: string[]
// ): Promise<PlatformAccountSQL[]> => {
//   const functionName = (i: number) =>
//     'services/platformAccount.ts : getPlatformAccountsFromIds ' + i;
//   Logger.info({ functionName: functionName(0) }, req);

//   const sql = `
//     SELECT
//       ${columnsGettable}
//     FROM platform_accounts
//     WHERE
//       platform_accounts.id IN (${ids.map((e) => "'" + e + "'")})=
//     ;
//   `;
//   const result = await SqlService.sendSqlRequest(req, sql);
//   Logger.info({ functionName: functionName(1), result: result.length }, req);

//   return result;
// };

// export const getPlatformAccountsFromEmails = async (
//   req: Request,
//   emails: string[]
// ): Promise<PlatformAccountSQL[]> => {
//   const functionName = (i: number) =>
//     'services/platformAccount.ts : getPlatformAccountsFromEmails ' + i;
//   Logger.info({ functionName: functionName(0) }, req);

//   const sql = `
//     SELECT
//       ${columnsGettable}
//     FROM platform_accounts
//     WHERE
//       platform_accounts.email IN (${emails.map((e) => "'" + e + "'")})
//     ;
//   `;
//   const result = await SqlService.sendSqlRequest(req, sql);
//   Logger.info({ functionName: functionName(1), result: result.length }, req);

//   return result;
// };

// export const getPlatformAccountFromId = async (
//   req: Request,
//   id: string
// ): Promise<PlatformAccountSQL> => {
//   const functionName = (i: number) =>
//     'services/platformAccount.ts : getPlatformAccountFromId ' + i;
//   Logger.info({ functionName: functionName(0) }, req);

//   const sql = `
//     SELECT
//       ${columnsGettable}
//     FROM platform_accounts
//     WHERE
//       platform_accounts.id = "${id}"
//     LIMIT 1
//     ;
//   `;
//   const result = await SqlService.sendSqlRequest(req, sql);

//   const PlatformAccount = {
//     ...result[0],
//     password: getPlatformAccountPassword(req, result[0]),
//     iv: undefined,
//     cipher: undefined,
//   };

//   return PlatformAccount;
// };

export const getPlatformAccountFromEmail = async (
  req: Request,
  email: string
): Promise<PlatformAccountSQL> => {
  const functionName = (i: number) =>
    'services/platformAccount.ts : getPlatformAccountFromEmail ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT
      ${columnsGettable}
    FROM platform_accounts
    WHERE
      platform_accounts.email = "${email}"
    LIMIT 1
    ;
  `;
  const result = await SqlService.sendSqlRequest(req, sql);

  const PlatformAccount = {
    ...result[0],
    password: getPlatformAccountPassword(req, result[0]),
    iv: undefined,
    cipher: undefined,
  };

  return PlatformAccount;
};

export const createPlatformAccount = async (
  req: Request,
  platformInfo: PlatformInfoSQL
): Promise<PlatformAccountSQL> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'services/database.ts : createPlatformAccount ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Create account
  const response = await fetch(
    `${config.limbr.accountApi}/${platformInfo.name}`,
    {
      method: 'POST',
      headers: {
        Authorization: req.headers.authorization,
      },
    }
  );

  // Get the result
  const data: { email: string } = await response.json();
  Logger.info({ functionName: functionName(2), data: data }, req);

  // Get Platform Account
  const platformAccount = await getPlatformAccountFromEmail(req, data.email);

  return platformAccount;
};

// export const updatePlatformAccountPassword = async (
//   req: Request,
//   platformAccount: PlatformAccountSQL,
//   newPassword: string
// ): Promise<PlatformAccountSQL> => {
//   // Set function name for logs
//   const functionName = (i: number) =>
//     'services/database.ts : updatePlatformAccountPassword ' + i;
//   Logger.info({ functionName: functionName(0) }, req);

//   const iv = rdmString({
//     length: 16,
//     speSelect: true,
//   });
//   const cipher = crypto.createCipheriv(
//     config.cipher.algorithm,
//     Buffer.from(config.cipher[platformAccount.platform]),
//     Buffer.from(iv)
//   );
//   const cipherPhrase = Buffer.concat([
//     cipher.update(newPassword),
//     cipher.final(),
//   ]).toString('hex');

//   const sql = `
//     UPDATE platform_accounts
//     SET
//       password = '${newPassword}',
//       iv = '${iv}',
//       cipher = '${cipherPhrase}',
//       updated_at = current_timestamp()
//     WHERE
//       platform_accounts.id = '${platformAccount.id}'
//     ;
//   `;
//   const insertResult = await SqlService.sendSqlRequest(req, sql);
//   if (insertResult.affectedRows !== 1) {
//     throw new AppError(CErrors.processing);
//   }

//   const result = getPlatformAccountFromId(req, platformAccount.id);

//   return result;
// };

// export const unsubscribePlatformAccount = async (
//   req: Request,
//   platformAccount: PlatformAccountSQL
// ): Promise<PlatformAccountSQL> => {
//   // Set function name for logs
//   const functionName = (i: number) =>
//     'services/database.ts : unsubscribePlatformAccount ' + i;
//   Logger.info({ functionName: functionName(0) }, req);

//   const sql = `
//     UPDATE platform_accounts
//     SET
//       subscribed = '0',
//       updated_at = current_timestamp(),
//       deleted_at = NULL
//     WHERE
//       platform_accounts.id = '${platformAccount.id}'
//     ;
//   `;
//   const insertResult = await SqlService.sendSqlRequest(req, sql);
//   if (insertResult.affectedRows !== 1) {
//     throw new AppError(CErrors.processing);
//   }

//   const result = getPlatformAccountFromId(req, platformAccount.id);

//   return result;
// };

// export const getAllPlatformAccount = async (
//   req: Request
// ): Promise<PlatformAccountSQL[]> => {
//   // Set function name for logs
//   const functionName = (i: number) =>
//     'services/database.ts : getAllPlatformAccount ' + i;
//   Logger.info({ functionName: functionName(0) }, req);

//   const sql = `
//     SELECT
//       ${columnsGettable}
//     FROM platform_accounts
//     ;
//   `;
//   const result = await SqlService.sendSqlRequest(req, sql);

//   return result.map((e: PlatformAccountSQL[]) => ({
//     ...e,
//     password: undefined,
//     iv: undefined,
//     cipher: undefined,
//   }));
// };

export const getPlatformAccountsAvailable = async (
  req: Request,
  platforms: string[]
): Promise<PlatformAccountSQL[]> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'services/database.ts : getPlatformAccountsAvailable ' + i;
  Logger.info({ functionName: functionName(0) }, req);
  Logger.info({ functionName: functionName(1), platforms }, req);

  const sql = `
    SELECT
      ${columnsGettable
        .split(',')
        .map((e) => 'platform_accounts.' + e.trim())
        .join(',')},
      COUNT(users_platforms.id) users,
      platform_info.users_per_account
    FROM
      platform_accounts
    LEFT JOIN users_platforms
    ON
      users_platforms.platform_account_email = platform_accounts.email
      AND (
        users_platforms.end_date IS NULL
        OR users_platforms.end_date > CURRENT_TIMESTAMP()
      )
      AND users_platforms.deleted_at IS NULL
    LEFT JOIN platform_info
    ON
        platform_accounts.platform = platform_info.name
    WHERE
      platform_accounts.active = 1
      AND platform_accounts.platform IN (${platforms.map((e) => "'" + e + "'")})
    GROUP BY
      platform_accounts.email
    HAVING
      users < platform_info.users_per_account
    ORDER BY
      users DESC
    ;
  `;
  Logger.info({ functionName: functionName(1), sql: sql }, req);

  const result = await SqlService.sendSqlRequest(req, sql);

  return result;
};

// export const getAllPlatformAccountActive = async (
//   req: Request
// ): Promise<PlatformAccountSQL[]> => {
//   // Set function name for logs
//   const functionName = (i: number) =>
//     'services/database.ts : getAllPlatformAccountActive ' + i;
//   Logger.info({ functionName: functionName(0) }, req);

//   const sql = `
//     SELECT
//       ${columnsGettable}
//     FROM platform_accounts
//     WHERE
//       active = TRUE
//     ;
//   `;
//   const result = await SqlService.sendSqlRequest(req, sql);

//   return result.map((e: PlatformAccountSQL[]) => ({
//     ...e,
//     password: undefined,
//     iv: undefined,
//     cipher: undefined,
//   }));
// };

// export const desactivationPlatformAccount = async (
//   req: Request
// ): Promise<PlatformAccountSQL[]> => {
//   // Set function name for logs
//   const functionName = (i: number) =>
//     'services/database.ts : desactivationPlatformAccount ' + i;
//   Logger.info({ functionName: functionName(0) }, req);

//   let sql;

//   // Get lines to change
//   sql = `
//     SELECT id
//     FROM platform_accounts
//     WHERE
//       active = TRUE &&
//       DATEDIFF(date_end, NOW()) < 3
//     ;
//   `;
//   const lines: PlatformAccountSQL[] = await SqlService.sendSqlRequest(req, sql);
//   Logger.info({ functionName: functionName(1), lines: lines.length }, req);
//   if (lines.length === 0) {
//     return [];
//   }

//   // Change lines
//   sql = `
//     UPDATE platform_accounts
//     SET
//       active = FALSE,
//       updated_at = current_timestamp()
//     WHERE
//       id IN (${lines.map((e) => "'" + e.id + "'")})
//     ;
//   `;
//   const linesChanged = (await SqlService.sendSqlRequest(req, sql)).affectedRows;
//   Logger.info(
//     { functionName: functionName(2), linesChanged: linesChanged },
//     req
//   );

//   // Get lines changed
//   sql = `
//     SELECT
//       ${columnsGettable}
//     FROM platform_accounts
//     WHERE
//       id IN (${lines.map((e) => "'" + e.id + "'")})
//     ;
//   `;
//   const result = await SqlService.sendSqlRequest(req, sql);
//   Logger.info({ functionName: functionName(3), result: result.length }, req);

//   return result;
// };

// export const platformAccountToUnsub = async (
//   req: Request
// ): Promise<PlatformAccountSQL[]> => {
//   // Set function name for logs
//   const functionName = (i: number) =>
//     'services/database.ts : platformAccountToUnsub ' + i;
//   Logger.info({ functionName: functionName(0) }, req);

//   let sql;

//   // Get lines to change
//   sql = `
//     SELECT id, email, platform
//     FROM platform_accounts
//     WHERE
//       subscribed = TRUE &&
//       DATEDIFF(date_end, NOW()) < 2
//     ;
//   `;
//   const lines: PlatformAccountSQL[] = await SqlService.sendSqlRequest(req, sql);
//   Logger.info({ functionName: functionName(1), lines: lines.length }, req);
//   if (lines.length === 0) {
//     return [];
//   }

//   return lines;
// };

// export const platformAccountGetBadPasswords = async (
//   req: Request
// ): Promise<PlatformAccountSQL[]> => {
//   // Set function name for logs
//   const functionName = (i: number) =>
//     'services/database.ts : platformAccountGetBadPasswords ' + i;
//   Logger.info({ functionName: functionName(0) }, req);

//   let sql;

//   // Get lines to change
//   sql = `
//     SELECT id, email, platform
//     FROM platform_accounts
//     WHERE
//       (length(iv) != 16 OR length(cipher) != 32) AND
//       email like '%@lbmail.fr'
//     ;
//   `;
//   const lines: PlatformAccountSQL[] = await SqlService.sendSqlRequest(req, sql);
//   Logger.info({ functionName: functionName(1), lines: lines.length }, req);
//   if (lines.length === 0) {
//     return [];
//   }

//   return lines;
// };

export default {
  // getPlatformAccountFromId,
  getPlatformAccountFromEmail,
  getPlatformAccountPassword,
  createPlatformAccount,
  // updatePlatformAccountPassword,
  // unsubscribePlatformAccount,
  // getAllPlatformAccount,
  // getAllPlatformAccountActive,
  // desactivationPlatformAccount,
  // platformAccountToUnsub,
  // getPlatformAccountsFromIds,
  // getPlatformAccountsFromEmails,
  // platformAccountGetBadPasswords,
  getPlatformAccountsAvailable,
};
