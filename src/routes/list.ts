// Imports
import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import ListController from '../controllers/list';

// Tools
import Logger from '../tools/logger';

// Middlewares
import authenticateToken from '../middlewares/authentication';

const listApis = express.Router();

// Get my list
listApis.get(
  '/',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'GET on /list' }, req);
      const result = await ListController.getAll(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

// Get my list contents
listApis.get(
  '/contents',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'GET on /list/contents' }, req);
      const result = await ListController.getAllContents(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

// Add content to my list
listApis.post(
  '/',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'POST on /list' }, req);
      const result = await ListController.add(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

// Remove content to my list
listApis.delete(
  '/:content_id',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'DELETE on /list/:content_id' }, req);
      const result = await ListController.remove(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

export default listApis;
