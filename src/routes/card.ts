// Imports
import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

// Tools
import Notifications from '../tools/notifications';
import Logger from '../tools/logger';

// Middlewares
import authenticateToken from '../middlewares/authentication';

// Controllers
import CardController from '../controllers/card';

const cardApis = express.Router();

// Add a card
cardApis.post(
  '/',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'POST on /card';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await CardController.addCard(req);
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

// Get the better card for a platform
cardApis.get(
  '/platform/:platform',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'GET on /card/platform/:platform';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await CardController.getCardForAPlatform(req);
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

// Get card by id
cardApis.get(
  '/:id',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'GET on /card/:id';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await CardController.getCardById(req);
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

export default cardApis;
