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
    catalogApi: process.env.LIMBR_CATALOG_API || 'https://catalog-api.limbr.fr',
  },

  cipher: {
    algorithm: process.env.CIPHER_ALGORITHM || 'aes-256-cbc',
    netflix: process.env.CIPHER_NETFLIX!,
    disney: process.env.CIPHER_DISNEY!,
    canal: process.env.CIPHER_CANAL!,
    paramount: process.env.CIPHER_PARAMOUNT!,
    ocs: process.env.CIPHER_OCS!,
    crunchyroll: process.env.CIPHER_CRUNCHYROLL!,
  },

  vivawallet: {
    siteCode: process.env.VIVAWALLET_SITE_CODE || '6271',
    paymentUrl: process.env.VIVAWALLET_PAYMENT_URL || 'demo-api.vivapayments.com',
    accountUrl: process.env.VIVAWALLET_ACCOUNT_URL || 'demo-accounts.vivapayments.com',
    basicAuth: process.env.VIVAWALLET_BASIC_AUTH!
  },
};

export default config;
