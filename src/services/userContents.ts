// Imports
import { Request } from 'express';
import { Connection } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

// Interfaces
import { UserSQL } from '../interfaces/user';
import { UserContentSQL } from '../interfaces/userContent';

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
  content_id,
  episode_id,
  created_at,
  updated_at,
  deleted_at
`;

export const getUserContentFromIdSQL = async (
  req: Request,
  uuid: string,
  pool: Connection | null = null
): Promise<UserContentSQL> => {
  const functionName = (i: number) =>
    'services/user.ts : getUserContentFromIdSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT
      ${columnsGettable}
    FROM users_contents
    WHERE
      users_contents.id = ?
    LIMIT 1
    ;
  `;
  const result = await SqlService.sendSqlRequest(req, sql, [uuid], pool);

  return result[0];
};

export const createUserContentSQL = async (
  req: Request,
  user: UserSQL,
  contentId: number,
  episodeId: number | null,
  pool: Connection | null = null
): Promise<UserContentSQL> => {
  const functionName = (i: number) =>
    'services/list.ts : createUserPlatformsSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const uuid = uuidv4();

  const sql = `
    INSERT INTO users_contents (
      id,
      user_email,
      content_id,
      episode_id
    )
    VALUES (
      ?,
      ?,
      ?,
      ?
    )
    ;
  `;

  const insertResult = await SqlService.sendSqlRequest(
    req,
    sql,
    [uuid, user.email, contentId, episodeId],
    pool
  );
  if (insertResult.affectedRows === 0) {
    throw new AppError(CErrors.processing);
  }

  const result: UserContentSQL = await getUserContentFromIdSQL(req, uuid, pool);

  return result;
};

export default {
  createUserContentSQL,
  getUserContentFromIdSQL,
};
