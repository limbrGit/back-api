// Imports
import { Request } from 'express';

// Tools
import Logger from '../tools/logger';

// Services
import SqlService from './sql';

interface TestConnection {
  id: string;
  valid: boolean;
}

export const textConnectionDB = async (
  req: Request
): Promise<TestConnection> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'services/testConnectionDB.ts : textConnectionDB ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  let sql;

  // Get ratings info
  sql = `
    SELECT
      *
    FROM limbr_test_connection
    LIMIT 1
    ;
  `;
  const test: TestConnection[] = await SqlService.sendSqlRequest(req, sql, []);

  return test[0];
};

export default {
  textConnectionDB,
};
