import { ClientError, DbError } from '../errors';
import { config } from '../config';

export class UserService {
  constructor() { }

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
}

export const userService = new UserService();
