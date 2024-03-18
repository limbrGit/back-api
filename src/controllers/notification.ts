// Imports
import { Request } from 'express';

// Interfaces
import { Params } from '../interfaces/tools';

// Tools
import Notifications from '../tools/notifications';
import Logger from '../tools/logger';

// Constants
import CErrors from '../constants/errors';

// Classes
import AppError from '../classes/AppError';

// Services
import UserService from '../services/user';
import SqlService from '../services/sql';

const sendNotification = async (req: Request): Promise<{ data: string }> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'controller/notification.ts : sendNotification ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Check params
  const params: Params = {
    query: req.query,
    headers: req.headers,
    body: req.body,
    params: req.params,
  };
  const { message, data } = params.body;
  if (!message || !data) {
    throw new AppError(CErrors.missingParameter);
  }
  if (message.length < 5) {
    throw new AppError(CErrors.wrongParameter);
  }

  // Create pool connection
  const pool = await SqlService.createPool(req);

  // Check user
  let user = await UserService.getUserFromIdWithAdminSQL(
    req,
    req?.user?.id,
    pool
  );
  if (!user) {
    throw new AppError(CErrors.userNotFound);
  }
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }
  if (!user?.admin) {
    throw new AppError(CErrors.forbidden);
  }

  Notifications.sendNotification(
    {
      message: message,
      data: { user: user?.id, ...data },
      alerte: true,
    },
    req
  );

  return { data: 'Notification sended.' };
};

export default {
  sendNotification,
};
