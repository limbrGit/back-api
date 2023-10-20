import dotenv from 'dotenv';
import { Config } from '../interfaces/config';

dotenv.config();

const config: Config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
  delay: process.env.DELAY ? parseInt(process.env.DELAY) : 100, // 130 in prod
  logger: process.env.LOGGER === 'true',

  tokens: {
    access: {
      secret: process.env.ACCESS_TOKEN_SECRET!,
      expire: process.env.ACCESS_TOKEN_EXPIRES_IN || "1d",
    },
    refresh: {
      secret: process.env.REFRESH_TOKEN_SECRET!,
      expire: process.env.REFRESH_TOKEN_EXPIRES_IN || "1d",
    }
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
    // pool: {
    //   max: 5,
    //   min: 0,
    //   acquire: 30000,
    //   idle: 10000,
    // },
    // toto: {
    //   dev: {
    //     username: 'root',
    //     password: yourPasswordHere,
    //     database: 'sequelize_passport',
    //     host: '127.0.0.1',
    //     dialect: 'mysql',
    //   },
    //   preprod: {
    //     username: '',
    //     password: null,
    //     database: '',
    //     host: '',
    //     dialect: 'mysql',
    //   },
    //   prod: {
    //     username: '',
    //     password: null,
    //     database: '',
    //     host: '127.0.0.1',
    //     dialect: 'mysql',
    //   },
    // },
  },
};

export default config;
