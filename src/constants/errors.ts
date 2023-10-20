const CErrors = {
  // 4XX
  missingParameter: {
    code: 400.1,
    message: 'MISSING PARAMETER ERROR',
    detail: 'Missing a parameter',
  },
  wrongParameter: {
    code: 401.1,
    message: 'WRONG PARAMETER ERROR',
    detail: 'Wrong a parameter',
  },
  forbidden: {
    code: 403.1,
    message: 'FORBIDDEN ERROR',
    detail: 'Forbidden',
  },
  notFound: {
    code: 404.1,
    message: 'NOT FOUND ERROR',
    detail: 'Ressource not found',
  },
  EmailAlreadyExist: {
    code: 409.1,
    message: 'EMAIL ALREADY EXIST',
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
