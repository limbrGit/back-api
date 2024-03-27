// Imports
import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

// Tools
import Logger from '../tools/logger';

// Middlewares
import authenticateToken from '../middlewares/authentication';

// Controllers
import SupportController from '../controllers/support';

const supportApis = express.Router();

// Send contact-us email in platform
supportApis.post(
  '/contact-us',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'POST on /support/contact-us';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await SupportController.contactUs(req);
      res.json(result);
    } catch (error: any) {
      next({ ...error, message: error.message, routeName: functionName });
    }
  })
);

export default supportApis;
