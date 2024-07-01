// Imports
import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import asyncHandler from 'express-async-handler';
import cors from 'cors';
import { exec } from 'child_process';

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
import tokenRoutes from './src/routes/token';
import userPlatformRoutes from './src/routes/userPlatform';
import supportRoutes from './src/routes/support';
import cardRoutes from './src/routes/card';
import notificationRoutes from './src/routes/notification';
import adminRoutes from './src/routes/admin';

// Tools
import Logger from './src/tools/logger';

// Service
import TestConnectionDBService from './src/services/testConnectionDB';

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
app.use('/token', tokenRoutes);
app.use('/userPlatform', userPlatformRoutes);
app.use('/support', supportRoutes);
app.use('/card', cardRoutes);
app.use('/notification', notificationRoutes);
app.use('/admin', adminRoutes);

// Check Service
app.get(
  '/',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'Get on /' }, req);
      exec('find /logs -name "*.log" -type f -mtime +10 -delete');
      const connectioDB = await TestConnectionDBService.textConnectionDB(req);
      if (connectioDB.valid) {
        res
          .status(200)
          .send({
            name: 'back-api',
            status: 'Server is UP !',
            db: 'Connected',
          });
      } else {
        res
          .status(503)
          .send({
            name: 'back-api',
            status: 'Server is UP !',
            db: 'Disconnected',
          });
      }
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
