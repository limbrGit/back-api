// Imports
import { Request } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Interfaces
import { User, UserSQL } from '../interfaces/user';

// Tools
import Logger from '../tools/logger';
import { rdmString, hashPassword } from '../tools/strings';

// Constants
import CErrors from '../constants/errors';

// Classes
import AppError from '../classes/AppError';

// Services
import UserService from '../services/user';
import SendMails from '../services/sendMails';

const getAll = async (req: Request): Promise<User[]> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/user.ts : getAll ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const user = await UserService.getUserFromIdSQL(req, req?.user?.id);
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
  const { email, password, username, subs } = req.body;
  if (!email || !password || !username) {
    throw new AppError(CErrors.missingParameter);
  }
  const user: User = {
    email: email,
    password: password,
    username: username,
    subs: subs,
  };

  // Check if email already exist
  const userDB = await UserService.getUserFromEmailSQL(req, user.email);
  if (userDB) {
    throw new AppError(CErrors.EmailAlreadyExist);
  }

  // Check if username already exist
  const usernameDB = await UserService.getUserFromUsernameSQL(req, user.username);
  if (usernameDB) {
    throw new AppError(CErrors.UsernameAlreadyExist);
  }

  // Hash password
  const { salt, hash } = hashPassword(password);

  const userSQL: UserSQL = {
    id: uuidv4(),
    email: user.email,
    username: user.username,
    password: user.password!,
    hash,
    salt,
    created_at: Date.now(),
    updated_at: Date.now(),
    deleted_at: null,
    active_date: null,
    confirmation_code: rdmString('', 6, false, false, true, false),
    subs: user.subs
      ? Object.entries(user.subs)
          .filter((e) => e[1])
          .map((e) => e[0])
          .toString()
      : null,
  };

  // Create user in DB
  const result = await UserService.createUserSQL(req, userSQL);

  // send mail
  await SendMails.sendCodeMail(req, result);

  return { id: result.id, email: result.email, username: result.username };
};

export default {
  getAll,
  getUserById,
  create,
};
