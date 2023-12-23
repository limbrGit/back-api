// Imports
import { Request } from 'express';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import fetch from 'node-fetch';

// Interfaces
import { List } from '../interfaces/list';

// Tools
import Logger from '../tools/logger';

// Constants
import CErrors from '../constants/errors';

// Classes
import AppError from '../classes/AppError';

// Services
import UserService from '../services/user';
import ListService from '../services/list';
import ContentService from '../services/content';

// Config
import config from '../configs/config';

dayjs.extend(customParseFormat);

const getAll = async (req: Request): Promise<number[]> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/list.ts : getAll ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const user = await UserService.getUserFromIdSQL(req, req?.user?.id);
  if (!user) {
    throw new AppError(CErrors.userNotFound);
  }
  if (user.id !== req?.user?.id) {
    throw new AppError(CErrors.wrongParameter);
  }
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }

  const result = await ListService.getListSQL(req, user);

  return result.map((e) => e.content_id);
};

const getAllContents = async (req: Request): Promise<number[]> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'controller/list.ts : getAllContents ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const user = await UserService.getUserFromIdSQL(req, req?.user?.id);
  if (!user) {
    throw new AppError(CErrors.userNotFound);
  }
  if (user.id !== req?.user?.id) {
    throw new AppError(CErrors.wrongParameter);
  }
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }

  // Get content ids list
  const contentIds = await ListService.getListSQL(req, user);

  // Call catalog API
  Logger.info(
    {
      functionName: functionName(1),
      Authorization: req.headers['authorization'],
    },
    req
  );
  const response = await fetch(
    config.limbr.catalogApi +
      `/content/search?ids=${contentIds.map((e) => e.content_id).toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: req.headers['authorization'],
      },
    }
  );

  return response.json();
};

const add = async (req: Request): Promise<List> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/list.ts : add ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Check user
  const user = await UserService.getUserFromIdSQL(req, req?.user?.id);
  if (!user) {
    throw new AppError(CErrors.userNotFound);
  }
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }

  // Check params
  const { content_id } = req.body;
  if (!content_id) {
    throw new AppError(CErrors.missingParameter);
  }

  // Check content
  const content = await ContentService.getContentFromContentId(req, content_id);
  if (!content) {
    throw new AppError(CErrors.contentNotFound);
  }

  // Check if content is not in the list
  const contentAlreadyInList = await ListService.getContentInListSQL(
    req,
    user,
    content
  );
  if (contentAlreadyInList) {
    throw new AppError(CErrors.ContentAlreadyExistInList);
  }

  // Add content to the list
  const result = await ListService.addContentInListSQL(req, user, content);

  return { user_email: result.user_email, content_id: result.content_id };
};

const remove = async (req: Request): Promise<List> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/list.ts : remove ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Check param and token
  if (typeof req.params.content_id !== 'string') {
    throw new AppError(CErrors.missingParameter);
  }
  const content_id = parseInt(req.params.content_id);

  // Check user
  const user = await UserService.getUserFromIdSQL(req, req?.user?.id);
  if (!user) {
    throw new AppError(CErrors.userNotFound);
  }
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }

  // Check content
  const content = await ContentService.getContentFromContentId(req, content_id);
  if (!content) {
    throw new AppError(CErrors.contentNotFound);
  }

  // Check if content is not in the list
  const contentAlreadyInList = await ListService.getContentInListSQL(
    req,
    user,
    content
  );
  if (!contentAlreadyInList) {
    throw new AppError(CErrors.ContentNotInList);
  }

  const result = await ListService.deleteContentInListSQL(req, user, content);

  return result;
};

export default {
  getAll,
  getAllContents,
  add,
  remove,
};
