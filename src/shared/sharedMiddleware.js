import * as rp from 'request-promise-native';
// const rp = require('request-promise-native');
import { ClientError } from '../errors';
import { Config } from '../config';
import { SharedService } from './';
import { injector } from '../injector';
import { Passport } from '../libs/passport';

export class SharedMiddleware {
  constructor() {
    this.rp = rp;
    this.sharedService = injector.get(SharedService);
    this.config = injector.get(Config);
    this.passport = injector.get(Passport).get;
  }

  /**
   * all middlewates that should be inserted in express
   *
   * @return {Array} // array of middlewares
   * @memberof SharedMiddleware
   */
  userManInit() {
    return [
      this.passport.initialize(),
      this.passport.session(),
      // // set custom cookie for angular XSRF-TOKEN
      this.setCSRFCookie(),
      // // set frontend authentication cookie
      this.setFrontendAuthCookie(),
      // (req, res, next) => {
      //   console.log('init');
      //   next();
      // },
    ];
  }

  recaptcha() {
    return (req, res, next) => {
      const recaptcha = req.query.recaptcha;

      if (recaptcha === '' ||
        recaptcha === null ||
        recaptcha === undefined) {
        return next(new ClientError({ message: 'Помилка коду recaptcha', status: 403, code: 'recaptchaErr' }));
      }
      const { recaptchaSecret } = this.config.get;

      const recaptchaURL = `https://www.google.com/recaptcha/api/siteverify?secret=
          ${recaptchaSecret}&response=${recaptcha}&
          remoteip=${req.connection.remoteAddress}`;

      this.rp(recaptchaURL)
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

  /**
   * Pass next() if client is authenticated otherwise next(err)
   *
   * @return {Function} next
   */
  authentication() {
    return (req, res, next) => {
      if (req.isAuthenticated()) {
        return next();
      } else {
        return next(new ClientError({ message: 'notAuthenticated', status: 401 }));
      }
    };
  }

  /**
   * Pass next() if client is authorized
   * (his role allowed according to permissions)
   * otherwise next(err)
   *
   * @param {String} restrictedRole
   * @return {Function} next
   */
  authorization(restrictedRole) {
    return (req, res, next) => {
      const usersRole = req.user._doc.role;
      const { permissions } = this.config.get;
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

  /**
   * Used for frontend router guard (canActivate)
   *
   * @return {Boolean}
   */
  checkAuthorization() {
    return (req, res, next) => {
      let roleFromSession;
      if (req.isAuthenticated()) {
        roleFromSession = req.user._doc.role || 'casual';
      } else {
        roleFromSession = 'casual';
      }
      const requiredRoleForAuthorization = req.query.role;

      const { permissions } = this.config.get;
      if (permissions[roleFromSession].indexOf(requiredRoleForAuthorization) >= 0) {
        return res.status(200).json(true);
      } else {
        return res.status(200).json(false);
      }
    };
  }

  setCSRFCookie() {
    return (req, res, next) => {
      const { cookieCsrfOptions } = this.config.get;
      res.cookie(
          'XSRF-TOKEN',
          req.csrfToken(),
          cookieCsrfOptions
      );
      next();
    };
  }

  /*
   set cookie to frontend with users credential
 */
  setFrontendAuthCookie() {
    return (req, res, next) => {
      const { JWTSecret, cookieName } = this.config.get;

      let token;
      if (req.isAuthenticated()) {
        const user = {
          _id: req.user._doc._id,
          login: req.user._doc.login,
          name: req.user._doc.name,
          surname: req.user._doc.surname,
          avatar: req.user._doc.avatar,
          provider: req.user._doc.provider,
          role: req.user._doc.role,
          commentsReadedTill: req.user._doc.commentsReadedTill,
        };
        token = this.sharedService.createJWT('', user, null, JWTSecret);
      } else {
        token = this.sharedService.createJWT('', null, null, JWTSecret);
      }
      res.cookie(
          cookieName,
          token,
          {
          // 'secure': false,
            httpOnly: false,
            // maxAge: null,
            sameSite: 'Strict',
          }
      );
      next();
    };
  }

  sendFeedbackMessage() {
    return (req, res, next) => {
      const mailOptions = this.config.get.mailOptionsQuestionFromSite;
      const feedback = {};
      Object.assign(feedback, req.body);

      mailOptions.subject = req.isAuthenticated() ?
        mailOptions.subject + ' від користувача [login:] ' + req.user._doc.login :
        mailOptions.subject;
      mailOptions.text = mailOptions.text.call(feedback).content;
      mailOptions.html = mailOptions.html.call(feedback).content;

      this.sharedService.sendMail(mailOptions)
          .then(() => res.status(200).json('Повідомлення надіслано.'))
          .catch((err) => next(err));
    };
  };
}
