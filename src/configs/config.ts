// Imports
import dotenv from 'dotenv';

// Interfaces
import { Config } from '../interfaces/config';

// Constants
import { ENV_DEV } from '../constants/environement';

dotenv.config();

const config: Config = {
  env: process.env.NODE_ENV || ENV_DEV,
  port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
  serverName: process.env.SERVER_NAME || 'back-api',
  delay: process.env.DELAY ? parseInt(process.env.DELAY) : 100, // 130 in prod
  logger: process.env.LOGGER === 'true',
  creationWaitingTime: process.env.CREATION_WAITING_TIME
    ? parseInt(process.env.CREATION_WAITING_TIME)
    : 6,

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
    supportEmail: process.env.MAIL_SUPPORT_EMAIL || 'support@lbmail.fr',
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
    accountApi: process.env.LIMBR_ACCOUNT_API || 'https://account-api.limbr.fr',
  },

  cipher: {
    algorithm: process.env.CIPHER_ALGORITHM || 'aes-256-cbc',
    cardNumber: process.env.CIPHER_CARD_NUMBER!,
    cardCrypto: process.env.CIPHER_CARD_CRYPTO!,
    netflix: process.env.CIPHER_NETFLIX!,
    disney: process.env.CIPHER_DISNEY!,
    canal: process.env.CIPHER_CANAL!,
    paramount: process.env.CIPHER_PARAMOUNT!,
    ocs: process.env.CIPHER_OCS!,
    crunchyroll: process.env.CIPHER_CRUNCHYROLL!,
    hbo: process.env.CIPHER_HBO!,
  },

  vivawallet: {
    siteCode:
      (process.env.NODE_ENV?.toLowerCase() === ENV_DEV?.toLowerCase()
        ? process.env.VIVAWALLET_SITE_CODE_DEMO
        : process.env.VIVAWALLET_SITE_CODE_PROD) || '6271',
    paymentUrl:
      (process.env.NODE_ENV?.toLowerCase() === ENV_DEV?.toLowerCase()
        ? process.env.VIVAWALLET_PAYMENT_URL_DEMO
        : process.env.VIVAWALLET_PAYMENT_URL_PROD) ||
      'demo-api.vivapayments.com',
    accountUrl:
      (process.env.NODE_ENV?.toLowerCase() === ENV_DEV?.toLowerCase()
        ? process.env.VIVAWALLET_ACCOUNT_URL_DEMO
        : process.env.VIVAWALLET_ACCOUNT_URL_PROD) ||
      'demo-accounts.vivapayments.com',
    orderUrl:
      (process.env.NODE_ENV?.toLowerCase() === ENV_DEV?.toLowerCase()
        ? process.env.VIVAWALLET_ORDER_URL_DEMO
        : process.env.VIVAWALLET_ORDER_URL_PROD) || 'demo.vivapayments.com',
    orderBasicAuth:
      process.env.NODE_ENV?.toLowerCase() === ENV_DEV?.toLowerCase()
        ? process.env.VIVAWALLET_ORDER_BASIC_AUTH_DEMO!
        : process.env.VIVAWALLET_ORDER_BASIC_AUTH_PROD!,
    loginBasicAuth:
      process.env.NODE_ENV?.toLowerCase() === ENV_DEV?.toLowerCase()
        ? process.env.VIVAWALLET_LOGIN_BASIC_AUTH_DEMO!
        : process.env.VIVAWALLET_LOGIN_BASIC_AUTH_PROD!,
  },

  notifications: {
    logoUrl: process.env.NOTIFICATIONS_LOGO_URL!,
    webhookTeams: process.env.NOTIFICATIONS_WEBHOOK_TEAMS!,
    webhookDiscordAlert: process.env.NOTIFICATIONS_WEBHOOK_DISCORD_ALERT!,
    webhookDiscordLog: process.env.NOTIFICATIONS_WEBHOOK_DISCORD_LOG!,
  },
};

export default config;
