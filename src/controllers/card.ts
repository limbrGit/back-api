// Imports
import { Request } from 'express';

// Interfaces
import { Params } from '../interfaces/tools';

// Tools
import Logger from '../tools/logger';

// Constants
import CErrors from '../constants/errors';
import { PAYPAL, LYDIA, QONTO } from '../constants/banks';

// Classes
import AppError from '../classes/AppError';

// Services
import UserService from '../services/user';
import CardService from '../services/card';
import SqlService from '../services/sql';

// Interface
import { Card } from '../interfaces/card';

const addCard = async (req: Request): Promise<Card> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/card.ts : addCard ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Check params
  const params: Params = {
    query: req.query,
    headers: req.headers,
    body: req.body,
    params: req.params,
  };
  const { name, bank, number, month, year, crypto } = params.body;
  if (!name || !bank || !number || !month || !year || !crypto) {
    throw new AppError(CErrors.missingParameter);
  }
  if (
    name.length < 5 ||
    ![PAYPAL, LYDIA, QONTO].includes(bank) ||
    number.length !== 16 ||
    month.length !== 2 ||
    year.length !== 2 ||
    crypto.length !== 3
  ) {
    throw new AppError(CErrors.wrongParameter);
  }

  // Create pool connection
  const pool = await SqlService.createPool(req);

  // Check user
  let user = await UserService.getUserFromIdWithAdminSQL(
    req,
    req?.user?.id,
    pool
  );
  if (!user) {
    throw new AppError(CErrors.userNotFound);
  }
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }
  if (!user?.admin) {
    throw new AppError(CErrors.forbidden);
  }

  const card: Card = {
    name,
    bank,
    number,
    month,
    year,
    crypto,
  };

  const result = await CardService.addCardSQL(req, card, pool);

  return result;
};

const getCardById = async (req: Request): Promise<Card> => {
  // Set function name for logs
  const functionName = (i: number) => 'controller/card.ts : getCardById ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Check params
  const params: Params = {
    query: req.query,
    headers: req.headers,
    body: req.body,
    params: req.params,
  };
  const { id } = params.params;
  if (!id) {
    throw new AppError(CErrors.missingParameter);
  }

  // Create pool connection
  const pool = await SqlService.createPool(req);

  // Check user
  let user = await UserService.getUserFromIdWithAdminSQL(
    req,
    req?.user?.id,
    pool
  );
  if (!user) {
    throw new AppError(CErrors.userNotFound);
  }
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }
  if (!user?.admin) {
    throw new AppError(CErrors.forbidden);
  }

  const result = await CardService.getCardFromIdWithNumberSQL(req, id, pool);

  return result;
};

const getCardForAPlatform = async (req: Request): Promise<Card> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'controller/card.ts : getCardForAPlatform ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Check params
  const params: Params = {
    query: req.query,
    headers: req.headers,
    body: req.body,
    params: req.params,
  };
  const { platform } = params.params;
  if (!platform) {
    throw new AppError(CErrors.missingParameter);
  }
  if (!['disney', 'paramount', 'netflix', 'canal'].includes(platform)) {
    throw new AppError(CErrors.wrongParameter);
  }

  // Create pool connection
  const pool = await SqlService.createPool(req);

  // Check user
  let user = await UserService.getUserFromIdWithAdminSQL(
    req,
    req?.user?.id,
    pool
  );
  if (!user) {
    throw new AppError(CErrors.userNotFound);
  }
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }
  if (!user?.admin) {
    throw new AppError(CErrors.forbidden);
  }

  const card = await CardService.getCardForAPlatformSQL(req, platform, pool);

  // const result = await CardService.updateAPlatformInCardFromIdSQL(
  //   req,
  //   card,
  //   platform,
  //   pool
  // );

  return card;
};

export default {
  addCard,
  getCardById,
  getCardForAPlatform,
};
