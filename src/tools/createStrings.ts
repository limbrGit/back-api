import { User, QueryParams } from '../interfaces/tools';
import config from '../configs/config';

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

export const setUserInfo = (
  query: QueryParams,
): User => ({
  email:
    query.createMail === 'true'
      ? rdmString('', 10) + '@' + config.mailServer.domain
      : query.email!,
  password: rdmString('', 10, true, true, true, true),
});

export const wait = async (sec: number = 1): Promise<void> =>
  new Promise((r) => setTimeout(r, sec * 1000));
