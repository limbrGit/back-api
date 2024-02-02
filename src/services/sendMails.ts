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
    from: `Limbr <${config.mailSender.user}>`, // sender address
    to: user.email, // list of receivers
    subject: "Code d'activation Limbr",
    text: `Bienvenue chez Limbr !

    Voici votre code de vérification pour terminer votre inscription : ${user.confirmation_code}

    Vous pourrez bientôt accéder aux contenus originaux, aux avant-premières exclusives, à des films à succès, à des milliers d'épisodes de séries et le meilleur de l'animation des plus grandes plateformes de streaming.

    Et notre catalogue continue de grandir.

    L'équipe Limbr

    ---

    Vous pouvez supprimer votre compte Limbr à tout moment depuis les paramètres de votre espace personnel.
    Consultez les conditions d'utilisation pour obtenir plus d'informations sur notre produit.
    Consultez aussi notre politique de confidentialité.
    `,
    html: `
      <html>
      <head>
      </head>
      <body style="margin: 0; padding: 20px; font-family: Tahoma, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 20px; box-shadow: 0px 0px 10px 7px #e0e0e0;">
          <header style="margin-bottom: 40px; text-align: center; margin-top: 20px;">
            <img style="width: 150px; display: block; margin: auto;" src="https://limbr.fr/Logo/Turquoisebg_off.png" alt="Limbr Logo" />
          </header>
          <section style="color: #040311; font-family: Verdana; font-size: 14px; line-height: 1.5;">
            <div>Bienvenue chez <strong>Limbr</strong> !</div><br>
            <div>Voici votre <strong>code de vérification</strong> pour terminer votre inscription :</div>
            <div style="text-align: center; background-color: #e6e6e6; border-radius: 50px; width: 50%; padding: 10px; margin: 20px auto; font-size: 35px; font-weight: bold; letter-spacing: 5px;">${user.confirmation_code}</div>
            <div>Vous pourrez bientôt accéder aux contenus originaux, aux avant-premières exclusives, à des films à succès, à des milliers d'épisodes de séries et le meilleur de l'animation des plus grandes plateformes de streaming.</div><br>
            <div>Et notre catalogue continue de grandir.</div><br>
            <div>L'équipe Limbr</div>
          </section>
          <footer style="color: #4F4F59; font-family: Verdana; text-align: start; font-size: 10px; font-style: italic; margin-top: 40px;">
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
            Vous pouvez supprimer votre compte Limbr à tout moment depuis les paramètres de votre espace personnel.
            <br>Consultez les <a href="https://limbr.fr/cgu" style="color: #4F4F59">conditions d'utilisation</a> pour obtenir plus d'informations sur notre produit.
            <br>Consultez notre <a href="https://limbr.fr/privacy" style="color: #4F4F59">politique de confidentialité</a>.
          </p>
          <p>
            Cet e-mail a été envoyé à <a href="mailto:${user.email}" target="_blank" style="color: #4F4F59; text-decoration: none">${user.email}</a>.
            <br>Ne pas répondre à cet e-mail, car cette adresse est liée à une messagerie automatique.
            <br>© 2023 Limbr, SAS. Tous droits réservés.
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
    from: `Limbr <${config.mailSender.user}>`, // sender address
    to: user.email, // list of receivers
    subject: 'Limbr : Mot de passe oublié',
    text: `Bonjour,

    Vous avez fait une demande de mot de passe oublié, voici un lien pour créer un nouveau mot de passe : ${link}.`,
    html: `
      <html>
      <head>
      </head>
      <body style="margin: 0; padding: 20px; font-family: Verdana, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 20px; box-shadow: 0px 0px 10px 7px #e0e0e0;">
          <header style="margin-bottom: 40px; text-align: center; margin-top: 20px;">
            <img style="width: 150px; display: block; margin: auto;" src="https://limbr.fr/Logo/Turquoisebg_off.png" alt="Limbr Logo" />
          </header>
          <section style="color: #040311; font-size: 14px; line-height: 1.5;">
            <div>Bonjour, </div><br>
            <div>Vous avez fait une demande de <strong>mot de passe oublié</strong>, voici un lien pour créer un nouveau mot de passe :</div><br>
            <div style="text-align: center;">
              <a href="${link}" style="text-decoration: none; display: inline-block; font-family: Tahoma; background-color: #2AD0CA; color: white; padding: 10px 20px; border-radius: 50px; cursor: pointer; text-transform: uppercase;">
                Cliquez ici
              </a>
            </div><br>
            <div>L'équipe Limbr</div>
          </section>
          <footer style="color: #4F4F59; text-align: start; font-size: 10px; font-style: italic; margin-top: 40px;">
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
            Vous pouvez supprimer votre compte Limbr à tout moment depuis les paramètres de votre espace personnel.
            <br>Consultez les <a href="https://limbr.fr/cgu" style="color: #4F4F59">conditions d'utilisation</a> pour obtenir plus d'informations sur notre produit.
            <br>Consultez notre <a href="https://limbr.fr/privacy" style="color: #4F4F59">politique de confidentialité</a>.
          </p>
          <p>
            Cet e-mail a été envoyé à <a href="mailto:${user.email}" target="_blank" style="color: #4F4F59; text-decoration: none">${user.email}</a>.
            <br>Ne pas répondre à cet e-mail, car cette adresse est liée à une messagerie automatique.
            <br>© 2023 Limbr, SAS. Tous droits réservés.
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
    from: `Limbr <${config.mailSender.user}>`, // sender address
    to: user.email, // list of receivers
    subject: 'Limbr : Changement de mot de passe',
    text: `Bonjour,

    Votre mot de passe a bien été mis à jour.

    Si vous n'êtes pas à l'origine de ce changement, merci de nous contacter, nous ferons le nécessaire.`,
    html: `
    <html>
    <head>
    </head>
    <body style="margin: 0; padding: 20px; font-family: Verdana, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 20px; box-shadow: 0px 0px 10px 7px #e0e0e0;">
        <header style="margin-bottom: 40px; text-align: center; margin-top: 20px;">
          <img style="width: 150px; display: block; margin: auto;" src="https://limbr.fr/Logo/Turquoisebg_off.png" alt="Limbr Logo" />
        </header>
        <section style="color: #040311 font-size: 14px; line-height: 1.5;">
          <div>Bonjour,</div><br>
          <div>Votre <strong>mot de passe</strong> a bien été <strong>mis à jour</strong>.</div>
          <div>Si vous n'êtes pas à l'origine de ce changement, merci de nous contacter rapidement, nous ferons le nécessaire.</div><br>
          <div>L'équipe Limbr</div>
        </section>
        <footer style="color: #4F4F59; text-align: start; font-size: 10px; font-style: italic; margin-top: 40px;">
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
            Vous pouvez supprimer votre compte Limbr à tout moment depuis les paramètres de votre espace personnel.
            <br>Consultez les <a href="https://limbr.fr/cgu" style="color: #4F4F59">conditions d'utilisation</a> pour obtenir plus d'informations sur notre produit.
            <br>Consultez notre <a href="https://limbr.fr/privacy" style="color: #4F4F59">politique de confidentialité</a>.
          </p>
          <p>
            Cet e-mail a été envoyé à <a href="mailto:${user.email}" target="_blank" style="color: #4F4F59; text-decoration: none">${user.email}</a>.
            <br>Ne pas répondre à cet e-mail, car cette adresse est liée à une messagerie automatique.
            <br>© 2023 Limbr, SAS. Tous droits réservés.
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

export const sendContactUsMail = async (
  req: Request,
  user: UserSQL,
  message: string
): Promise<SMTPTransport.SentMessageInfo[]> => {
  const functionName = (i: number) =>
    'services/sendMails.ts : sendContactUsMail ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  let mailDataSupport: MailData = {
    from: `Limbr <${config.mailSender.user}>`, // sender address
    to: config.mailServer.supportEmail, // list of receivers
    subject: `Contactez-nous : ${user.email}`,
    text: `Bonjour,

    Voici le message de ${user.firstname} ${user.lastname}
    Email : ${user.email}
    ---------------------
    ${message}
    ---------------------
    `,
    html: `
    <html>
    <head>
    </head>
    <body style="margin: 0; padding: 20px; font-family: Verdana, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 20px; box-shadow: 0px 0px 10px 7px #e0e0e0;">
        <header style="margin-bottom: 40px; text-align: center; margin-top: 20px;">
          <img style="width: 150px; display: block; margin: auto;" src="https://limbr.fr/Logo/Turquoisebg_off.png" alt="Limbr Logo" />
        </header>
        <section style="color: #040311; font-size: 14px; line-height: 1.5;">
          <div>Bonjour,</div><br>
          <div>Voici le message de <strong>${user.firstname} ${user.lastname}</strong></div>
          <div>Email : <strong>${user.email}</strong></div>
          <div>---------------------</div><br>
          <div>${message}</div><br>
          <div>---------------------</div><br>
          <div>L'équipe Limbr</div>
        </section>
        <footer style="color: #4F4F59; text-align: start; font-size: 10px; font-style: italic; margin-top: 40px;">
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
            Vous pouvez supprimer votre compte Limbr à tout moment depuis les paramètres de votre espace personnel.
            <br>Consultez les <a href="https://limbr.fr/cgu" style="color: #4F4F59">conditions d'utilisation</a> pour obtenir plus d'informations sur notre produit.
            <br>Consultez notre <a href="https://limbr.fr/privacy" style="color: #4F4F59">politique de confidentialité</a>.
          </p>
          <p>
            Cet e-mail a été envoyé à <a href="mailto:${user.email}" target="_blank" style="color: #4F4F59; text-decoration: none">${user.email}</a>.
            <br>Ne pas répondre à cet e-mail, car cette adresse est liée à une messagerie automatique.
            <br>© 2023 Limbr, SAS. Tous droits réservés.
          </p>
        </footer>
      </div>
    </body>
    </html>
    `,
  };

  const resultSupport = await sendMail(req, mailDataSupport);
  Logger.info({ functionName: functionName(1), resultSupport: resultSupport }, req);


  let mailDataClient: MailData = {
    from: `Limbr <${config.mailSender.user}>`, // sender address
    to: user.email, // list of receivers
    subject: `Contactez-nous : ${user.email}`,
    text: `Bonjour,

    Merci d’avoir contacté l’équipe Limbr !
    Nous avons bien pris en compte votre demande et allons la traiter dans les meilleurs délais.
    En attendant, vous pouvez consulter notre page FAQ qui vous apportera peut-être de premiers éléments de réponse.

    A très vite sur Limbr
    `,
    html: `
    <html>
    <head>
    </head>
    <body style="margin: 0; padding: 20px; font-family: Verdana, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 20px; box-shadow: 0px 0px 10px 7px #e0e0e0;">
        <header style="margin-bottom: 40px; text-align: center; margin-top: 20px;">
          <img style="width: 150px; display: block; margin: auto;" src="https://www.limbr.fr/Logo/Turquoisebg_off.png" alt="Limbr Logo" />
        </header>
        <section style="color: #040311; font-size: 14px; line-height: 1.5;">
          <div>Bonjour,</div>
          <br>
          <div>Nous vous remercions d'avoir pris contact avec notre équipe.</div>
          <div>Votre demande a été enregistrée avec attention et sera traitée dans les plus brefs délais.</div>
          <br>
          <div>Dans l'intervalle, nous vous invitons à consulter notre <strong><a href="https://limbr.fr/faq" style="color: #24C6C0; text-decoration: none">page FAQ</a></strong>, qui pourrait vous fournir des informations utiles et des éléments de réponse à certaines de vos interrogations.</div>
          <br>
          <div>L'équipe Limbr</div>
        </section>
        <footer style="color: #4F4F59; text-align: start; font-size: 10px; font-style: italic; margin-top: 40px;">
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
            Vous pouvez supprimer votre compte Limbr à tout moment depuis les paramètres de votre espace personnel.
            <br>Consultez les <a href="https://limbr.fr/cgu" style="color: #4F4F59">conditions d'utilisation</a> pour obtenir plus d'informations sur notre produit.
            <br>Consultez notre <a href="https://limbr.fr/privacy" style="color: #4F4F59">politique de confidentialité</a>.
          </p>
          <p>
            Cet e-mail a été envoyé à <a href="mailto:${user.email}" target="_blank" style="color: #4F4F59; text-decoration: none">${user.email}</a>.
            <br>Ne pas répondre à cet e-mail, car cette adresse est liée à une messagerie automatique.
            <br>© 2023 Limbr, SAS. Tous droits réservés.
          </p>
        </footer>
      </div>
    </body>
    </html>
    `,
  };

  const resultClient = await sendMail(req, mailDataClient);
  Logger.info({ functionName: functionName(2), resultClient: resultClient }, req);

  return [resultSupport, resultClient];
};

export default {
  sendCodeMail,
  sendForgotPasswordMail,
  sendResetPasswordMail,
  sendContactUsMail,
};
