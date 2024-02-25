// Imports
import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

// Tools
import Notifications from '../tools/notifications';
import Logger from '../tools/logger';

// Middlewares
import authenticateToken from '../middlewares/authentication';

// Controllers
import TokenController from '../controllers/token';

const tokenApis = express.Router();

// Use one token
tokenApis.post(
  '/useOneToken',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'POSt on /token/useOneToken';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await TokenController.useOneToken(req);
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
