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

export default userApis;
