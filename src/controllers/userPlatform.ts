// Imports
import { Request } from 'express';
import dayjs from 'dayjs';

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
import SqlService from '../services/sql';

const getUserPlatform = async (
  req: Request
): Promise<PlatformAccountSQL & { cookies?: any; localStorag?: any; data?: any }> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'controller/userPlatform.ts : getUserPlatform ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const { platform }: { platform?: string } = req.params;

  // Check param and token
  if (!platform) {
    throw new AppError(CErrors.missingParameter);
  }
  Logger.info({ functionName: functionName(1), platform }, req);

  // Create pool connection
  const pool = await SqlService.createPool(req);

  // Check user
  let user = await UserService.getUserFromIdSQL(req, req?.user?.id, pool);
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
    { user, pool }
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
  const platformAccount =
    await PlatformAccountService.getPlatformAccountFromEmail(
      req,
      userPlatform.platform_account_email!,
      pool
    );
  platformAccount.password = '';

  // Get the connexion cookies for the platform account
  const connexionData =
    await PlatformAccountService.getPlatformAccountConnexion(
      req,
      platformAccount,
      pool
    );

  return { ...platformAccount, ...connexionData };
};

const getUserPlatformOtp = async (req: Request): Promise<string> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'controller/userPlatform.ts : getUserPlatformOtp ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const { platform }: { platform?: string } = req.params;
  const { startTimer }: { startTimer?: string } = req.query;

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
    { user }
  );
  if (!userPlatforms || userPlatforms.length === 0) {
    throw new AppError(CErrors.noUserPlatform);
  }

  // Find the good user platform
  const userPlatform = userPlatforms.find((e) => e.platform === platform);
  if (!userPlatform) {
    throw new AppError(CErrors.noUserPlatform);
  }

  const otp = await UserPlatformService.getUserPlatformOtp(
    req,
    userPlatform,
    startTimer || dayjs().format('X')
  );

  return otp;
};

export default {
  getUserPlatform,
  getUserPlatformOtp,
};
