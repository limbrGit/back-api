// Imports
import { Request } from 'express';
import fetch from 'node-fetch';

// Config
import config from '../configs/config';

// Interface
import { UserSQL, User } from '../interfaces/user';
import { PaymentOfferSQL } from '../interfaces/paymentOffer';
import { PaymentTransactionSQL } from '../interfaces/paymentTransaction';
import {
  VivaAccessToken,
  VivaPaymentOrder,
  VivaPaymentOrderCreation,
} from '../interfaces/vivawallet';
import {
  PaymentPromoCodeSQL,
  PaymentOffersValues,
} from '../interfaces/paymentPromoCode';

// Tools
import Logger from '../tools/logger';

const getAccessToken = async (req: Request): Promise<VivaAccessToken> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'services/vivawallet.ts : getAccessToken ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const details = {
    grant_type: 'client_credentials',
  };

  // Set the body for the API call
  let formBody = [];
  for (const property in details) {
    const encodedKey = encodeURIComponent(property);
    const encodedValue = encodeURIComponent(details[property]);
    formBody.push(encodedKey + '=' + encodedValue);
  }
  const body = formBody.join('&');

  Logger.info({ functionName: functionName(1), body }, req);

  // Get bearer token
  const response = await fetch(
    'https://' + config.vivawallet.accountUrl + '/connect/token',
    {
      method: 'POST',
      body: body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + config.vivawallet.loginBasicAuth,
      },
    }
  );

  // Get the result
  const data: VivaAccessToken = await response.json();

  Logger.info({ functionName: functionName(2), data: data }, req);

  return data;
};

export const createPaymentOrder = async (
  req: Request,
  user: UserSQL | User,
  offer: PaymentOfferSQL,
  transaction: PaymentTransactionSQL,
  promoCode: PaymentPromoCodeSQL | null
): Promise<VivaPaymentOrderCreation> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'services/vivawallet.ts : createPaymentOrder ' + i;
  Logger.info({ functionName: functionName(0) }, req);

  const accessToken = await getAccessToken(req);

  // Set the body for the API call
  const body = {
    amount:
      (offer.pricing -
        (promoCode && Object.keys(promoCode.discount).includes(offer.name)
          ? (promoCode.discount as PaymentOffersValues)[offer.name]
          : 0)) *
      100,
    customerTrns: `Limbr ${offer.tokens} crédits${
      promoCode && Object.keys(promoCode.tokens).includes(offer.name)
        ? ' + ' +
          (promoCode.tokens as PaymentOffersValues)[offer.name] +
          ' offerts avec le code : ' +
          promoCode.name
        : ''
    }`,
    customer: {
      email: user.email,
      fullName: [user.firstname, user.lastname].join(' '),
      // phone: '0123456789',
      countryCode: '33',
      requestLang: 'fr',
    },
    paymentTimeout: 600,
    preauth: false,
    allowRecurring: false,
    maxInstallments: 0,
    forceMaxInstallments: false,
    paymentNotification: false, // Notification par email
    tipAmount: 0,
    disableExactAmount: false,
    disableCash: false,
    disableWallet: false,
    sourceCode: config.vivawallet.siteCode,
    merchantTrns: transaction.id,
    tags: [
      'limbr',
      'pack ' + offer.name,
      promoCode &&
      (Object.keys(promoCode.discount).includes(offer.name) ||
        Object.keys(promoCode.tokens).includes(offer.name))
        ? 'code ' + promoCode.name
        : undefined,
    ],
    isCardVerification: false,
  };

  Logger.info({ functionName: functionName(1), body }, req);

  // Create payment order in vivawallet
  const response = await fetch(
    'https://' + config.vivawallet.paymentUrl + '/checkout/v2/orders',
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken.access_token,
      },
    }
  );

  // Get the result
  const data: VivaPaymentOrderCreation = await response.json();

  Logger.info({ functionName: functionName(2), data: data }, req);

  return data;
};

export const getPaymentOrderFromOrderCode = async (
  req: Request,
  transaction: PaymentTransactionSQL
): Promise<VivaPaymentOrder | null> => {
  // Set function name for logs
  const functionName = (i: number) =>
    'services/vivawallet.ts : getPaymentOrderFromOrderCode ' + i;
  Logger.info(
    {
      functionName: functionName(0),
      vivawallet_order_code: transaction.vivawallet_order_code,
    },
    req
  );

  // Create email in the mail server
  const response = await fetch(
    `https://${config.vivawallet.orderUrl}/api/orders/${transaction.vivawallet_order_code}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + config.vivawallet.orderBasicAuth,
      },
    }
  );

  Logger.info({ functionName: functionName(1), ok: response.ok }, req);

  if (!response.ok) {
    return null;
  }

  // Get the result
  const data: VivaPaymentOrder = await response.json();

  Logger.info({ functionName: functionName(2), data: data }, req);

  return data;
};

export default {
  createPaymentOrder,
  getPaymentOrderFromOrderCode,
};
