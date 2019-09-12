import { ClientError, DbError } from '../errors';
import { config } from '../config';

export class UserController {
  constructor() { }

  static isEmailUnique(email, provider) {
    const { UserModel } = config.get;
    return new Promise((resolve, reject) => {
      UserModel.find({ email, provider })
          .then((result) => {
            if (!result.length) {
              resolve();
            } else {
              reject(new ClientError({ message: 'Цей email вже використовується', status: 422, code: 'uniqueConflict' }));
            }
          })
          .catch((err) => reject(new DbError()));
    });
  }

  create() {
    return (req, res, next) => {
      const user = Object.assign({}, req.body);
      user.provider = 'local';
      this.constructor.isEmailUnique(user.email, user.provider)
          .then(() => next())
          .catch((err) => next(err));
      // uHelper.isEmailUnique(user.email, user.provider)
      //     .then(() => userHelper.isLoginUnique(user.login))
      //     .then(() => bcrypt.hash(req.body.password, 10))
      //     .then((hash) => {
      //       user.password = hash;
      //       user.role = 'guest';
      //       user.createdAt = Date.now();
      //       user.commentsReadedTill = Date.now();
      //       const userModel = new UserModel(user);
      //       // create new user
      //       return userModel.save();
      //     })
      // // next to login created user
      //     .then(() => next())
      // // .catch((err) => next(new ClientError({ message: 'Помилка унікальності', status: 422, code: 'uniqueConflict' })));
      //     .catch((err) => next(err));
    };
  };
}

// UserController.UserModel = config.get.UserModel;

