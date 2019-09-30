const rp = require('request-promise-native');
import { ClientError } from '../errors';
import { config } from '../config';

export class SharedMiddleware {
  constructor() { }

  recaptcha() {
    return (req, res, next) => {
      const recaptcha = req.query.recaptcha;

      if (recaptcha === '' ||
        recaptcha === null ||
        recaptcha === undefined) {
        return next(new ClientError({ message: 'Помилка коду recaptcha', status: 403, code: 'recaptchaErr' }));
      }
      const { recaptchaSecret } = config.get;

      const recaptchaURL = `https://www.google.com/recaptcha/api/siteverify?secret=
          ${recaptchaSecret}&response=${recaptcha}&
          remoteip=${req.connection.remoteAddress}`;

      rp(recaptchaURL)
          .then((result) => {
            result = JSON.parse(result);
            if (result.success === true) {
              return next();
            } else {
              return next(new ClientError({ message: 'Помилка коду recaptcha', status: 403, code: 'recaptchaErr' }));
            }
          })
          .catch((err) =>
            next(new ClientError({
              message: 'Помилка коду recaptcha',
              status: 403,
              code: 'recaptchaErr',
            }))
          );
    };
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

  checkAuthorization() {
    return (req, res, next) => {
      let roleFromSession;
      if (req.isAuthenticated()) {
        roleFromSession = req.user._doc.role || 'casual';
      } else {
        roleFromSession = 'casual';
      }
      const requiredRoleForAuthorization = req.query.role;

      const { permissions } = config.get;
      if (permissions[roleFromSession].indexOf(requiredRoleForAuthorization) >= 0) {
        return res.status(200).json(true);
      } else {
        return res.status(200).json(false);
      }
    };
  }

  setCSRFCookie() {
    return (req, res, next) => {
      const { cookieCsrfOptions } = config.get;
      res.cookie(
          'XSRF-TOKEN',
          req.csrfToken(),
          cookieCsrfOptions
      );
      next();
    };
  }
}
