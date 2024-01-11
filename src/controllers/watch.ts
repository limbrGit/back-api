// Imports
import { Request } from 'express';

// Interfaces
import { Link } from '../interfaces/content';
import { PlatformInfoSQL } from '../interfaces/database';

// Tools
import Logger from '../tools/logger';

// Constants
import CErrors from '../constants/errors';

// Classes
import AppError from '../classes/AppError';

// Services
import UserService from '../services/user';
import PlatformInfoService from '../services/platformInfo';
import PlatformAccountService from '../services/platformAccount';
import ContentService from '../services/content';

const startWatchContent = async (req: Request): Promise<Link> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'controller/list.ts : startWatchContent ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const { type, id } = req.params;

  // Check param and token
  if (!type || !id) {
    throw new AppError(CErrors.missingParameter);
  }
  if (!['content', 'episode'].includes(type)) {
    throw new AppError(CErrors.wrongTypeFormat);
  }

  // Check user
  const user = await UserService.getUserFromIdSQL(req, req?.user?.id);
  if (!user) {
    throw new AppError(CErrors.userNotFound);
  }
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }

  // Get content or episode
  const content =
    type === 'content'
      ? await ContentService.getContentFromContentId(req, parseInt(id))
      : await ContentService.getEpisodesFromId(req, parseInt(id), 'episode');
  if (!content) {
    throw new AppError(CErrors.contentNotFound);
  }
  const element = Array.isArray(content) ? content[0] : content;

  // Get the platforms infos
  let platformInfos: PlatformInfoSQL[] = [];
  for (let i = 0; i < element.links.length; i++) {
    const link = element.links[i];
    const platformInfo = await PlatformInfoService.getPlatformInfoFromName(
      req,
      link.platform
    );
    platformInfos.push({
      ...platformInfo,
      price: parseFloat(platformInfo.price),
    });
  }

  // Use free days platform
  const platformFree = platformInfos.find(
    (platformInfo) => platformInfo.free_days > 0
  );
  if (platformFree) {
    // TODO
  }

  // Find the cheapest platform
  const platformCheapest = platformInfos.reduce((prev, curr) =>
    prev.price / prev.users_per_account < curr.price / curr.users_per_account
      ? prev
      : curr
  );

  // Return temporary just to send the link
  return element.links.find(
    (link) => link.available && link.platform === platformCheapest.name
  );

  // Find the cheapest available platform
  const platformAccountsAvailables =
    await PlatformAccountService.getPlatformAccountsAvailable(req, [
      platformCheapest.name,
    ]);
};

export default {
  startWatchContent,
};
