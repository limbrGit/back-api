// Imports
import { NextFunction, Response, Request } from 'express';

// Classes
import AppError from '../classes/AppError';

// Constants
import CErrors from '../constants/errors';

// Tools
import Notifications from '../tools/notifications';
import Logger from '../tools/logger';

const ErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    next(err);
  } else {
    Logger.error(err, req);
    const { code, message, detail } =
      typeof err.code === 'number' &&
      typeof err.message === 'string' &&
      typeof err.detail === 'string'
        ? err
        : CErrors.processing;
    const body = {
      code,
      message,
      detail,
      executionId: req.headers.executionId,
    };
    const statusCode = Math.trunc(err.code);

    const { routeName } = err;
    if (routeName) {
      Notifications.sendNotification(
        { message: 'Error on : ' + routeName, data: { code, message, detail } },
        req
      );
    }

    res.status(statusCode || 500).json(body);
  }
};

export default ErrorHandler;
