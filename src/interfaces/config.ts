import { CaaRecord } from 'dns';

export interface MailServer {
  host: string;
  api: string;
  imapPort: number;
  domain: string;
  user: string;
  pass: string;
  supportEmail: string;
}

export interface Database {
  host: string;
  user: string;
  password: string;
  database: string;
  dialect: string;
  // pool: {
  //   max: number;
  //   min: number;
  //   acquire: number;
  //   idle: number;
  // };
}

export interface Token {
  secret: string;
  expire: string;
}

export interface Tokens {
  access: Token;
  refresh: Token;
}

export interface MailSender {
  host: string;
  port: number;
  user: string;
  pass: string;
}

export interface LimbrLinks {
  resetPassword: string;
  catalogApi: string;
  accountApi: string;
}

export interface CipherKeys {
  algorithm: string;
  netflix: string;
  disney: string;
  canal: string;
  paramount: string;
  ocs: string;
  crunchyroll: string;
}

export interface Vivawallet {
  siteCode: string;
  paymentUrl: string;
  accountUrl: string;
  orderUrl: string;
  orderBasicAuth: string;
  loginBasicAuth: string;
}

export interface Notifications {
  logoUrl: string;
  webhookTeams: string;
  webhookDiscordAlert: string;
  webhookDiscordLog: string;
}

export interface Config {
  env: string;
  port: number;
  serverName: string;
  delay: number;
  logger: boolean;
  tokens: Tokens;
  mailSender: MailSender;
  mailServer: MailServer;
  database: Database;
  limbr: LimbrLinks;
  cipher: CipherKeys;
  vivawallet: Vivawallet;
  notifications: Notifications;
}
