// Imports
import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import config from '../configs/config';

import Logger from '../tools/logger';
import CErrors from '../constants/errors';
import AppError from '../classes/AppError';

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Set function name for logs
  const functionName = (i: number) =>
    'middleware/authentication.ts : authenticateToken ' + i;
  const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  Logger.info({ functionName: functionName(0), fullUrl: fullUrl }, req);

  // Find token
  const token = req.headers['authorization']?.split(' ')[1];
  if (token == null) throw new AppError(CErrors.missingBearerToken);
  Logger.info(
    {
      functionName: functionName(1),
      data: 'Find token',
      headers: req.headers,
      token: token,
    },
    req
  );

  jwt.verify(token, config.tokens.access.secret, (err, user) => {
    if (err) {
      throw new AppError(CErrors.wrongBearerToken);
    }
    req.user = user;
    next();
  });
};

export default authenticateToken;
