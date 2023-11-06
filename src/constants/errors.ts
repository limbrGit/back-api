const CErrors = {
  // 4XX
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
  wrongParameter: {
    code: 401.1,
    message: 'UNAUTHORIZED',
    detail: 'Wrong parameter',
  },
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
  notFound: {
    code: 404.1,
    message: 'NOT FOUND',
    detail: 'Ressource not found',
  },
  userNotFound: {
    code: 404.1,
    message: 'NOT FOUND',
    detail: 'user not found',
  },
  EmailAlreadyExist: {
    code: 409.1,
    message: 'CONFLICT',
    detail: 'Email already exist',
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
};

export default CErrors;
