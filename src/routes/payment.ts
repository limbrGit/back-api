// Imports
import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

// Tools
import Notifications from '../tools/notifications';
import Logger from '../tools/logger';

// Middlewares
import authenticateToken from '../middlewares/authentication';

// Controllers
import PaymentController from '../controllers/payment';

const paymentApis = express.Router();

// Check promo code
paymentApis.get(
  '/promoCode/:code',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'GET on /payment/promoCode/:code';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await PaymentController.checkPromoCode(req);
      res.json(result);
    } catch (error: any) {
      next({ ...error, message: error.message, routeName: functionName });
    }
  })
);

// Check payment
paymentApis.get(
  '/check/all',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'GET on /payment/check/all';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await PaymentController.checkAllPayments(req);
      res.json(result);
    } catch (error: any) {
      next({ ...error, message: error.message, routeName: functionName });
    }
  })
);

// Check payment
paymentApis.get(
  '/check/:vivawalletOfferCode',
  // authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'GET on /payment/check/:vivawalletOfferCode';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await PaymentController.checkPayment(req);
      res.json(result);
    } catch (error: any) {
      next({ ...error, message: error.message, routeName: functionName });
    }
  })
);

// Start a payment
paymentApis.post(
  '/:paymentOfferName',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const functionName = 'GET on /payment/:paymentOfferName';
    try {
      Logger.info({ functionName: functionName }, req);
      const result = await PaymentController.startPayment(req);
      res.json(result);
    } catch (error: any) {
      next({ ...error, message: error.message, routeName: functionName });
    }
  })
);

export default paymentApis;
