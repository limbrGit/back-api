// Imports
import { Request } from 'express';
import mysql from 'mysql';

// Config
import config from '../configs/config';

// Tools
import Logger from '../tools/logger';

const sendSqlRequest = async (req: Request, sql: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const functionName = (i: number) => 'services/sql.ts : sendSqlRequest ' + i;
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
      Logger.info({ functionName: functionName(1), data: 'SQL OK' }, req);
      return resolve(results);
    });
  });
};

export default {
  sendSqlRequest,
};
