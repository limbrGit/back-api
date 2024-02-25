// Imports
import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

// Tools
import Notifications from '../tools/notifications';
import Logger from '../tools/logger';

// Middlewares
import authenticateToken from '../middlewares/authentication';

// Controllers
import SupportController from '../controllers/support';

const tokenApis = express.Router();

// Send contact-us email in platform
tokenApis.post(
  '/contact-us',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'POST on /support/contact-us';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await SupportController.contactUs(req);
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

export default tokenApis;
