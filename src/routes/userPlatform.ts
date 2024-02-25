// Imports
import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

// Tools
import Notifications from '../tools/notifications';
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
    const functionName = 'GET on /userPlatform/:platform';
    try {
      Logger.info({ functionName:functionName  }, req);
      const result = await UserPlatformController.getUserPlatform(req);
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

// Get OTP
userPlatformApis.get(
  '/:platform/otp',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'GET on /userPlatform/:platform/otp';
    try {
      Logger.info({ functionName:functionName  }, req);
      const result = await UserPlatformController.getUserPlatformOtp(req);
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

export default userPlatformApis;
