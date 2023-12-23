import dotenv from 'dotenv';
import { Config } from '../interfaces/config';

dotenv.config();

const config: Config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
  serverName: process.env.SERVER_NAME || 'back-api',
  delay: process.env.DELAY ? parseInt(process.env.DELAY) : 100, // 130 in prod
  logger: process.env.LOGGER === 'true',

  tokens: {
    access: {
      secret: process.env.ACCESS_TOKEN_SECRET!,
      expire: process.env.ACCESS_TOKEN_EXPIRES_IN || '1d',
    },
    refresh: {
      secret: process.env.REFRESH_TOKEN_SECRET!,
      expire: process.env.REFRESH_TOKEN_EXPIRES_IN || '1d',
    },
  },

  mailSender: {
    host: process.env.MAIL_SENDER_HOST!,
    port: parseInt(process.env.MAIL_SENDER_PORT!),
    user: process.env.MAIL_SENDER_USER!,
    pass: process.env.MAIL_SENDER_PASS!,
  },

  mailServer: {
    host: process.env.MAIL_HOST || 'mailcow.limbr.fr',
    api: process.env.MAIL_API || '',
    imapPort: process.env.MAIL_IMAP_PORT
      ? parseInt(process.env.MAIL_IMAP_PORT)
      : 993,
    domain: process.env.MAIL_DOMAIN || 'lbmail.fr',
    user: process.env.MAIL_USER || 'accounts@lbmail.fr',
    pass: process.env.MAIL_PASS!,
  },

  database: {
    host: process.env.DATABASE_HOST!,
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASS!,
    database: process.env.DATABASE_DB!,
    dialect: 'mysql',
  },

  limbr: {
    resetPassword:
      process.env.LIMBR_RESET_PASSWORD ||
      'https://front.limbr.fr/resetPassword',
    catalogApi : process.env.LIMBR_CATALOG_API ||
    'https://catalog-api.limbr.fr',
  },
};

export default config;
