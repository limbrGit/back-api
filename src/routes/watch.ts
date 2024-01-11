// Imports
import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

// Tools
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
    try {
      Logger.info({ functionName: 'GET on /watch/:type/:id' }, req);
      const result = await WatchController.startWatchContent(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

export default watchApis;
