import { Auth } from './auth';

// factory for auth middleware
export function auth(permissions) {
  return new Auth(permissions);
};
