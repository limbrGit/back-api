// Imports
import { Request } from 'express';
import { Connection } from 'mysql2/promise';

// Interfaces
import { PlatformInfoSQL } from '../interfaces/database';

// Tools
import Logger from '../tools/logger';

// Services
import SqlService from './sql';

export const getPlatformInfoFromName = async (
  req: Request,
  name: string,
  pool: Connection | null = null
): Promise<PlatformInfoSQL> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'services/database.ts : getPlatformInfoFromName ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  let sql;

  // Get platform info
  sql = `
    SELECT *
    FROM platform_info
    WHERE
      platform_info.name = "${name}"
    LIMIT 1
    ;
  `;
  const lines: PlatformInfoSQL[] = await SqlService.sendSqlRequest(
    req,
    sql,
    [],
    pool
  );

  return lines[0];
};

export default {
  getPlatformInfoFromName,
};
