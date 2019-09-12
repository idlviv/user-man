const rp = require('request-promise-native');
import { ClientError } from '../errors';
import { config } from '../config';

export class Recaptcha {
  constructor() {
    // this.recaptchaSecret = recaptchaSecret;
  }

  mw() {
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
}
