// Imports
import { Request } from 'express';
import crypto, { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

// Config
import config from '../configs/config';

// Constants
import CErrors from '../constants/errors';
import CResponses from '../constants/responses';

// Tools
import Logger from '../tools/logger';
import { rdmString, checkPassword, hashPassword } from '../tools/strings';

// Classes
import AppError from '../classes/AppError';

// Services
import UserService from '../services/user';
import SendMails from '../services/sendMails';
import ForgetPasswordService from '../services/forgetPassword';

// Interfaces
import { User, UserSQL } from '../interfaces/user';
import { RessetPassword } from '../interfaces/resetPassword';

interface JwtUser {
  id: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

interface ApiTokens {
  id: string;
  email: string;
  username: string;
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
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
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
    username: user.username,
  };

  const access = generateAccessToken(jwtUser);
  const refresh = generateRefreshToken(jwtUser);

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    access: access,
    refresh: refresh,
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
      if (err || !user?.id || !user?.email) {
        reject(CErrors.wrongParameter);
      }

      const result = await UserService.getUserFromIdSQL(req, user.id);
      if (result.deleted_at !== null) {
        reject(CErrors.forbidden);
      }

      const newAccessToken = generateAccessToken({
        id: user?.id,
        email: user?.email,
        username: user?.username,
      });
      resolve({ access: newAccessToken });
    });
  });
};

const sendCode = async (req: Request): Promise<object> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/user.ts : sendCode ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Check parameters
  if (typeof req.query.email !== 'string') {
    throw new AppError(CErrors.missingParameter);
  }
  Logger.info({ functionName: functionName(1), data: 'Parameters OK' }, req);

  // Check User
  const user = await UserService.getUserFromEmailSQL(req, req.query.email);
  if (!user) {
    throw new AppError(CErrors.wrongParameter);
  }
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }
  Logger.info(
    { functionName: functionName(2), data: 'Check User', user: user },
    req
  );

  // Check if the account is already activated
  if (user.active_date) {
    throw new AppError(CErrors.accountActivated);
  }

  // send mail
  await SendMails.sendCodeMail(req, user);

  return { data: `Code sended at ${req.query.email}` };
};

const confirmCode = async (req: Request): Promise<User> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/user.ts : confirmCode ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Check parameters
  if (typeof req.body.email !== 'string' || typeof req.body.code !== 'string') {
    throw new AppError(CErrors.missingParameter);
  }
  Logger.info({ functionName: functionName(1), data: 'Parameters OK' }, req);

  // Check User
  const user: UserSQL = await UserService.getUserFromEmailSQL(
    req,
    req.body.email
  );
  if (!user) {
    throw new AppError(CErrors.wrongParameter);
  }
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }
  Logger.info({ functionName: functionName(2), data: 'Check User' }, req);

  // Check code
  if (req.body.code !== user.confirmation_code) {
    throw new AppError(CErrors.wrongParameter);
  } else if (user.active_date) {
    throw new AppError(CErrors.accountActivated);
  }
  Logger.info({ functionName: functionName(3), data: 'Check code' }, req);

  // Set active_date and last_login
  const userUpdated: UserSQL = await UserService.valideConfirmationCode(
    req,
    user
  );
  if (userUpdated.active_date === null) {
    throw new AppError(CErrors.processing);
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
  };
};

const forgotPassword = async (req: Request): Promise<object> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'controller/user.ts : forgotPassword ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Check parameters
  if (typeof req.query.email !== 'string') {
    throw new AppError(CErrors.missingParameter);
  }
  Logger.info({ functionName: functionName(1), data: 'Parameters OK' }, req);

  // Check User
  const user: UserSQL = await UserService.getUserFromEmailSQL(
    req,
    req.query.email
  );
  if (!user) {
    //! Changer pour renvoyer OK quand même, la réponse doit toujours être OK
    throw new AppError(CErrors.wrongParameter);
  }
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }
  Logger.info({ functionName: functionName(2), data: 'Check User' }, req);

  const id = uuidv4();
  const token = uuidv4();
  const expireDate = dayjs().add(30, 'minute').format('YYYY-MM-DD HH:mm:ss');

  // Create reset password token
  const ressetPassword =
    await ForgetPasswordService.createRessetpasswordTokenSQL(
      req,
      id,
      user,
      token,
      expireDate
    );

  // Send mail
  await SendMails.sendForgotPasswordMail(req, user, token);

  return { data: CResponses.EMAIL_SENDED };
};

const resetPassword = async (req: Request): Promise<Object> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/user.ts : resetPassword ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Check parameters
  const { token, password } = req.body;
  if (typeof token !== 'string' || typeof password !== 'string') {
    throw new AppError(CErrors.missingParameter);
  }
  Logger.info({ functionName: functionName(1), data: 'Parameters OK' }, req);

  // Check reset password
  const resetPassword: RessetPassword =
    await ForgetPasswordService.getResetPasswordTokenFromTokenSQL(req, token);
  if (!resetPassword) {
    throw new AppError(CErrors.wrongParameter);
  }
  Logger.info(
    {
      functionName: functionName(2),
      data: 'Check reset password',
    },
    req
  );

  // Check reset password
  if (token !== resetPassword.token) {
    throw new AppError(CErrors.wrongParameter);
  } else if (resetPassword.used) {
    throw new AppError(CErrors.tokenAlreadyUsed);
  } else if (dayjs(resetPassword.expired_at).isBefore(dayjs())) {
    throw new AppError(CErrors.tokenExpired);
  }
  Logger.info(
    { functionName: functionName(3), data: 'Check reset password' },
    req
  );

  // Check if password is OK
  if (!checkPassword(password)) {
    throw new AppError(CErrors.passwordNotStrong);
  }
  Logger.info(
    { functionName: functionName(4), data: 'Check if password is OK' },
    req
  );

  // Check User
  const user: UserSQL = await UserService.getUserFromEmailSQL(
    req,
    resetPassword.email
  );
  if (!user) {
    throw new AppError(CErrors.userNotFound);
  }
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }
  Logger.info({ functionName: functionName(5), data: 'Check User' }, req);

  // Update user password
  const { salt, hash } = hashPassword(password);
  const userUpdated: UserSQL = await UserService.changePasswordUserSQL(
    req,
    user,
    password,
    salt,
    hash
  );
  Logger.info(
    { functionName: functionName(5), data: 'Update user password' },
    req
  );

  // Update reset password
  const resetPasswordUsed: RessetPassword =
    await ForgetPasswordService.updateRessetpasswordTokenSQL(
      req,
      resetPassword.id
    );
  Logger.info(
    { functionName: functionName(5), data: 'Update reset password' },
    req
  );

  // Send mail
  await SendMails.sendResetPasswordMail(req, user);

  return { data: CResponses.EMAIL_SENDED };
};
export default {
  sendCode,
  login,
  refreshToken,
  confirmCode,
  forgotPassword,
  resetPassword,
};
