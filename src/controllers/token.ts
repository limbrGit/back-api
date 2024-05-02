// Imports
import { Request } from 'express';
import dayjs from 'dayjs';

// Interfaces
import { UserSQL } from '../interfaces/user';

// Tools
import Logger from '../tools/logger';

// Constants
import CErrors from '../constants/errors';

// Classes
import AppError from '../classes/AppError';

// Services
import UserService from '../services/user';

const useOneToken = async (req: Request): Promise<UserSQL> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/list.ts : useOneToken ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Check user
  let user = await UserService.getUserFromIdSQL(req, req?.user?.id);
  if (!user) {
    throw new AppError(CErrors.userNotFound);
  }
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }

  // Check if user have a current token
  if (user.token_end_date && (user.token_end_date as number) > Date.now()) {
    throw new AppError(CErrors.currentTokenAlreadyUsed);
  }

  // Check if have a token
  if (user.tokens <= 0) {
    throw new AppError(CErrors.currentTokenAlreadyUsed);
  }

  // Update user in DB with new tokens
  user = await UserService.updateUserSQL(req, {
    ...user,
    birthdate: undefined,
    tokens: user.tokens - 1,
    token_end_date: dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
  });
  if (!user) {
    throw new AppError(CErrors.getUser);
  }

  return user;
};

export default {
  useOneToken,
};
