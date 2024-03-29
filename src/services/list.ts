// Imports
import { Request } from 'express';
import { Connection } from 'mysql2/promise';

// Interfaces
import { UserSQL, User } from '../interfaces/user';
import { Content } from '../interfaces/content';
import { ListSQL } from '../interfaces/list';

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
  created_at,
  updated_at,
  deleted_at
`;

export const getListSQL = async (
  req: Request,
  user: UserSQL | User,
  pool: Connection | null = null
): Promise<ListSQL[]> => {
  const functionName = (i: number) => 'services/list.ts : getListSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT
      ${columnsGettable}
    FROM users_list
    WHERE
      user_email = '${user.email}' AND
      deleted_at IS NULL
    ;
  `;
  const result = await SqlService.sendSqlRequest(req, sql, [], pool);

  return result;
};

interface GetContentInListSQL {
  user: UserSQL | User;
  content: Content;
  returnDeleted?: boolean;
  pool?: Connection | null
}

export const getContentInListSQL = async (
  req: Request,
  data: GetContentInListSQL
): Promise<ListSQL> => {
  const { user, content, returnDeleted = false, pool = null } = data;

  const functionName = (i: number) =>
    'services/list.ts : getContentInListSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT
      ${columnsGettable}
    FROM users_list
    WHERE
      user_email = '${user.email}' AND
      content_id = ${content.content_id}
      ${returnDeleted ? '' : 'AND deleted_at IS NULL'}
    LIMIT 1
    ;
  `;
  const result = await SqlService.sendSqlRequest(req, sql, [], pool);

  return result[0];
};

export const addContentInListSQL = async (
  req: Request,
  user: UserSQL | User,
  content: Content,
  pool: Connection | null = null
): Promise<ListSQL> => {
  const functionName = (i: number) =>
    'services/list.ts : addContentInListSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    INSERT INTO users_list (
      id,
      user_email,
      content_id,
      created_at,
      updated_at,
      deleted_at
    )
    VALUES (
      uuid(),
      '${user.email}',
      ${content.content_id},
      current_timestamp(),
      current_timestamp(),
      NULL
    )
    ON DUPLICATE KEY
    UPDATE
      deleted_at = NULL
    ;
  `;

  const insertResult = await SqlService.sendSqlRequest(req, sql, [], pool);
  if (insertResult.affectedRows === 0) {
    throw new AppError(CErrors.processing);
  }

  const result = getContentInListSQL(req, { user, content, pool });

  return result;
};

export const deleteContentInListSQL = async (
  req: Request,
  user: UserSQL | User,
  content: Content,
  pool: Connection | null = null
): Promise<ListSQL> => {
  const functionName = (i: number) =>
    'services/list.ts : deleteContentInListSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    UPDATE users_list
    SET
      deleted_at = current_timestamp()
    WHERE
      user_email = '${user.email}' AND
      content_id = ${content.content_id}
    ;
  `;

  const insertResult = await SqlService.sendSqlRequest(req, sql, [], pool);
  if (insertResult.affectedRows !== 1) {
    throw new AppError(CErrors.processing);
  }

  const result = getContentInListSQL(req, {
    user,
    content,
    returnDeleted: true,
    pool,
  });

  return result;
};

export default {
  getListSQL,
  getContentInListSQL,
  addContentInListSQL,
  deleteContentInListSQL,
};
