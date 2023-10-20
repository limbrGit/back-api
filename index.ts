import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';

import config from './src/configs/config';
import CErrors from './src/constants/errors';
import ErrorHandler from './src/middlewares/errorHandler';
import LoggerInit from './src/middlewares/loggerInit';

import userRoutes from './src/routes/user';
import authenticationRoutes from './src/routes/authentication';

import Logger from './src/tools/logger';

// Start express application
const app: Express = express();

// Reduce fingerprinting
app.disable('x-powered-by');

// Use .env file
dotenv.config();

// Setup CORS
app.use(cors());

// Set body parser
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

// Init custom Logger
app.use(LoggerInit);

// Routes
app.use('/users', userRoutes);
app.use('/auth', authenticationRoutes);

app.get('/', (req: Request, res: Response) => {
  Logger.info({ functionName: 'Get on /' }, req);
  res.status(200).send({ data: 'Server is UP !' });
});
app.get('*', function (req, res) {
  res.status(404).send(CErrors.notFound);
});

// Error middelware
app.use(ErrorHandler);

// Start message
app.listen(config.port, async () => {
  Logger.info({
    server: `⚡️ Server is running at http://localhost:${config.port}`,
  });
});
