// Imports
import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

// Tools
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
    try {
      Logger.info({ functionName: 'POST on /support/contact-us' }, req);
      const result = await SupportController.contactUs(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

export default tokenApis;
