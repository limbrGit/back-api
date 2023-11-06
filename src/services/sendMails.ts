import { Request } from 'express';
import nodemailer from 'nodemailer';

import config from '../configs/config';
import { UserSQL } from '../interfaces/user';
import Logger from '../tools/logger';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

interface MailData {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

const sendMail = async (
  req: Request,
  mailData: MailData
): Promise<SMTPTransport.SentMessageInfo> => {
  const functionName = (i: number) =>
    'services/sendMail.ts : sendCodeMail ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const transporter = nodemailer.createTransport({
    port: config.mailSender.port, // true for 465, false for other ports
    host: config.mailSender.host,
    auth: {
      user: config.mailSender.user,
      pass: config.mailSender.pass,
    },
    secure: true,
  });

  const result = await transporter.sendMail(mailData);
  Logger.info({ functionName: functionName(1), result: result }, req);

  return result;
};

export const sendCodeMail = async (
  req: Request,
  user: UserSQL
): Promise<SMTPTransport.SentMessageInfo> => {
  const functionName = (i: number) =>
    'services/sendMails.ts : sendCodeMail ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const mailData: MailData = {
    from: config.mailSender.user, // sender address
    to: user.email, // list of receivers
    subject: "Code d'activation Limbr",
    text: `Bonjour, Bienvenue chez Limbr ! Voici votre code de vérification : ${user.confirmation_code}.`,
    html: `<b>Bienvenue chez Limbr !</b><br>Voici votre code de vérification : ${user.confirmation_code}.<br/>`,
  };

  const result = await sendMail(req, mailData);
  Logger.info({ functionName: functionName(1), result: result }, req);

  return result;
};

export const sendForgotPasswordMail = async (
  req: Request,
  user: UserSQL,
  token: string
): Promise<SMTPTransport.SentMessageInfo> => {
  const functionName = (i: number) =>
    'services/sendMails.ts : sendCodeMail ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const link = config.limbr.resetPassword + '?token=' + token;

  const mailData: MailData = {
    from: config.mailSender.user, // sender address
    to: user.email, // list of receivers
    subject: 'Limbr : Mot de passe oublié',
    text: `Bonjour, Vous avez fait une demande de mot de passe oublié, voici le lien pour changer votre mot de passe : ${link}.`,
    html: `<b>Bonjour,</b><br>Vous avez fait une demande de mot de passe oublié, voici le lien pour changer votre mot de passe : ${link}.<br/>`,
  };

  const result = await sendMail(req, mailData);
  Logger.info({ functionName: functionName(1), result: result }, req);

  return result;
};

export const sendResetPasswordMail = async (
  req: Request,
  user: UserSQL
): Promise<SMTPTransport.SentMessageInfo> => {
  const functionName = (i: number) =>
    'services/sendMails.ts : sendCodeMail ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const mailData: MailData = {
    from: config.mailSender.user, // sender address
    to: user.email, // list of receivers
    subject: 'Limbr : Changement de mot de passe',
    text: `Bonjour, Votre mot de passe a bien été modifié.`,
    html: `<b>Bonjour,</b><br>Votre mot de passe a bien été modifié.<br/>`,
  };

  const result = await sendMail(req, mailData);
  Logger.info({ functionName: functionName(1), result: result }, req);

  return result;
};

export default {
  sendCodeMail,
  sendForgotPasswordMail,
  sendResetPasswordMail,
};
