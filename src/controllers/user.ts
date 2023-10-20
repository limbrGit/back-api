import { Request } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { User, UserSQL } from '../interfaces/user';
import Logger from '../tools/logger';
import CErrors from '../constants/errors';
import AppError from '../classes/AppError';
import UserService from '../services/user';

const getAll = async (req: Request): Promise<User[]> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/user.ts : getAll ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const result = await UserService.getAllUserSQL(req);

  return result;
};

const getUser = async (req: Request): Promise<User> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/user.ts : getUser ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  let result;
  // if (typeof req.query.email === 'string') {
  //   result = await UserService.getUserFromEmailSQL(req, req.query.email);
  // } else
  if (typeof req.params.id === 'string') {
    result = await UserService.getUserFromIdSQL(req, req.params.id);
  } else {
    throw new AppError(CErrors.missingParameter);
  }

  return result;
};

const create = async (req: Request): Promise<User> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/user.ts : create ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Check params
  if (!req.body.email || !req.body.password) {
    throw new AppError(CErrors.missingParameter);
  }
  const user: User = {
    email: req.body.email,
    password: req.body.password,
  };

  // Check if email already exist
  const userDB = await UserService.getUserFromEmailSQL(req, user.email);
  if (userDB) {
    throw new AppError(CErrors.EmailAlreadyExist);
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(user.password, salt, 1000, 64, 'sha512')
    .toString('hex');
  const userSQL: UserSQL = {
    id: uuidv4(),
    email: user.email,
    password: user.password,
    hash,
    salt,
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: null,
  };

  const result = await UserService.createUserSQL(req, userSQL);

  return result;
};

export default {
  getAll,
  getUser,
  create,
};
