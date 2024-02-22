// Imports
import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

// Tools
import Logger from '../tools/logger';

// Middlewares
import authenticateToken from '../middlewares/authentication';

// Controllers
import UserPlatformController from '../controllers/userPlatform';

const userPlatformApis = express.Router();

// Use one token
userPlatformApis.get(
  '/:platform',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'GET on /userPlatform/:platform' }, req);
      const result = await UserPlatformController.getUserPlatform(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

// Get OTP
userPlatformApis.get(
  '/:platform/otp',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'GET on /userPlatform/:platform/otp' }, req);
      const result = await UserPlatformController.getUserPlatformOtp(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

export default userPlatformApis;
