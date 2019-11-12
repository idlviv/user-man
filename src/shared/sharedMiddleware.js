// import * as rp from 'request-promise-native';
const rp = require('request-promise-native');
import { ClientError } from '../errors';
import { config } from '../config';
import { sharedService } from './';

export class SharedMiddleware {
  constructor() {
    this.rp = rp;
    this.sharedService = sharedService;
  }

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

  sendFeedbackMessage() {
    return (req, res, next) => {
      const mailOptions = config.get.mailOptionsQuestionFromSite;
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

      // let mailOptions = {
      //   from: 'HMade <questionfromsite@hmade.work>',
      //   to: 'info@hmade.work',
      //   subject: 'Питання з сайту',
      //   text: 'Питання ${feedback.message}. Контакти ${feedback.contacts}. Ім\'я ${feedback.name}',
      //   html: '<p><span style="font-weight: bold;">Питання: </span>' +
      //     feedback.message + '</p>' +
      //     '<p><span style="font-weight: bold">Контакти: </span>' +
      //     feedback.contacts + '</p>' +
      //     '<p><span style="font-weight: bold">Ім\'я: </span>' +
      //     feedback.name + '</p>',
      // };

      // transporter.sendMail(mailOptions, (err, info) => {
      //   if (err) {
      //     return next(new ApplicationError(err.message, err.status));
      //   }
      //   return res.status(200).json(new ResObj(true, 'Повідомлення надіслано'));
      // });
    };
  };
}
