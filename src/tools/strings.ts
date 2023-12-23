// Imports
import crypto from 'crypto';

// Interfaces
import { HashPassword } from '../interfaces/user';

export const rdmString = ({
  start = '',
  length = 10,
  majSelect = true,
  minSelect = true,
  numSelect = true,
  speSelect = false,
}): string => {
  const maj = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const min = 'abcdefghijklmnopqrstuvwxyz';
  const num = '0123456789';
  const spe = '!@#$%^&*';
  let characters: string = '';

  if (majSelect) {
    characters += maj;
    start += maj.charAt(Math.floor(Math.random() * maj.length));
  }
  if (minSelect) {
    characters += min;
    start += min.charAt(Math.floor(Math.random() * min.length));
  }
  if (numSelect) {
    characters += num;
    start += num.charAt(Math.floor(Math.random() * num.length));
  }
  if (speSelect) {
    characters += spe;
    start += spe.charAt(Math.floor(Math.random() * spe.length));
  }
  for (let i: number = 0; start.length < length; i++) {
    start += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return start;
};

export const checkPassword = (password: string): boolean => {
  const regularExpression =
    /^(?=.*([A-Z]){1,})(?=.*[!@#$&*]{1,})(?=.*[0-9]{1,})(?=.*[a-z]{1,}).{8,128}$/;
  return regularExpression.test(password);
};

export const checkEmail = (email: string): boolean => {
  const regularExpression = new RegExp(
    "([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])"
  );
  return regularExpression.test(email);
};

export const hashPassword = (password: string): HashPassword => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password!, salt, 1000, 64, 'sha512')
    .toString('hex');
  return { salt: salt, hash: hash };
};

// export const setUserInfo = (
//   query: QueryParams,
// ): User => ({
//   email:
//     query.createMail === 'true'
//       ? rdmString('', 10) + '@' + config.mailServer.domain
//       : query.email!,
//   password: rdmString('', 10, true, true, true, true),
// });

export const wait = async (sec: number = 1): Promise<void> =>
  new Promise((r) => setTimeout(r, sec * 1000));

export const flatObj = (obj = {}) =>
  Object.keys(obj || {}).reduce((acc, cur) => {
    if (typeof obj[cur] === 'object') {
      acc = { ...acc, ...flatObj(obj[cur]) };
    } else {
      acc[cur] = obj[cur];
    }
    return acc;
  }, {});
