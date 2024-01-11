// Imports
import { Request } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Interfaces
import { User, UserSQL, UpdateBody, Gender } from '../interfaces/user';

// Tools
import Logger from '../tools/logger';
import {
  rdmString,
  hashPassword,
  checkPassword,
  checkEmail,
  flatObj,
} from '../tools/strings';

// Constants
import CErrors from '../constants/errors';

// Classes
import AppError from '../classes/AppError';

// Services
import UserService from '../services/user';
import SendMails from '../services/sendMails';

dayjs.extend(customParseFormat);

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

  if (result.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }

  return {
    ...result,
    password: undefined,
    hash: undefined,
    salt: undefined,
    confirmation_code: undefined,
    subs: result.subs
      ? flatObj({ ...result.subs.split(',').map((e) => ({ [e]: true })) })
      : null,
  };
};

const create = async (req: Request): Promise<User> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/user.ts : create ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Check params
  const { email, password, username, subs } = req.body;
  if (!email || !password) {
    throw new AppError(CErrors.missingParameter);
  }
  if (email.length > 50) {
    throw new AppError(CErrors.emailTooLong);
  }
  if (!checkEmail(email)) {
    throw new AppError(CErrors.emailNotValid);
  }
  if (!checkPassword(password)) {
    throw new AppError(CErrors.passwordNotStrong);
  }

  const user: User = {
    email: email,
    password: password,
    username:
      email.split('@')[0].substring(0, 20) +
      '#' +
      rdmString({
        length: 4,
        majSelect: false,
        minSelect: false,
      }),
    subs: subs,
  };

  // Check if email already exist
  const userDB = await UserService.getUserFromEmailSQL(req, user.email);
  if (userDB) {
    throw new AppError(CErrors.EmailAlreadyExist);
  }

  // Check if username already exist
  const usernameDB = await UserService.getUserFromUsernameSQL(
    req,
    user.username
  );
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
    confirmation_code: rdmString({
      length: 6,
      majSelect: false,
      minSelect: false,
    }),
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

const updatePassword = async (req: Request): Promise<User> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'controller/user.ts : updatePassword ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Check params
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new AppError(CErrors.missingParameter);
  }
  if (oldPassword === newPassword) {
    throw new AppError(CErrors.samePassword);
  }

  // Check User
  const user: UserSQL = await UserService.getUserFromIdSQL(req, req.user.id);
  if (!user) {
    throw new AppError(CErrors.userNotFound);
  }
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }
  Logger.info({ functionName: functionName(1), data: 'Check User' }, req);

  // Check old password
  const oldHash = crypto
    .pbkdf2Sync(req.body.oldPassword, user.salt, 1000, 64, 'sha512')
    .toString('hex');
  if (oldHash !== user.hash) {
    throw new AppError(CErrors.wrongPassword);
  }

  // Check new password
  if (!checkPassword(newPassword)) {
    throw new AppError(CErrors.passwordNotStrong);
  }
  Logger.info({ functionName: functionName(2), data: 'Check passwords' }, req);

  // Update user password
  const { salt, hash } = hashPassword(newPassword);
  const userUpdated: UserSQL = await UserService.changePasswordUserSQL(
    req,
    user,
    newPassword,
    salt,
    hash
  );
  Logger.info(
    { functionName: functionName(2), data: 'Update user password' },
    req
  );

  // Send mail
  await SendMails.sendResetPasswordMail(req, user);

  return {
    ...userUpdated,
    password: undefined,
    hash: undefined,
    salt: undefined,
    confirmation_code: undefined,
    subs: userUpdated.subs
      ? flatObj({ ...userUpdated.subs.split(',').map((e) => ({ [e]: true })) })
      : null,
  };
};

const update = async (req: Request): Promise<User> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/user.ts : update ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Check params
  const {
    username,
    firstname,
    lastname,
    birthdate,
    gender,
    description,
    picture,
    subs,
  }: UpdateBody = req.body;
  if (
    !username &&
    !firstname &&
    !lastname &&
    !birthdate &&
    !gender &&
    !description &&
    !picture &&
    !subs
  ) {
    throw new AppError(CErrors.missingParameter);
  }
  if (username && username.length > 20) {
    throw new AppError(CErrors.usernameTooLong);
  }
  if (firstname && firstname.length > 20) {
    throw new AppError(CErrors.firstnameTooLong);
  }
  if (lastname && lastname.length > 20) {
    throw new AppError(CErrors.lastnameTooLong);
  }
  if (birthdate && !dayjs(birthdate, 'YYYY-MM-DD', true).isValid()) {
    throw new AppError(CErrors.wrongDateFormat);
  }
  if (gender && !Object.values(Gender).includes(gender as unknown as Gender)) {
    throw new AppError(CErrors.wrongGender);
  }
  if (description && description.length > 190) {
    throw new AppError(CErrors.descriptionTooLong);
  }
  if (picture && (parseInt(picture) < 0 || parseInt(picture) > 127)) {
    throw new AppError(CErrors.pictureError);
  }

  // Check param and token
  if (typeof req.params.id !== 'string') {
    throw new AppError(CErrors.missingParameter);
  } else if (req?.user?.id !== req.params.id) {
    throw new AppError(CErrors.forbidden);
  }

  const user = await UserService.getUserFromIdSQL(req, req.params.id);
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }

  const userSQL: UserSQL = {
    id: user.id,
    username:
      username?.split('#')[0] !== user.username?.split('#')[0]
        ? username?.split('#')[0] +
          '#' +
          rdmString({
            length: 4,
            majSelect: false,
            minSelect: false,
          })
        : user.username,
    firstname: firstname,
    lastname: lastname,
    birthdate: birthdate,
    gender: gender,
    description: description,
    picture: picture,
    subs: subs
      ? Object.entries(subs)
          .filter((e) => e[1])
          .map((e) => e[0])
          .toString()
      : null,
  };

  // Create user in DB
  const result = await UserService.updateUserSQL(req, userSQL);

  return {
    ...result,
    password: undefined,
    hash: undefined,
    salt: undefined,
    confirmation_code: undefined,
    subs: result.subs
      ? flatObj({ ...result.subs.split(',').map((e) => ({ [e]: true })) })
      : null,
  };
};

const deleteUser = async (req: Request): Promise<User> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/user.ts : deleteUser ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Check param and token
  if (typeof req.params.id !== 'string') {
    throw new AppError(CErrors.missingParameter);
  } else if (req?.user?.id !== req.params.id) {
    throw new AppError(CErrors.forbidden);
  }

  const user = await UserService.getUserFromIdSQL(req, req.params.id);
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }

  const result = await UserService.deleteUserSQL(req, req.params.id);

  return {
    ...result,
    password: undefined,
    hash: undefined,
    salt: undefined,
    confirmation_code: undefined,
    subs: result.subs
      ? flatObj({ ...result.subs.split(',').map((e) => ({ [e]: true })) })
      : null,
  };
};

export default {
  getAll,
  getUserById,
  create,
  updatePassword,
  update,
  deleteUser,
};
