import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import UserController from '../controllers/user';

import Logger from '../tools/logger';
import authenticateToken from '../middlewares/authentication';

const userApis = express.Router();

// Log in
userApis.post(
  '/login',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'POST on /login' }, req);
      const result = await UserController.login(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

// Refresh token
userApis.get(
  '/refreshToken',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'POST on /refreshToken' }, req);
      const result = await UserController.refreshToken(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

// Get every users
userApis.get(
  '/',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'GET on /users' }, req);
      const result = await UserController.getAll(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

// Get user by id
userApis.get(
  '/:id',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'GET on /users' }, req);
      const result = await UserController.getUser(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

// Create user account
userApis.post(
  '/create',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'POST on /users/create' }, req);
      const result = await UserController.create(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

export default userApis;
