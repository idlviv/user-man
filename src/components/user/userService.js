import { DbError } from '../../errors';
import { Config } from '../../config';
import { SharedService } from '../../shared';
import { injector } from '../../injector';

export class UserService {
  constructor() {
    this.sharedService = injector.get(SharedService);
    this.config = injector.get(Config);
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

// export const userService = new UserService;
