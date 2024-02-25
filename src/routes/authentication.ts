// Imports
import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

// Controller
import AuthenticationController from '../controllers/authentication';

// Tools
import Notifications from '../tools/notifications';
import Logger from '../tools/logger';

const userApis = express.Router();

// Log in
userApis.post(
  '/login',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'POST on /login';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await AuthenticationController.login(req);
      res.json(result);
    } catch (error) {
      Notifications.sendNotification(
        { message: 'Error on : ' + functionName, data: error },
        req
      );
      next(error);
    }
  })
);

// Refresh token
userApis.get(
  '/refreshToken',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'POST on /refreshToken';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await AuthenticationController.refreshToken(req);
      res.json(result);
    } catch (error) {
      Notifications.sendNotification(
        { message: 'Error on : ' + functionName, data: error },
        req
      );
      next(error);
    }
  })
);

// Send code again
userApis.get(
  '/sendCode',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'POST on /sendCode';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await AuthenticationController.sendCode(req);
      res.json(result);
    } catch (error) {
      Notifications.sendNotification(
        { message: 'Error on : ' + functionName, data: error },
        req
      );
      next(error);
    }
  })
);

// Confirm code
userApis.post(
  '/confirmCode',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'POST on /confirmCode';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await AuthenticationController.confirmCode(req);
      res.json(result);
    } catch (error) {
      Notifications.sendNotification(
        { message: 'Error on : ' + functionName, data: error },
        req
      );
      next(error);
    }
  })
);

// Forgot password
userApis.get(
  '/forgotPassword',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'POST on /forgotPassword';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await AuthenticationController.forgotPassword(req);
      res.json(result);
    } catch (error) {
      Notifications.sendNotification(
        { message: 'Error on : ' + functionName, data: error },
        req
      );
      next(error);
    }
  })
);

// Reset password
userApis.post(
  '/resetPassword',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'POST on /resetPassword';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await AuthenticationController.resetPassword(req);
      res.json(result);
    } catch (error) {
      Notifications.sendNotification(
        { message: 'Error on : ' + functionName, data: error },
        req
      );
      next(error);
    }
  })
);

export default userApis;
