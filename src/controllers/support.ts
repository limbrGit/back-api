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
import SendMails from '../services/sendMails';

const contactUs = async (req: Request): Promise<{ data: string }> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/list.ts : contactUs ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const message: string = req.body.message;

  // Check param
  if (!message || message.length === 0) {
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

  await SendMails.sendContactUsMail(req, user, message);

  return { data: 'Email sended' };
};

export default {
  contactUs,
};
