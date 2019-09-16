const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
import { config } from '../config';

export class SharedService {
  constructor() { }

  /**
   * Create JWT token
   *
   * @param {string} prefix - prefix for token
   * @param {object} sub - subject payload
   * @param {number} expire - seconds
   * @param {string} secret - secret key from environment variables
   * @return {string}
   * @memberof CryptHelper
   */
  createJWT(prefix, sub, expire, secret) {
    const date = Math.floor(Date.now() / 1000); // in seconds
    return prefix + jwt.sign(
        {
          sub,
          iat: date,
          exp: date + expire,
        },
        secret
    );
  };

  /**
 * Wrapper for Mongo updateOne
 *
 * @param {*} filter
 * @param {*} update
 * @param {*} options
 * @return {Promise<object>}
 */
  updateDocument(filter, update, options) {
    const { UserModel } = config.get;
    return new Promise(function(resolve, reject) {
      UserModel.updateOne(filter, update, options)
          .then(
              (result) => {
                if (result.ok !== 1) {
                  reject(new DbError());
                }
                resolve(result);
              },
              (err) => reject(new DbError())
          );
    });
  };

  /**
 * compare password from request (candidate)
 * with password from db
 *
 * @param {string} passwordCandidate
 * @param {string} passwordFromDb
 * @param {UserModel} userFromDb // added to pass user data on next step
 * @return {Promise<UserModel>}
 */
  isPasswordMatched(passwordCandidate, passwordFromDb, userFromDb) {
    console.log('');
    return new Promise((resolve, reject) => {
      bcrypt.compare(passwordCandidate, passwordFromDb)
          .then((passwordMatched) => {
            if (passwordMatched) {
              resolve(userFromDb);
            } else {
              reject(new ClientError({ message: 'Невірний пароль', status: 401, code: 'wrongCredentials' }));
            }
          })
          .catch((err) => reject(err));
    });
  }
}
