// Imports
import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

// Tools
import Logger from '../tools/logger';


// Controllers
import PlatformInfoController from '../controllers/platformInfo';

const platformInfoApis = express.Router();

// Use one token
platformInfoApis.get(
  '/available',
  // authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'GET on /platformInfo/available';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await PlatformInfoController.getPlatformInfoAvailable(req);
      res.json(result);
    } catch (error: any) {
      next({ ...error, message: error.message, routeName: functionName });
    }
  })
);

export default platformInfoApis;
