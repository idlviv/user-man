import * as bcrypt from 'bcryptjs';
import { ClientError, DbError } from '../../errors';
import { Config } from '../../config';
import { injector } from '../../injector';

export class UserHelper {
  constructor() {
    this.config = injector.get(Config);
    this.bcrypt = bcrypt;
  }

  /**
   * check pair: email - provider uniqueness
   *
   * @static
   * @param {string} email
   * @param {string} provider
   * @return {Promise}
   * @memberof UserController
   */
  isEmailUnique(email, provider) {
    const UserModel = this.config.get.mongoose.models.users;
    return new Promise((resolve, reject) => {
      UserModel.find({ email, provider })
          .then((result) => {
            if (!result.length) {
              resolve();
            } else {
              reject(new ClientError({
                message: 'Цей email вже використовується',
                status: 422,
                code: 'uniqueConflict',
              }));
            }
          })
          .catch((err) => reject(new DbError()));
    });
  }

  /**
 * check login uniqueness
 *
 * @param {string} login
 * @return {Promise}
 * @memberof UserController
 */
  isLoginUnique(login) {
    const UserModel = this.config.get.mongoose.models.users;
    return new Promise((resolve, reject) => {
      UserModel.find({ login })
          .then((result) => {
            if (!result.length) {
              resolve();
            } else {
              reject(new ClientError({
                message: 'Цей логін вже використовується',
                status: 422,
                code: 'uniqueConflict',
              }));
            }
          })
          .catch((err) => reject(new DbError()));
    });
  }

  /**
* check pair: email-provider exists in db
*
* @param {string} email
* @param {string} provider
* @return {Promise<UserModel>}
*/
  isEmailExists(email, provider) {
    const UserModel = this.config.get.mongoose.models.users;
    return new Promise((resolve, reject) => {
      UserModel.findOne({ email, provider })
          .then((user) => {
            if (user) {
              resolve(user);
            } else {
              reject(new ClientError({ message: 'Email не знайдено', status: 403, code: 'wrongCredentials' }));
            }
          })
          .catch((err) => reject(new DbError()));
    });
  }

  /**
 * check login exists in db
 *
 * @param {string} login
 * @return {Promise<UserModel>}
 */
  isLoginExists(login) {
    const UserModel = this.config.get.mongoose.models.users;
    return new Promise((resolve, reject) => {
      UserModel.findOne({ login })
          .then((user) => {
            if (user) {
              resolve(user);
            } else {
              reject(new ClientError({ message: 'Користувача не знайдено', status: 401 }));
            }
          })
          .catch((err) => reject(new DbError()));
    });
  }

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
    return new Promise((resolve, reject) => {
      this.bcrypt.compare(passwordCandidate, passwordFromDb)
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

  /**
* check locking after max tries of input wrong password
*
* @param {UserModel} userFromDb
* @return {Promise<UserModel>}
*/
  isPasswordLocked(userFromDb) {
    return new Promise((resolve, reject) => {
      if (userFromDb.isPasswordLocked) {
        const estimatedTime = userFromDb.passwordLockUntil - Date.now();
        reject(new ClientError({
          message: `Вхід заблоковано, спробуйте через 
        ${Math.round(estimatedTime / 1000 / 60)} хвилин.`,
          status: 403,
        }));
      } else {
        resolve(userFromDb);
      }
    });
  }
}
