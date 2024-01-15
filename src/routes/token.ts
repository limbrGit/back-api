// Imports
import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

// Tools
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
    try {
      Logger.info({ functionName: 'GET on /token/useOneToken' }, req);
      const result = await TokenController.useOneToken(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

export default tokenApis;
