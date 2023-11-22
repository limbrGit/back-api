import { Request } from 'express';
import winston from 'winston';
import path from 'path';
import dayjs from 'dayjs';

import config from '../configs/config';

const createLogger = () => winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.errors({ stack: true }),
    winston.format.label({ label: path.basename(config.serverName) }),
    winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSS' })
    // Format the metadata object
    // winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] })
  ),
  transports: [
    new winston.transports.File({
      //path to log file
      filename: `/logs/${dayjs().format('YYYY-MM-DD')}_${
        config.serverName
      }_server.log`,
      format: winston.format.json(),
      // level: 'debug',
    }),
    new winston.transports.Console({
      // level: 'info',
      format: winston.format.json(),
    }),
  ],
});

const info = (data: any, req?: Request) => {
  if (config.logger) {
    createLogger().info({ ...data, executionId: req?.headers?.executionId });
  }
};

const warn = (data: any, req?: Request) => {
  createLogger().warn({ ...data, executionId: req?.headers?.executionId });
};

const error = (data: any, req?: Request) => {
  if (data instanceof Error) {
    // logger.log({ level: 'error', message: `${data.stack || data}` });
    createLogger().error({ data: data.stack, executionId: req?.headers?.executionId });
  } else {
    createLogger().error({ ...data, executionId: req?.headers?.executionId });
  }
};

export default {
  info,
  warn,
  error,
};
