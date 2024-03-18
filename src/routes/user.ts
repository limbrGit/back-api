// Imports
import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import UserController from '../controllers/user';

// Tools
import Notifications from '../tools/notifications';
import Logger from '../tools/logger';

// Middlewares
import authenticateToken from '../middlewares/authentication';

const userApis = express.Router();

// Get every users
userApis.get(
  '/',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'GET on /users';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await UserController.getAll(req);
      res.json(result);
    } catch (error: any) {
      next({ ...error, message: error.message, routeName: functionName });
    }
  })
);

// Get user by id
userApis.get(
  '/:id',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'GET on /users/:id';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await UserController.getUserById(req);
      res.json(result);
    } catch (error: any) {
      next({ ...error, message: error.message, routeName: functionName });
    }
  })
);

// Create user account
userApis.post(
  '/create',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'POST on /users/create';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await UserController.create(req);
      res.json(result);
    } catch (error: any) {
      next({ ...error, message: error.message, routeName: functionName });
    }
  })
);

// Update user password
userApis.put(
  '/password',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'PUT on /users/password';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await UserController.updatePassword(req);
      res.json(result);
    } catch (error: any) {
      next({ ...error, message: error.message, routeName: functionName });
    }
  })
);

// Update user account
userApis.put(
  '/:id',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'PUT on /users/:id';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await UserController.update(req);
      res.json(result);
    } catch (error: any) {
      next({ ...error, message: error.message, routeName: functionName });
    }
  })
);

// Delete user account
userApis.delete(
  '/:id',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'DELETE on /users/:id';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await UserController.deleteUser(req);
      res.json(result);
    } catch (error: any) {
      next({ ...error, message: error.message, routeName: functionName });
    }
  })
);

// Update user subs
userApis.put(
  '/:id/subs',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'PUT on /users/:id/subs';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await UserController.updateSubs(req);
      res.json(result);
    } catch (error: any) {
      next({ ...error, message: error.message, routeName: functionName });
    }
  })
);

export default userApis;
