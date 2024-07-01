// Imports
import { Request } from 'express';
import fs from 'fs';
import readline from 'readline';

// Constantes
import CErrors from '../constants/errors';

// Services
import SqlService from '../services/sql';

// Tools
import Logger from '../tools/logger';

// Interfaces
import { Params, Log } from '../interfaces/tools';

// Classes
import AppError from '../classes/AppError';

// Services
import UserService from '../services/user';

// ######################
// getLog
// ######################

const getLog = async (req: Request): Promise<Log[] | null> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'controller/platformAccount.ts : getLog ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Check params
  const params: Params = {
    query: req.query,
    headers: req.headers,
    body: req.body,
  };
  const { executionId } = req.params;
  if (!executionId) {
    throw new AppError(CErrors.missingParameter);
  }

  // Create pool connection
  const pool = await SqlService.createPool(req);

  // Get user
  const user = await UserService.getUserFromIdWithAdminSQL(
    req,
    req?.user?.id,
    pool
  );
  if (!user?.admin) {
    throw new AppError(CErrors.forbidden);
  }

  Logger.info({ functionName: functionName(1) }, req);

  // Get logs
  const logs: Log[] = [];

  // Get filenames
  const filenames = fs.readdirSync('/logs');

  // For each file parse it
  for (let i = 0; i < filenames.length; i++) {
    const filename = filenames[i];

    // Read file
    const fileStream = fs.createReadStream(`/logs/${filename}`);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    // Check each line one by one
    for await (const line of rl) {
      if (line.includes(`"executionId":"${executionId}"`)) {
        if (logs.length >= 300) {
          logs.shift();
        }
        logs.push(JSON.parse(line));
      }
    }
  }

  return logs;
};

export default {
  getLog,
};
