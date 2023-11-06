import { Request } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { User, UserSQL } from '../interfaces/user';
import Logger from '../tools/logger';
import CErrors from '../constants/errors';
import AppError from '../classes/AppError';
import UserService from '../services/user';
import SendMails from '../services/sendMails';

import { rdmString, hashPassword } from '../tools/strings';

const getAll = async (req: Request): Promise<User[]> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/user.ts : getAll ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const user = await UserService.getUserFromIdSQL(req, req.user.id);
  if (!user?.admin) {
    throw new AppError(CErrors.forbidden);
  }
  const result = await UserService.getAllUserSQL(req);

  return result;
};

const getUserById = async (req: Request): Promise<User> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/user.ts : getUserById ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Check param and token
  if (typeof req.params.id !== 'string') {
    throw new AppError(CErrors.missingParameter);
  } else if (req?.user?.id !== req.params.id) {
    throw new AppError(CErrors.forbidden);
  }
  const result = await UserService.getUserFromIdSQL(req, req.params.id);

  return result;
};

const create = async (req: Request): Promise<User> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/user.ts : create ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Check params
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError(CErrors.missingParameter);
  }
  const user: User = {
    email: email,
    password: password,
  };

  // Check if email already exist
  const userDB = await UserService.getUserFromEmailSQL(req, user.email);
  if (userDB) {
    throw new AppError(CErrors.EmailAlreadyExist);
  }

  const { salt, hash } = hashPassword(password);

  const userSQL: UserSQL = {
    id: uuidv4(),
    email: user.email,
    password: user.password!,
    hash,
    salt,
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: null,
    active_date: null,
    confirmation_code: rdmString('', 6, false, false, true, false),
  };

  // Create user in DB
  const result = await UserService.createUserSQL(req, userSQL);

  // send mail
  await SendMails.sendCodeMail(req, result);

  return { id: result.id, email: result.email };
};

export default {
  getAll,
  getUserById,
  create,
};
