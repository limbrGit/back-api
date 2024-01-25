// Imports
import { Request } from 'express';

// Interfaces
import { PlatformAccountSQL } from '../interfaces/database';

// Tools
import Logger from '../tools/logger';

// Constants
import CErrors from '../constants/errors';

// Classes
import AppError from '../classes/AppError';

// Services
import UserService from '../services/user';
import UserPlatformService from '../services/userPlatforms';
import PlatformAccountService from '../services/platformAccount';

const getUserPlatform = async (req: Request): Promise<PlatformAccountSQL> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'controller/list.ts : getUserPlatform ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const { platform }: { platform?: string } = req.params;

  // Check param and token
  if (!platform) {
    throw new AppError(CErrors.missingParameter);
  }

  // Check user
  let user = await UserService.getUserFromIdSQL(req, req?.user?.id);
  if (!user) {
    throw new AppError(CErrors.userNotFound);
  }
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }

  // Check if user have a current token
  if (user.token_end_date && (user.token_end_date as number) < Date.now()) {
    throw new AppError(CErrors.noCurrentToken);
  }

  // get user platforms for the user
  const userPlatforms = await UserPlatformService.getUserPlatformsFromUserSQL(
    req,
    user
  );
  if (!userPlatforms || userPlatforms.length === 0) {
    throw new AppError(CErrors.noUserPlatform);
  }

  // Find the good user platform
  const userPlatform = userPlatforms.find((e) => e.platform === platform);
  if (!userPlatform) {
    throw new AppError(CErrors.noUserPlatform);
  }

  // Get the platform account
  const platformAccount = PlatformAccountService.getPlatformAccountFromEmail(
    req,
    userPlatform.platform_account_email!
  );

  return platformAccount;
};

export default {
  getUserPlatform,
};
