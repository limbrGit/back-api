// Imports
import { Request } from 'express';
import { Connection } from 'mysql2/promise';

// Interfaces
import { UserAssignmentSQL } from '../interfaces/userAssignment';

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
  name,
  tokens_free,
  created_at,
  updated_at,
  deleted_at
`;

export const getByNameSQL = async (
  req: Request,
  name: string,
  pool: Connection | null = null
): Promise<UserAssignmentSQL> => {
  const functionName = (i: number) => 'services/user.ts : getByNameSQL ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const sql = `
    SELECT
      ${columnsGettable}
    FROM users_assignments
    WHERE
      users_assignments.name = ?
    LIMIT 1
    ;
  `;
  const result = await SqlService.sendSqlRequest(req, sql, [name], pool);

  return result[0];
};

export default {
  getByNameSQL,
};
