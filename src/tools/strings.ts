// Imports
import crypto from 'crypto';

// Interfaces
import { HashPassword } from '../interfaces/user';

export const rdmString = (
  result: string = '',
  length: number = 10,
  majSelect: Boolean = true,
  minSelect: Boolean = true,
  numSelect: Boolean = true,
  speSelect: Boolean = false
): string => {
  const maj = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const min = 'abcdefghijklmnopqrstuvwxyz';
  const num = '0123456789';
  const spe = '!@#$%^&*';
  let characters: string = '';

  if (majSelect) {
    characters += maj;
    result += maj.charAt(Math.floor(Math.random() * maj.length));
  }
  if (minSelect) {
    characters += min;
    result += min.charAt(Math.floor(Math.random() * min.length));
  }
  if (numSelect) {
    characters += num;
    result += num.charAt(Math.floor(Math.random() * num.length));
  }
  if (speSelect) {
    characters += spe;
    result += spe.charAt(Math.floor(Math.random() * spe.length));
  }
  for (let i: number = 0; result.length < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};

export const checkPassword = (password: string): boolean => {
  const regularExpression =
    /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,20}$/;
  return regularExpression.test(password);
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
