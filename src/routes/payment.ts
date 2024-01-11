// Imports
import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

// Tools
import Logger from '../tools/logger';

// Middlewares
import authenticateToken from '../middlewares/authentication';

// Controllers
import PaymentController from '../controllers/payment';

const paymentApis = express.Router();

// Start a payment
paymentApis.post(
  '/:paymentOfferName',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.info({ functionName: 'GET on /payment/:paymentOfferName' }, req);
      const result = await PaymentController.startPayment(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  })
);

export default paymentApis;
