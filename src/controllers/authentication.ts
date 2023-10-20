import { Request } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import config from '../configs/config';

import Logger from '../tools/logger';
import CErrors from '../constants/errors';
import AppError from '../classes/AppError';
import UserService from '../services/user';

interface JwtUser {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

interface ApiTokens {
  access: string;
  refresh?: string;
}

const generateAccessToken = (jwtUser: JwtUser) => {
  return jwt.sign(jwtUser, config.tokens.access.secret, {
    expiresIn: config.tokens.access.expire,
  });
};

const generateRefreshToken = (jwtUser: JwtUser) => {
  return jwt.sign(jwtUser, config.tokens.refresh.secret, {
    expiresIn: config.tokens.refresh.expire,
  });
};

const login = async (req: Request): Promise<ApiTokens> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/user.ts : login ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Check parameters
  if (
    typeof req.body.email !== 'string' ||
    typeof req.body.password !== 'string'
  ) {
    throw new AppError(CErrors.missingParameter);
  }
  Logger.info({ functionName: functionName(1), data: 'Parameters OK' }, req);

  // Check User
  const user = await UserService.getUserFromEmailSQL(req, req.body.email);
  if (!user) {
    throw new AppError(CErrors.wrongParameter);
  }
  Logger.info({ functionName: functionName(2), data: 'Check User' }, req);

  // Check password
  const hash = crypto
    .pbkdf2Sync(req.body.password, user.salt, 1000, 64, 'sha512')
    .toString('hex');
  if (hash !== user.hash) {
    throw new AppError(CErrors.wrongParameter);
  }
  Logger.info({ functionName: functionName(3), data: 'Check password' }, req);

  const jwtUser: JwtUser = {
    id: user.id,
    email: user.email,
  };

  const access = generateAccessToken(jwtUser);
  const refresh = generateRefreshToken(jwtUser);

  return {
    access,
    refresh,
  };
};

const refreshToken = (req: Request): Promise<ApiTokens> => {
  return new Promise((resolve, reject) => {
    // Set function name for logs
    const functionName = (i: number) =>
      'controller/user.ts : refreshToken ' + i;
    Logger.info({ functionName: functionName(0) }, req);

    // Find token
    const token = req.headers['authorization']?.split(' ')[1];
    if (token === null) reject(CErrors.wrongParameter);

    jwt.verify(token!, config.tokens.refresh.secret, async (err, user) => {
      if (err) {
        reject(CErrors.wrongParameter);
      }

      const result = await UserService.getUserFromIdSQL(req, user.id);
      if (result.deleted_at !== null) {
        reject(CErrors.forbidden);
      }

      delete user.iat;
      delete user.exp;

      const refreshedToken = generateAccessToken(user);
      resolve({ access: refreshedToken });
    });
  });
};

export default {
  login,
  refreshToken,
};
