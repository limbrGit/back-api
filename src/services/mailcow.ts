import { Request } from 'express';
import fetch from 'node-fetch';
import { ImapFlow } from 'imapflow';

import config from '../configs/config';

import { User } from '../interfaces/user';
import { MailResetPassword } from '../interfaces/mails';

import Logger from '../tools/logger';
import { wait } from '../tools/createStrings';

export const createMailBox = async (user: User, req: Request): Promise<any> => {
  // Set function name for logs
  const functionName = (i: number) => 'services/mailcow.ts : createMailBox ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Set left part of the email (before the '@')
  const leftPart: string = user.email.split('@')[0];

  // Set the body for the API call
  const body = {
    local_part: leftPart,
    domain: config.mailServer.domain,
    name: leftPart,
    quota: '5',
    // password: user.emailPassword,
    // password2: user.emailPassword,
    active: true,
    force_pw_update: false,
    tls_enforce_in: true,
    tls_enforce_out: true,
  };

  Logger.info(
    {
      functionName: functionName(1),
      configMailServer: config.mailServer,
      user,
      body,
    },
    req
  );

  // Create email in the mail server
  const response = await fetch(
    'https://' + config.mailServer.host + '/api/v1/add/mailbox',
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.mailServer.api,
      },
    }
  );

  // Get the result
  const data = await response.json();

  Logger.info(
    {
      functionName: functionName(2),
      data: data,
    },
    req
  );

  return data;
};

export const waitMails = async (
  mailTo: string,
  mailFrom: string,
  test: Function,
  find: Function,
  req: Request,
  tryMax: number = 30,
  tryWait: number = 3
): Promise<Array<MailResetPassword>> => {
  // Set function name for logs
  const functionName = (i: number) => 'services/mailcow.ts : waitMails ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  // Set Imap client
  let imapClient = new ImapFlow({
    host: config.mailServer.host,
    port: config.mailServer.imapPort,
    secure: true,
    auth: {
      user: config.mailServer.user,
      pass: config.mailServer.pass,
    },
  });

  // Wait until imap client connects and authorizes
  await imapClient.connect();
  Logger.info(
    { functionName: functionName(1), data: 'Connect with Imap to mailbox' },
    req
  );

  // Open the mailbox
  await imapClient.mailboxOpen('INBOX', { readOnly: true });
  Logger.info({ functionName: functionName(2), data: 'Open the mailbox' }, req);

  // Setup the tries for get the mail
  let msgs: Array<MailResetPassword> = [];
  let tries: number = 0;
  while (msgs.length === 0 && tries++ < tryMax) {
    Logger.info(
      {
        functionName: functionName(3),
        data: 'Start trying to get the mail',
        tries: `${tries}/${tryMax}`,
        tryWait,
      },
      req
    );
    await wait(tryWait);

    // Read every mails
    Logger.info(
      {
        functionName: functionName(4),
        data: 'Read mails',
        tries: `${tries}/${tryMax}`,
      },
      req
    );
    for await (let msg of imapClient.fetch('1:*', {
      // uid: true,
      envelope: true,
      source: true,
      internalDate: true,
    })) {
      // Check if a mail correspond
      if (
        msg.envelope.from[0].address?.toLowerCase() === mailFrom.toLowerCase() &&
        msg.envelope.to[0].address?.toLowerCase() === mailTo.toLowerCase() &&
        test(msg) && // To comment if you want to see the mail
        msg.internalDate.getTime() > Date.now() - tryWait * 10 * 1000
      ) {
        Logger.info(
          {
            functionName: functionName(5),
            data: 'Find a mail',
            // source: msg.source.toString().replaceAll('\r', '').replaceAll('\n', '').replaceAll(/\s/g, '') // To uncomment if you want to see the mail
          },
          req
        );

        // Add mail to msg list
        msgs.push({
          internalDate: msg.internalDate,
          envelope: msg.envelope,
          data: find(msg),
        });
      }
    }
  }

  // log out and close connection
  await imapClient.logout();
  Logger.info(
    { functionName: functionName(6), data: 'Logout from the mailbox' },
    req
  );

  return msgs;
};
