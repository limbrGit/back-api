// Imports
import { Request } from 'express';
import dayjs from 'dayjs';

// Interfaces
import { Link, Content, Episode } from '../interfaces/content';
import { PlatformAccountSQL, PlatformInfoSQL } from '../interfaces/database';

// Tools
import Logger from '../tools/logger';
import { wait } from '../tools/strings';

// Constants
import CErrors from '../constants/errors';

// Classes
import AppError from '../classes/AppError';

// Config
import config from '../configs/config';

// Services
import UserService from '../services/user';
import PlatformInfoService from '../services/platformInfo';
import PlatformAccountService from '../services/platformAccount';
import ContentService from '../services/content';
import UserPlatformService from '../services/userPlatforms';
import UserContentService from '../services/userContents';
import SqlService from '../services/sql';

const startWatchContent = async (
  req: Request,
  iteration: number = 0
): Promise<Link> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'controller/list.ts : startWatchContent ' + i;
  Logger.info({ functionName: functionName(0), iteration: iteration }, req);

  const { type, id } = req.params;

  // Check param and token
  if (!type || !id) {
    throw new AppError(CErrors.missingParameter);
  }
  if (!['content', 'episode'].includes(type)) {
    throw new AppError(CErrors.wrongTypeFormat);
  }
  Logger.info({ functionName: functionName(1), type: type, id: id }, req);

  // If it is the 4th try, we throw an error
  if (iteration > 2) {
    throw new AppError(CErrors.createPlatformAccountError);
  }

  // Create pool connection
  const pool = await SqlService.createPool(req);

  // Check user
  const user = await UserService.getUserFromIdSQL(req, req?.user?.id, pool);
  if (!user) {
    throw new AppError(CErrors.userNotFound);
  }
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }

  // Check if user have a current token
  if (!user.token_end_date || (user.token_end_date as number) < Date.now()) {
    throw new AppError(CErrors.noCurrentToken);
  }

  // Get content or episode
  const content =
    type === 'content'
      ? await ContentService.getContentFromContentId(req, parseInt(id), pool)
      : await ContentService.getEpisodesFromId(
          req,
          parseInt(id),
          'episode',
          pool
        );
  if (!content) {
    throw new AppError(CErrors.contentNotFound);
  }
  const element = Array.isArray(content) ? content[0] : content;

  // Create the userContent
  await UserContentService.createUserContentSQL(
    req,
    user,
    type === 'content'
      ? (element as Content).content_id
      : (element as Episode).content_id,
    type === 'content' ? null : (element as Episode).episode_id
  );

  // Get the platforms infos
  let platformInfos: PlatformInfoSQL[] = [];
  for (let i = 0; i < element.links.length; i++) {
    const link = element.links[i];
    const platformInfo = await PlatformInfoService.getPlatformInfoFromName(
      req,
      link.platform,
      pool
    );
    platformInfos.push({
      ...platformInfo,
      price: parseFloat(platformInfo.price as string),
    });
  }

  // Get user platforms
  const userPlatforms = await UserPlatformService.getUserPlatformsFromUserSQL(
    req,
    { user, pool }
  );

  // Check if there is no user platform available for this content
  const platformAlreadyUsed = userPlatforms.find(
    (e) => e.platform && platformInfos.map((e) => e.name).includes(e.platform)
  );

  //! If the user already have a platform account used with this content
  if (platformAlreadyUsed) {
    // Get platform account
    const platformAccount =
      await PlatformAccountService.getPlatformAccountFromEmail(
        req,
        platformAlreadyUsed?.platform_account_email!,
        pool
      );

    // Return link and platform
    return element.links.find(
      (link) =>
        link.available && link.platform === platformAlreadyUsed?.platform
    )!;
    // return {
    //   platformAccount: platformAccount,
    //   link: element.links.find(
    //     (link) =>
    //       link.available && link.platform === platformAlreadyUsed?.platform
    //   )!,
    // };
  }

  //! The user need a new platform account

  // Find the cheapest available platform
  const platformAccountsAvailables =
    await PlatformAccountService.getPlatformAccountsAvailable(
      req,
      platformInfos.map((e) => e.name),
      pool
    );

  // Logger.info({ functionName: functionName(1), platformInfos: platformInfos.map((e) => e.name) }, req);
  // Logger.info({ functionName: functionName(1), platformAccountsAvailables }, req);
  //! Find the platform with the less place
  if (platformAccountsAvailables.length > 0) {
    // In the availables, get the account platforms almost full and the cheapest
    const platformAccountAlmostFullAndCheapest = platformAccountsAvailables
      .sort((a, b) => {
        const userLeftA = a.users_per_account! - a.users!;
        const userLeftB = b.users_per_account! - b.users!;
        return userLeftA - userLeftB;
      })
      .filter((e, _i, arr) => e.users_per_account === arr[0].users_per_account)
      .sort((a, b) => {
        const platformInfo = (p: PlatformAccountSQL) =>
          platformInfos.find((e) => e.name === p.platform);

        const pricePlatformA =
          (platformInfo(a)?.price as number) /
          platformInfo(a)?.users_per_account!;
        const pricePlatformB =
          (platformInfo(b)?.price as number) /
          platformInfo(b)?.users_per_account!;

        return pricePlatformA - pricePlatformB;
      });

    // Save user platform
    await UserPlatformService.createUserPlatformsSQL(
      req,
      user,
      platformAccountAlmostFullAndCheapest[0],
      dayjs(user.token_end_date).format('YYYY-MM-DD HH:mm:ss'),
      pool
    );

    // Return link and platform
    return element.links.find(
      (link) =>
        link.available &&
        link.platform === platformAccountAlmostFullAndCheapest[0].platform
    )!;
    // return {
    //   platformAccount: platformAccountAlmostFullAndCheapest[0],
    //   link: element.links.find(
    //     (link) =>
    //       link.available &&
    //       link.platform === platformAccountAlmostFullAndCheapest[0].platform
    //   )!,
    // };
  }

  //! There is no platform account available, we check in the platform in creation

  // Get platform with free days or the cheapest
  const platformCheapest =
    platformInfos.find((platformInfo) => platformInfo.free_days > 0) ||
    platformInfos.reduce((prev, curr) =>
      (prev.price as number) / (prev.users_per_account as number) <
      (curr.price as number) / (curr.users_per_account as number)
        ? prev
        : curr
    );

  // Get the platforms in creations
  const platformsInCreation =
    await PlatformAccountService.getPlatformAccountsInCreation(
      req,
      platformInfos.map((e) => e.name),
      pool
    );

  // Add the user in the platfrom creation waiting list
  if (platformsInCreation.length > 0) {
    // Check if the account is ready
    let platformInCreation =
      await PlatformAccountService.updatePlatformAccountsInCreation(
        req,
        platformsInCreation[0],
        pool
      );

    while (
      platformInCreation.active !== true &&
      platformInCreation.registration === 'started' &&
      dayjs(platformInCreation.created_at).isAfter(
        dayjs().subtract(config.creationWaitingTime, 'minute')
      )
    ) {
      // Wait 10sec
      await wait(10);

      // Check if the account is ready
      platformInCreation = platformInCreation =
        await PlatformAccountService.getPlatformAccountFromEmail(
          req,
          platformInCreation.email,
          pool
        );
    }
    if (platformInCreation.active) {
      // Save user platform
      await UserPlatformService.createUserPlatformsSQL(
        req,
        user,
        platformInCreation,
        dayjs(user.token_end_date).format('YYYY-MM-DD HH:mm:ss'),
        pool
      );

      // Return link
      return element.links.find(
        (link) => link.platform === platformInCreation.platform
      )!;
    } else {
      //! The account creation is too long, maybe it has crash. We start create a new one.
      pool.release();
      startWatchContent(req, iteration + 1);
    }
  }

  //! There is no platform account available, we need to create a new one

  // Create an account and use it
  const newPlatformAccount = await PlatformAccountService.createPlatformAccount(
    req,
    platformCheapest,
    pool
  );

  // Save user platform
  await UserPlatformService.createUserPlatformsSQL(
    req,
    user,
    newPlatformAccount,
    dayjs(user.token_end_date).format('YYYY-MM-DD HH:mm:ss'),
    pool
  );

  // Return link
  return element.links.find(
    (link) => link.platform === newPlatformAccount.platform
  )!;
  // return {
  //   platformAccount: newPlatformAccount,
  //   link: element.links.find(
  //     (link) => link.platform === newPlatformAccount.platform
  //   )!,
  // };
};

const getPlatformAvailable = async (
  req: Request,
  iteration: number = 0
): Promise<string[]> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'controller/list.ts : getPlatformAvailable ' + i;
  Logger.info({ functionName: functionName(0), iteration: iteration }, req);

  // Create pool connection
  const pool = await SqlService.createPool(req);

  // Check user
  const user = await UserService.getUserFromIdSQL(req, req?.user?.id, pool);
  if (!user) {
    throw new AppError(CErrors.userNotFound);
  }
  if (user.deleted_at) {
    throw new AppError(CErrors.userDeleted);
  }

  const platformInfos = await PlatformInfoService.getAllPlatformInfos(
    req,
    pool
  );

  // Return link
  return platformInfos.filter((e) => e.valid === 1).map((e) => e.name);
};

export default {
  startWatchContent,
  getPlatformAvailable,
};
