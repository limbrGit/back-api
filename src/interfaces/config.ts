import { CaaRecord } from 'dns';

export interface MailServer {
  host: string;
  api: string;
  imapPort: number;
  domain: string;
  user: string;
  pass: string;
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
}

export interface Config {
  port: number;
  delay: number;
  logger: boolean;
  tokens: Tokens;
  mailSender: MailSender;
  mailServer: MailServer;
  database: Database;
  limbr: LimbrLinks;
}
