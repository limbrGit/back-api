// Imports
import { Request } from 'express';

// Tools
import Logger from '../tools/logger';

// Constants
import CErrors from '../constants/errors';

// Classes
import AppError from '../classes/AppError';

// Services
import PlatformInfoService from '../services/platformInfo';

// ########################
// getPlatformInfoAvailable
// ########################

const getPlatformInfoAvailable = async (req: Request): Promise<string[]> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'controller/userPlatform.ts : getPlatformInfoAvailable ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // get user platforms for the user
  const platformInfos = await PlatformInfoService.getAllPlatformInfos(req);
  if (!platformInfos || platformInfos.length === 0) {
    throw new AppError(CErrors.noUserPlatform);
  }

  return platformInfos.map(e => e.name);
};

export default {
  getPlatformInfoAvailable,
};
