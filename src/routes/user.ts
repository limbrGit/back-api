// Imports
import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import UserController from '../controllers/user';

// Tools
import Logger from '../tools/logger';

// Middlewares
import authenticateToken from '../middlewares/authentication';

const userApis = express.Router();

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
      Logger.info({ functionName: 'GET on /users/:id' }, req);
      const result = await UserController.getUserById(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

// Create user account
userApis.post(
  '/create',
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

// Update user password
userApis.put(
  '/password',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'PUT on /users/password' }, req);
      const result = await UserController.updatePassword(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

// Update user account
userApis.put(
  '/:id',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'PUT on /users/:id' }, req);
      const result = await UserController.update(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

// Delete user account
userApis.delete(
  '/:id',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'DELETE on /users/:id' }, req);
      const result = await UserController.deleteUser(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);


export default userApis;
