// Imports
import { Request } from 'express';
import fetch from 'node-fetch';

// Config
import config from '../configs/config';

// Tools
import Logger from '../tools/logger';

const sendNotification = async (data: any, req?: Request) => {
  const functionName = (i: number) =>
    'tools/notifications.ts : sendNotification ' + i;
  Logger.info({ functionName: functionName(0) }, req);

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

export default {
  sendNotification,
};
