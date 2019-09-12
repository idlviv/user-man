import { ClientError } from '../errors';
import { config } from '../config';

export class Auth {
  constructor() {
  }

  authentication() {
    return (req, res, next) => {
      if (req.isAuthenticated()) {
        return next();
      } else {
        return next(new ClientError({ message: 'notAuthenticated', status: 401 }));
      }
    };
  }

  authorization(restrictedRole) {
    return (req, res, next) => {
      const usersRole = req.user._doc.role;
      const { permissions } = config.get;
      if (usersRole in permissions) {
        if (permissions[usersRole].indexOf(restrictedRole) >= 0) {
          return next();
        } else {
          return next(new ClientError({ message: 'notAuthorized', status: 401 }));
        }
      } else {
        return next(new ClientError({ message: 'notAuthorized', status: 401 }));
      }
    };
  }
}

