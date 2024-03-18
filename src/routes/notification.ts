// Imports
import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

// Tools
import Notifications from '../tools/notifications';
import Logger from '../tools/logger';

// Middlewares
import authenticateToken from '../middlewares/authentication';

// Controllers
import NotificationController from '../controllers/notification';

const notificationApis = express.Router();

// send an alert notification
notificationApis.post(
  '/',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'POST on /notification';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await NotificationController.sendNotification(req);
      res.json(result);
    } catch (error: any) {
      next({ ...error, message: error.message, routeName: functionName });
    }
  })
);

export default notificationApis;
