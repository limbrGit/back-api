import { NextFunction, Response, Request } from 'express';
import AppError from '../classes/AppError';
import Logger from '../tools/logger';
import CErrors from '../constants/errors';

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

    res.status(statusCode || 500).json(body);
  }
};

export default ErrorHandler;
