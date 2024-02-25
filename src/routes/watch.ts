// Imports
import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

// Tools
import Notifications from '../tools/notifications';
import Logger from '../tools/logger';

// Middlewares
import authenticateToken from '../middlewares/authentication';

// Controllers
import WatchController from '../controllers/watch';

const watchApis = express.Router();

// Get content link
watchApis.get(
  '/:type/:id',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'GET on /watch/:type/:id';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await WatchController.startWatchContent(req);
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

export default watchApis;
