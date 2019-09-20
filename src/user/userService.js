import { ClientError, DbError } from '../errors';
import { config } from '../config';
const bcrypt = require('bcryptjs');
import { sharedService } from '../shared';

export class UserService {
  constructor() {
    this.sharedService = sharedService;
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
    const { UserModel } = config.get;
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
    const { UserModel } = config.get;
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
    const { UserModel } = config.get;
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
    const { UserModel } = config.get;
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

  /**
 * update user (password lock options) after wrong password input
 *
 * @param {UserModel} user
 * @return {Promise<object>}
 */
  updatePasswordResetOptions(user) {
    return new Promise((resolve, reject) => {
      this.sharedService.updateDocument(
          { _id: user._doc._id },
          { $inc: { 'codeTries': 1 } },
          { upsert: true }
      )
          .then((result) => resolve(result))
          .catch((err) => reject(new DbError()));
    });
  }

  /**
 * check locking after max tries to input wrong password
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

  /**
 * update user (password lock options) after wrong password input
 *
 * @param {UserModel} user
 * @return {Promise<object>}
 */
  updatePasswordLockOptions(user) {
    return new Promise((resolve, reject) => {
      const dateNow = Date.now(); // in seconds
      let query;

      if ((dateNow - user.passwordLockUntil) > 600000) {
        query = {
          $set: {
            passwordTries: 1,
            passwordLockUntil: dateNow,
          },
        };
      } else if (user.passwordTries >= user.passwordLockTries) {
        query = {
          $set: {
            passwordTries: 1,
            passwordLockUntil: dateNow + 600000,
          },
        };
      } else {
        query = {
          $inc: { passwordTries: 1 },
          $set: { passwordLockUntil: dateNow },
        };
      }
      this.sharedService.updateDocument({ _id: user._id }, query)
          .then((result) => resolve(result))
          .catch((err) => reject(new DbError()));
    });
  }
}

export const userService = new UserService();
