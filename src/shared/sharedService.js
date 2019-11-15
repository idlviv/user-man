import * as jwt from 'jsonwebtoken';
import { Config } from '../config';
import { ServerError, DbError } from '../errors';
import { Libs } from '../libs';
import { injector } from '../injector';

export class SharedService {
  constructor() {
    this.jwt = jwt;
    this.config = injector.get(Config);
    this.libs = injector.get(Libs);
  }

  /**
   * Create JWT token
   *
   * @param {string} prefix - prefix for token
   * @param {object} sub - subject payload
   * @param {number} expire - seconds
   * @param {string} secret - secret key from environment variables
   * @return {string}
   */
  createJWT(prefix, sub, expire, secret) {
    const date = Math.floor(Date.now() / 1000); // in seconds
    return (
      prefix +
      this.jwt.sign(
          {
            sub,
            iat: date,
            exp: date + expire,
          },
          secret
      )
    );
  }

  /**
   * Wrapper for Mongo updateOne
   *
   * @param {*} filter
   * @param {*} update
   * @param {*} options
   * @return {Promise<object>}
   */
  updateDocument(filter, update, options) {
    const UserModel = this.config.get.mongoose.models.users;
    return new Promise(function(resolve, reject) {
      UserModel.updateOne(filter, update, options).then(
          (result) => {
            if (result.ok !== 1) {
              reject(new DbError());
            }
            resolve(result);
          },
          (err) => reject(new DbError())
      );
    });
  }

  /**
   * Send mail
   *
   * @param {Object} mailOptions
   * @return {Promise}
   */
  sendMail(mailOptions) {
    const transporter = this.libs.emailTransporter;
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          reject(
              new ServerError({
                message: 'Помилка відправки email',
              })
          );
        }
        resolve(info);
      });
    });
  }
}
