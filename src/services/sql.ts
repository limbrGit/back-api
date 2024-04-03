// Imports
import { Request } from 'express';
// import mysql, { Connection } from 'mysql2';
import mysql2, { Connection } from 'mysql2/promise';

// Config
import config from '../configs/config';

// Tools
import Logger from '../tools/logger';

const createPool = async (req: Request) => {
  const functionName = (i: number) => 'services/sql.ts : createPool ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const pool = mysql2.createPool({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

  const connection = await pool.getConnection();

  return connection;
};

const sendSqlRequest = async (
  req: Request,
  sql: string,
  parameters: any[],
  pool: Connection | null = null
): Promise<any> => {
  const functionName = (i: number) => 'services/sql.ts : sendSqlRequest ' + i;
  Logger.info({ functionName: functionName(0), pool: !!pool }, req);

  try {
    if (pool) {
      const [res] = await pool.query(sql, parameters);
      Logger.info({ functionName: functionName(1), data: 'SQL POOL OK' }, req);
      return res;
    } else {
      const connection = await mysql2.createConnection({
        host: config.database.host,
        user: config.database.user,
        password: config.database.password,
        database: config.database.database,
        multipleStatements: false,
      });
      await connection.connect();

      const [rows] = await connection.query(sql, parameters);

      Logger.info({ functionName: functionName(1), data: 'SQL OK' }, req);

      await connection.end();

      return rows;
    }
  } catch (error) {
    Logger.info(
      { functionName: functionName(1), data: 'SQL KO', error: error },
      req
    );
    throw error;
  }
};

export default {
  createPool,
  sendSqlRequest,
};
