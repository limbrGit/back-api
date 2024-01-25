const CErrors = {
  // 400
  missingParameter: {
    code: 400.1,
    message: 'BAD REQUEST',
    detail: 'Missing a parameter',
  },
  passwordNotStrong: {
    code: 400.2,
    message: 'BAD REQUEST',
    detail: 'Password Not Strong',
  },
  emailTooLong: {
    code: 400.3,
    message: 'BAD REQUEST',
    detail: 'Email too long',
  },
  emailNotValid: {
    code: 400.4,
    message: 'BAD REQUEST',
    detail: 'Email not valid',
  },
  usernameTooLong: {
    code: 400.5,
    message: 'BAD REQUEST',
    detail: 'Username too long',
  },
  firstnameTooLong: {
    code: 400.6,
    message: 'BAD REQUEST',
    detail: 'Firstname too long',
  },
  lastnameTooLong: {
    code: 400.7,
    message: 'BAD REQUEST',
    detail: 'Lastname too long',
  },
  wrongDateFormat: {
    code: 400.8,
    message: 'BAD REQUEST',
    detail: 'Wrong date format',
  },
  wrongGender: {
    code: 400.9,
    message: 'BAD REQUEST',
    detail: 'Wrong gender',
  },
  descriptionTooLong: {
    code: 400.10,
    message: 'BAD REQUEST',
    detail: 'Description too long',
  },
  pictureError: {
    code: 400.11,
    message: 'BAD REQUEST',
    detail: 'The picture selected is in error',
  },
  wrongTypeFormat: {
    code: 400.12,
    message: 'BAD REQUEST',
    detail: 'Wrong type format',
  },
  transactionOver: {
    code: 400.13,
    message: 'BAD REQUEST',
    detail: 'Transaction Over',
  },
  noCurrentToken: {
    code: 400.14,
    message: 'BAD REQUEST',
    detail: 'You have no current token',
  },
  currentTokenAlreadyUsed: {
    code: 400.14,
    message: 'BAD REQUEST',
    detail: 'You have current token available',
  },
  missingBearerToken: {
    code: 400.15,
    message: 'BAD REQUEST',
    detail: 'Missing bearer token',
  },

  // 401
  wrongParameter: {
    code: 401.1,
    message: 'UNAUTHORIZED',
    detail: 'Wrong parameter',
  },
  wrongPassword: {
    code: 401.2,
    message: 'UNAUTHORIZED',
    detail: 'Wrong password',
  },
  samePassword: {
    code: 401.3,
    message: 'UNAUTHORIZED',
    detail: 'Same password',
  },
  wrongBearerToken: {
    code: 401.4,
    message: 'UNAUTHORIZED',
    detail: 'Wrong bearer token',
  },

  // 403
  forbidden: {
    code: 403.1,
    message: 'FORBIDDEN',
    detail: 'Forbidden',
  },
  accountActivated: {
    code: 403.2,
    message: 'FORBIDDEN',
    detail: 'Account already activated',
  },
  tokenAlreadyUsed: {
    code: 403.3,
    message: 'FORBIDDEN',
    detail: 'Token already used',
  },
  tokenExpired: {
    code: 403.4,
    message: 'FORBIDDEN',
    detail: 'Token expired',
  },
  userDeleted: {
    code: 403.5,
    message: 'FORBIDDEN',
    detail: 'User deleted',
  },
  offerDeleted: {
    code: 403.6,
    message: 'FORBIDDEN',
    detail: 'Offer deleted',
  },
  userNotActive: {
    code: 403.7,
    message: 'FORBIDDEN',
    detail: 'User not active',
  },

  // 404
  notFound: {
    code: 404.1,
    message: 'NOT FOUND',
    detail: 'Ressource not found',
  },
  userNotFound: {
    code: 404.2,
    message: 'NOT FOUND',
    detail: 'User not found',
  },
  contentNotFound: {
    code: 404.3,
    message: 'NOT FOUND',
    detail: 'Content not found',
  },
  ContentNotInList: {
    code: 404.4,
    message: 'CONFLICT',
    detail: 'Content not in list',
  },
  offerNotFound: {
    code: 404.2,
    message: 'NOT FOUND',
    detail: 'Offer not found',
  },
  transactionNotFound: {
    code: 404.3,
    message: 'NOT FOUND',
    detail: 'Transaction not found',
  },
  EmailAlreadyExist: {
    code: 409.1,
    message: 'CONFLICT',
    detail: 'Email already exist',
  },
  UsernameAlreadyExist: {
    code: 409.2,
    message: 'CONFLICT',
    detail: 'Username already exist',
  },
  ContentAlreadyExistInList: {
    code: 409.3,
    message: 'CONFLICT',
    detail: 'Content already exist in list',
  },

  // 5XX
  processing: {
    code: 500.1,
    message: 'PROCESSING ERROR',
    detail: 'Error during a process',
  },
  canalHrefNotFound: {
    code: 500.2,
    message: 'PROCESSING ERROR',
    detail: 'Processing error for create canal account : Href not found',
  },
  vivawalletCreatePaymentOrder: {
    code: 500.3,
    message: 'PROCESSING ERROR',
    detail: 'Error to create payment order',
  },
  vivawalletGetPaymentOrder: {
    code: 500.4,
    message: 'PROCESSING ERROR',
    detail: 'Error to get payment order',
  },
  getUser: {
    code: 500.5,
    message: 'PROCESSING ERROR',
    detail: 'Error to get user',
  },
  noUserPlatform: {
    code: 500.6,
    message: 'PROCESSING ERROR',
    detail: 'Error to get user platform',
  },
};

export default CErrors;
