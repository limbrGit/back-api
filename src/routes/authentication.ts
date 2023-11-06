import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import AuthenticationController from '../controllers/authentication';

import Logger from '../tools/logger';

const userApis = express.Router();

// Log in
userApis.post(
  '/login',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'POST on /login' }, req);
      const result = await AuthenticationController.login(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

// Refresh token
userApis.get(
  '/refreshToken',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'POST on /refreshToken' }, req);
      const result = await AuthenticationController.refreshToken(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

// Send code again
userApis.get(
  '/sendCode',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'POST on /sendCode' }, req);
      const result = await AuthenticationController.sendCode(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

// Confirm code
userApis.post(
  '/confirmCode',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'POST on /confirmCode' }, req);
      const result = await AuthenticationController.confirmCode(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

// Forgot password
userApis.get(
  '/forgotPassword',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'POST on /forgotPassword' }, req);
      const result = await AuthenticationController.forgotPassword(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

// Reset password
userApis.post(
  '/resetPassword',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'POST on /resetPassword' }, req);
      const result = await AuthenticationController.resetPassword(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

export default userApis;
