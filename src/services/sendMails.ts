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
    text: `Bienvenue chez Limbr !

    Voici ton code de vérification pour terminer ton inscription : ${user.confirmation_code}
    
    Tu pourras bientôt accéder aux contenus originaux, aux avant-premières exclusives, à des films à succès, à des milliers d'épisodes de séries et le meilleur de l'animation des plus grandes plateformes de streaming.
    
    Et notre catalogue continue de grandir.
    
    L'équipe Limbr
    
    ---
    
    Tu peux supprimer ton compte Limbr à tout moment depuis les paramètres de ton compte.
    Consulte les conditions d'abonnement pour obtenir plus d'informations sur notre produit.
    Consulte notre Politique de confidentialité.
    `,
    html: `
          <html>
          <head>
          </head>
          <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 20px; box-shadow: 0px 0px 10px 7px  #e0e0e0;">
              <header style="margin-bottom: 40px; display: flex; justify-content: center; margin-top: 20px">
                <img style="width: 150px" src="https://front.limbr.fr/static/media/Turquoisebg_off.7589049b07499f45612e5214f1276798.svg" alt="Limbr Logo" />
              </header>
              <section style="color: #333;">
                <p>Bienvenue chez <strong>Limbr</strong> !</p>
                <p>Voici ton <strong>code de vérification</strong> pour terminer ton inscription :</p>
                <div style="text-align: center; background-color: #eee; padding: 10px; margin: 20px 0; font-size: 35px; font-weight: bold;">${user.confirmation_code}</div>
                <p>Tu pourras bientôt accéder aux contenus originaux, aux avant-premières exclusives, à des films à succès, à des milliers d'épisodes de séries et le meilleur de l'animation des plus grandes plateformes de streaming.</p>
                <p>Et notre catalogue continue de grandir.</p>
                <p>L'équipe Limbr</p>
              </section>
              <footer style="color: #999; text-align: start; font-size: 10px; font-style: italic; margin-top: 40px;">
              <hr style="height: 3px; border: none; margin: 20px 0; background: radial-gradient(
                83% 557% at 3% 23%,
                #58c4f6 0%,
                #5df7a4 22.92%,
                #abb3fc 42.71%,
                #feb0fe 61.46%,
                #e1f664 80.21%,
                #2ad0ca 100%
              );">              
                <p>
                Tu peux supprimer ton compte Limbr à tout moment depuis les paramètres de ton compte.
                <br>Consulte les <a href="https://front.limbr.fr/cgu" style="color: #06f;">conditions d'utilisation</a> pour obtenir plus d'informations sur notre produit.
                <br>Consulte notre <a href="https://front.limbr.fr/privacy" style="color: #06f;">politique de confidentialité</a>.
                </p>
                <p>
                Cet e-mail a été envoyé à ${user.email}. 
                <br>Ne pas répondre à cet e-mail, car cette adresse est liée à une messagerie automatique.
                <br>© 2023 Limbr et ses entités affiliées. Tous droits réservés.
                </p>
              </footer>
            </div>
          </body>
          </html>
          `
,
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
    text: `Bonjour, 
    
    Tu as fait une demande de mot de passe oublié, voici un lien pour créer un nouveau mot de passe : ${link}.`,
    html: `
          <html>
          <head>
          </head>
          <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 20px; box-shadow: 0px 0px 10px 7px  #e0e0e0;">
              <header style="margin-bottom: 40px; display: flex; justify-content: center; margin-top: 20px">
                <img style="width: 150px" src="https://front.limbr.fr/static/media/Turquoisebg_off.7589049b07499f45612e5214f1276798.svg" alt="Limbr Logo" />
              </header>
              <section style="color: #333;">
                <p>Bonjour, </p>
                <p>Tu as fait une demande de <strong> mot de passe oublié </strong>, 
                <br>voici un lien pour créer un nouveau mot de passe :</p>
                <div style="display: flex; justify-content: center">
                <a href="${link}" style="text-decoration: none; display: inline-block; text-align: center; background-color: #2AD0CA; color: black; padding: 10px 20px; font-size: 16px; font-weight: bold; border-radius: 50px; cursor: pointer;">
                  Clique ici
                </a>
                </div>
                <p>L'équipe Limbr</p>
              </section>
              <footer style="color: #999; text-align: start; font-size: 10px; font-style: italic; margin-top: 40px;">
              <hr style="height: 3px; border: none; margin: 20px 0; background: radial-gradient(
                83% 557% at 3% 23%,
                #58c4f6 0%,
                #5df7a4 22.92%,
                #abb3fc 42.71%,
                #feb0fe 61.46%,
                #e1f664 80.21%,
                #2ad0ca 100%
              );">              
                <p>
                Consulte les <a href="https://front.limbr.fr/cgu" style="color: #06f;">conditions d'utilisation</a> pour obtenir plus d'informations sur notre produit.
                <br>Consulte notre <a href="https://front.limbr.fr/privacy" style="color: #06f;">politique de confidentialité</a>.
                </p>
                <p>
                Cet e-mail a été envoyé à ${user.email}. 
                <br>Ne pas répondre à cet e-mail, car cette adresse est liée à une messagerie automatique.
                <br>© 2023 Limbr et ses entités affiliées. Tous droits réservés.
                </p>
              </footer>
            </div>
          </body>
          </html>
          `,
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
    text: `Bonjour, 
    
    Ton mot de passe a bien été mis à jour.
    
    Si tu n'es pas à l'origine de ce changement, merci de nous contacter, nous ferons le nécessaire.`,
    html: `
    <html>
    <head>
    </head>
    <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 20px; box-shadow: 0px 0px 10px 7px  #e0e0e0;">
        <header style="margin-bottom: 40px; display: flex; justify-content: center; margin-top: 20px">
          <img style="width: 150px" src="https://front.limbr.fr/static/media/Turquoisebg_off.7589049b07499f45612e5214f1276798.svg" alt="Limbr Logo" />
        </header>
        <section style="color: #333;">
          <p>Bonjour, </p>
          <p>Ton <strong>mot de passe</strong> a bien été <strong>mis à jour</strong>. </p>
          <p>Si tu n'es pas à l'origine de ce changement, merci de nous contacter rapidement, nous ferons le nécessaire.</p>
          
          <p>L'équipe Limbr</p>
        </section>
        <footer style="color: #999; text-align: start; font-size: 10px; font-style: italic; margin-top: 40px;">
        <hr style="height: 3px; border: none; margin: 20px 0; background: radial-gradient(
          83% 557% at 3% 23%,
          #58c4f6 0%,
          #5df7a4 22.92%,
          #abb3fc 42.71%,
          #feb0fe 61.46%,
          #e1f664 80.21%,
          #2ad0ca 100%
        );">              
          <p>
          Consulte les <a href="https://front.limbr.fr/cgu" style="color: #06f;">conditions d'utilisation</a> pour obtenir plus d'informations sur notre produit.
          <br>Consulte notre <a href="https://front.limbr.fr/privacy" style="color: #06f;">politique de confidentialité</a>.
          </p>
          <p>
          Cet e-mail a été envoyé à ${user.email}. 
          <br>Ne pas répondre à cet e-mail, car cette adresse est liée à une messagerie automatique.
          <br>© 2023 Limbr et ses entités affiliées. Tous droits réservés.
          </p>
        </footer>
      </div>
    </body>
    </html>
    `,
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
