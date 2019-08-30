import { ClientError } from '../errors';
export class Auth {
  constructor(permissions) {
    this.permissions = permissions;
  }

  authentication(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      return next(new ClientError({ message: 'notAuthenticated', status: 401 }));
    }
  }

  authorization(restrictedRole) {
    const that = this;
    return function(req, res, next) {
      const usersRole = req.user._doc.role;

      const permissions = that.permissions;

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

