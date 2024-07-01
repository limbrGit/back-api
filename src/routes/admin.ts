// Imports
import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

// Controllers
import AdminController from '../controllers/admin';

// Tools
import Logger from '../tools/logger';

// Middlewares
import authenticateToken from '../middlewares/authentication';

const adminApis = express.Router();

// Get a log
adminApis.get(
  '/log/:executionId',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'GET on /admin/log/:executionId';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await AdminController.getLog(req);
      res.json(result);
    } catch (error: any) {
      next({ ...error, message: error.message, routeName: functionName });
    }
  })
);

export default adminApis;
