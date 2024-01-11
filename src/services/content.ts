// Imports
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Interfaces
import {
  Content,
  Rating,
  Picture,
  Cast,
  Link,
  Episode,
  ContentSQL,
  EpisodeSQL,
} from '../interfaces/content';

// Tools
import Logger from '../tools/logger';

// Classes
import AppError from '../classes/AppError';

// Constants
import CErrors from '../constants/errors';

// Services
import SqlService from './sql';

const gettableCatalogContent = [
  'content_id',
  'media',
  'country',
  'release_date',
  'age_certification',
  'genres',
  'runtime',
  'trailer',
  'budget',
  'revenue',
];

const gettableCatalogTitles = [
  // 'content_id',
  // 'episode_id',
  'fr',
  'en',
];

const gettableCatalogOverviews = [
  // 'content_id',
  // 'episode_id',
  'fr',
  'en',
];

const gettableCatalogRatings = [
  // 'content_id',
  'source',
  'score',
];

const gettableCatalogPictures = [
  // 'content_id',
  // 'episode_id',
  'type',
  'fr',
  'en',
  'notitle',
];

const gettableCatalogCasts = [
  // 'content_id',
  'name',
  'job',
  'priority',
  'character_role',
  'profile_path',
];

const gettableCatalogLinks = [
  // 'content_id',
  // 'episode_id',
  'platform',
  'link',
  'available'
];

const gettableCatalogEpisodes = [
  // 'content_id',
  'episode_id',
  'saison',
  'number',
  'runtime',
];

export const getRatingsFromId = async (
  req: Request,
  id: number | string,
  selectionner: string
): Promise<Rating[]> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'services/content.ts : getRatingsFromId ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  let sql;

  // Get ratings info
  sql = `
    SELECT
      ${gettableCatalogRatings.toString()}
    FROM catalog_ratings
    WHERE
      catalog_ratings.${selectionner}_id = ?
    ;
  `;
  const ratings: Rating[] = await SqlService.sendSqlRequest(req, sql, [id]);

  return ratings;
};

export const getPicturesFromId = async (
  req: Request,
  id: number | string,
  selectionner: string
): Promise<Picture[]> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'services/content.ts : getPicturesFromId ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  let sql;

  // Get pictures info
  sql = `
    SELECT
      ${gettableCatalogPictures.toString()}
    FROM catalog_pictures
    WHERE
      catalog_pictures.${selectionner}_id = ?
    ;
  `;
  const pictures: Picture[] = await SqlService.sendSqlRequest(req, sql, [id]);

  return pictures;
};

export const getCastsFromId = async (
  req: Request,
  id: number
): Promise<Cast[]> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'services/content.ts : getCastsFromId ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  let sql;

  // Get Casts info
  sql = `
    SELECT
      ${gettableCatalogCasts.toString()}
    FROM catalog_casts
    WHERE
      catalog_casts.content_id = ?
    ;
  `;
  const casts: Cast[] = await SqlService.sendSqlRequest(req, sql, [id]);

  return casts;
};

export const getLinksFromId = async (
  req: Request,
  id: number | string,
  selectionner: string
): Promise<Link[]> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'services/content.ts : getLinksFromId ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  let sql;

  // Get Links info
  sql = `
    SELECT
      ${gettableCatalogLinks.toString()}
    FROM catalog_links
    WHERE
      catalog_links.${selectionner}_id = ?
      AND catalog_links.available = TRUE
    ;
  `;
  const links: Link[] = await SqlService.sendSqlRequest(req, sql, [id]);

  return links;
};

export const getEpisodesFromId = async (
  req: Request,
  id: number | string,
  selectionner: string
): Promise<Episode[]> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'services/content.ts : getEpisodesFromId ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  let sql;

  // Get Episodes info
  sql = `
    SELECT
      ${gettableCatalogEpisodes
        .map((e) => ` catalog_episodes.${e} `)
        .toString()},
      ${gettableCatalogTitles
        .map((e) => ` catalog_titles.${e} AS titles_${e} `)
        .toString()},
      ${gettableCatalogOverviews
        .map((e) => ` catalog_overviews.${e} AS overviews_${e} `)
        .toString()}
    FROM catalog_episodes
    INNER JOIN catalog_titles
    ON
      catalog_episodes.episode_id = catalog_titles.episode_id
    INNER JOIN catalog_overviews
    ON
      catalog_episodes.episode_id = catalog_overviews.episode_id
    WHERE
      catalog_episodes.${selectionner}_id = ?
    ;
  `;
  const episodes: EpisodeSQL[] = await SqlService.sendSqlRequest(req, sql, [
    id,
  ]);

  for (let i = 0; i < episodes.length; i++) {
    const episode = episodes[i];
    episode.title = {
      fr: episode?.titles_fr,
      en: episode?.titles_en,
    };
    episode.overview = {
      fr: episode?.overviews_fr,
      en: episode?.overviews_en,
    };
    delete episode.titles_episode_id;
    delete episode.titles_fr;
    delete episode.titles_en;
    delete episode.overviews_fr;
    delete episode.overviews_en;

    // Get pictures info
    episode.pictures = await getPicturesFromId(
      req,
      episode.episode_id,
      'episode'
    );

    // Get links info
    episode.links = await getLinksFromId(req, episode.episode_id, 'episode');
  }

  return episodes;
};

export const getContentFromContentId = async (
  req: Request,
  contentId: number
): Promise<Content | null> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'services/content.ts : getContentFromContentId ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  let sql;

  // Get content info
  sql = `
    SELECT
      ${gettableCatalogContent.map((e) => ` catalog_content.${e} `).toString()},
      ${gettableCatalogTitles
        .map((e) => ` catalog_titles.${e} AS titles_${e} `)
        .toString()},
      ${gettableCatalogOverviews
        .map((e) => ` catalog_overviews.${e} AS overviews_${e} `)
        .toString()}
    FROM catalog_content
    INNER JOIN catalog_titles
    ON
      catalog_content.content_id = catalog_titles.content_id
    INNER JOIN catalog_overviews
    ON
      catalog_content.content_id = catalog_overviews.content_id
    WHERE
      catalog_content.content_id = ?
    LIMIT 1
    ;
  `;
  const content: ContentSQL = (
    await SqlService.sendSqlRequest(req, sql, [contentId])
  )[0];

  if (!content) {
    return null;
  }

  content.title = {
    fr: content?.titles_fr,
    en: content?.titles_en,
  };
  content.overview = {
    fr: content?.overviews_fr,
    en: content?.overviews_en,
  };
  delete content.titles_episode_id;
  delete content.titles_fr;
  delete content.titles_en;
  delete content.overviews_fr;
  delete content.overviews_en;

  // Get ratings info
  const ratings: Rating[] = await getRatingsFromId(req, contentId, 'content');

  // Get pictures info
  const pictures: Picture[] = await getPicturesFromId(
    req,
    contentId,
    'content'
  );

  // Get casts info
  const casts: Cast[] = await getCastsFromId(req, contentId);

  // Get links info
  const links: Link[] = await getLinksFromId(req, contentId, 'content');

  // Get episodes info
  const episodes: Episode[] = await getEpisodesFromId(
    req,
    contentId,
    'content'
  );

  return {
    ...content,
    ratings: ratings,
    pictures: pictures,
    casts: casts,
    links: links,
    episodes: episodes.length > 0 ? episodes : null,
  };
};

export default {
  getPicturesFromId,
  getCastsFromId,
  getLinksFromId,
  getEpisodesFromId,
  getContentFromContentId,
};
