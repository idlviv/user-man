const bcrypt = require('bcryptjs');
const Formidable = require('formidable');

import { ClientError, ServerError } from '../errors';
import { config } from '../config';
import { sharedService } from '../shared';
import { userService } from './userService';

export class UserController {
  constructor() {
    this.userService = userService;
    this.sharedService = sharedService;
  }

  /*
    user create
    invokes 'next()' to login created user
   */
  create() {
    const { UserModel } = config.get;
    return (req, res, next) => {
      const user = Object.assign({}, req.body);
      user.provider = 'local';
      this.userService.isEmailUnique(user.email, user.provider)
          .then(() => this.userService.isLoginUnique(user.login))
          .then(() => bcrypt.hash(req.body.password, 10))
          .then((hash) => {
            user.password = hash;
            user.role = 'guest';
            user.createdAt = Date.now();
            user.commentsReadedTill = Date.now();
            const userModel = new UserModel(user);
            // create new user
            return userModel.save();
          })
          // next to login created user
          .then(() => next())
          .catch((err) => next(err));
    };
  };

  /*
    user login
   */
  login() {
    return (req, res, next) => {
      if (req.isAuthenticated()) {
        return res.status(200).json('logged in');
      } else {
        return next(new ClientError({ message: 'Помилка авторизації', status: 401 }));
      }
    };
  }

  logout() {
    return (req, res, next) => {
      req.logout();
      next();
    };
  }

  logoutResponse() {
    return (req, res, next) => {
      return res.status(200).json('Logged out');
    };
  }

  profile() {
    return (req, res, next) => {
      const user = {
        login: req.user._doc.login,
        avatar: req.user._doc.avatar,
        ban: req.user._doc.ban,
        name: req.user._doc.name,
        surname: req.user._doc.surname,
        role: req.user._doc.role,
        email: req.user._doc.email,
      };
      return res.status(200).json(user);
    };
  }

  /*
    set cookie to frontend with users credential
  */
  setFrontendAuthCookie() {
    const { JWTSecret, cookieName } = config.get;
    return (req, res, next) => {
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

  userEdit() {
    return (req, res, next) => {
      const user = {};
      const modificationRequest = {};

      Object.assign(user, req.user._doc);
      Object.assign(modificationRequest, req.body);

      this.sharedService.isPasswordMatched(modificationRequest.password, user.password, user)
          .then((user) => {
            if (modificationRequest.name === 'password') {
              return bcrypt.hash(modificationRequest.value, 10)
                  .then((hash) => this.sharedService.updateDocument(
                      { _id: user._id },
                      {
                        $set: {
                          password: hash,
                          code: null,
                        },
                      }
                  ));
            } else {
              return this.sharedService.updateDocument(
                  { _id: user._id },
                  {
                    $set: {
                      [modificationRequest.name]: modificationRequest.value,
                    },
                  }
              );
            }
          })
          .then(() => res.status(200).json('Зміни внесено'))
          .catch((err) => next(err));
    };
  }

  /** Edit user fields without password confirmation
 *
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {*}
 */
  userEditUnsecure() {
    return (req, res, next) => {
      const user = {};
      const modificationRequest = {};

      Object.assign(user, req.user._doc);
      Object.assign(modificationRequest, req.body);
      const date = Date.now();

      if (modificationRequest.name === 'commentsReadedTill') {
        this.sharedService.updateDocument(
            { _id: user._id },
            {
              $set: {
                [modificationRequest.name]: date,
              },
            })
            .then((result) => res.status(200).json('Зміни внесено'))
            .catch((err) => next(err));
      } else {
        return next(new ClientError({ message: 'Помилка авторизації', status: 401 }));
      }
    };
  }

  editAvatar(cloudinary) {
    const { ObjectId } = config.get;
    return (req, res, next) => {
      const form = new Formidable.IncomingForm({ maxFileSize: 8400000 });
      const that = this;
      form.parse(req, function(err, fields, files) {
        if (err) {
          return next(new ServerError({ message: 'Помилка завантаження аватара - form parse', status: 400 }));
        }

        const user = {};
        Object.assign(user, req.user._doc);
        cloudinary.v2.uploader.upload(
            files.file.path,
            {
              public_id: 'avatar_' + user._id, // jscs:ignore requireCamelCaseOrUpperCaseIdentifiers
              eager: [
                { width: 180, height: 180, crop: 'fill', fetch_format: 'auto' },
                { width: 50, height: 50, crop: 'fill', fetch_format: 'auto' },
              ],
            },
            (err, result) => {
              if (err) {
                return next(
                    new ServerError({ message: 'Помилка завантаження аватара - cloudinary', status: err.http_code })
                );
              }
              that.sharedService.updateDocument(
                  { _id: new ObjectId(user._id) },
                  {
                    $set: {
                      avatar: result.public_id,
                    },
                  }
              )
                  .then(
                      (result) => {
                        console.log('result change avatar', result);
                        return res.status(200).json('Зміни внесено');
                      },
                      (err) => next(err)
                  );
            });
      });
    };
  }
}
