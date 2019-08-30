import { DBHelper } from './dbHelper';
import { CryptHelper } from './cryptHelper';
import { CookieHelper } from './cookieHelper';

export function cryptHelper() {
  return new CryptHelper();
};

export function cookieHelper() {
  return new CookieHelper();
};

export { DBHelper };
