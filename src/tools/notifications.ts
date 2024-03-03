// Imports
import { Request } from 'express';
import fetch from 'node-fetch';
import dayjs from 'dayjs';

// Config
import config from '../configs/config';

// Tools
import Logger from '../tools/logger';

const notificationTeams = async (data: any, req?: Request) => {
  await fetch(config.notifications.webhookTeams, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    body: JSON.stringify({
      type: 'message',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          contentUrl: null,
          content: {
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            type: 'AdaptiveCard',
            version: '1.2',
            body: [
              {
                type: 'TextBlock',
                wrap: true,
                weight: 'bolder',
                text: 'Environnement :',
              },
              {
                type: 'TextBlock',
                wrap: true,
                text: config.env,
              },
              {
                type: 'TextBlock',
                wrap: true,
                weight: 'bolder',
                text: 'Service :',
              },
              {
                type: 'TextBlock',
                wrap: true,
                text: config.serverName,
              },
              {
                type: 'TextBlock',
                wrap: true,
                weight: 'bolder',
                text: 'Execution ID :',
              },
              {
                type: 'TextBlock',
                wrap: true,
                text: req?.headers?.executionId,
              },
              {
                type: 'TextBlock',
                wrap: true,
                weight: 'bolder',
                text: 'Message :',
              },
              {
                type: 'TextBlock',
                wrap: true,
                text: data.message,
              },
              {
                type: 'TextBlock',
                wrap: true,
                weight: 'bolder',
                text: 'Data :',
              },
              {
                type: 'TextBlock',
                wrap: true,
                text:
                  typeof data.data === 'string'
                    ? data.data
                    : JSON.stringify(data.data),
              },
            ],
          },
        },
      ],
    }),
  });
};

const notificationDiscord = async (data: any, req?: Request) => {
  const dataJson =
    typeof data.data === 'string' ? JSON.parse(data.data) : data.data;

  const codeError = dataJson.code
    ? dataJson.code >= 500 && dataJson.code < 600
    : dataJson.toString() !== '[object Object]';

  // Tuto : https://gist.github.com/Birdie0/78ee79402a4301b1faf412ab5f1cdcf9
  await fetch(
    codeError
      ? config.notifications.webhookDiscordAlert
      : config.notifications.webhookDiscordLog,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      body: JSON.stringify({
        content: `Bonjour${
          codeError ? ' <@&1211990689202569226>' : ''
        }, un service a eu une erreur :`,
        username: 'Alerte ' + config.env,
        avatar_url: config.notifications.logoUrl,
        embeds: [
          {
            title: 'Service : ' + config.serverName,
            timestamp: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
            fields: [
              {
                name: 'Environement',
                value: config.env,
              },
              {
                name: 'Execution ID',
                value: req?.headers?.executionId,
              },
              {
                name: 'Message',
                value: data.message,
              },
              {
                name: 'Data',
                value:
                  dataJson.toString() === '[object Object]'
                    ? JSON.stringify(dataJson)
                    : dataJson.toString(),
              },
            ],
          },
        ],
      }),
    }
  );
};

const sendNotification = async (data: any, req?: Request) => {
  const functionName = (i: number) =>
    'tools/notifications.ts : sendNotification ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  await Promise.all([
    notificationTeams(data, req),
    notificationDiscord(data, req),
  ]);
};

export default {
  sendNotification,
};
