// Imports
import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import asyncHandler from 'express-async-handler';
import cors from 'cors';

// Config
import config from './src/configs/config';

// Constants
import CErrors from './src/constants/errors';

// Middlewares
import ErrorHandler from './src/middlewares/errorHandler';
import LoggerInit from './src/middlewares/loggerInit';

// Routes
import userRoutes from './src/routes/user';
import authenticationRoutes from './src/routes/authentication';
import listRoutes from './src/routes/list';
import watchRoutes from './src/routes/watch';
import paymentRoutes from './src/routes/payment';

// Tools
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
app.use('/list', listRoutes);
app.use('/watch', watchRoutes);
app.use('/payment', paymentRoutes);

// Check Service
app.get(
  '/',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'Get on /' }, req);
      res.status(200).send({ data: 'Server is UP !' });
    } catch (error) {
      next(error);
    }
  })
);

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
