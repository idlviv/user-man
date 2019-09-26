const bcrypt = require('bcryptjs');
const Formidable = require('formidable');

import { ClientError, ServerError } from '../errors';
import { config } from '../config';
import { sharedService } from '../shared';
import { userService } from './userService';
import { libs } from '../libs';

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

      this.userService.isPasswordMatched(modificationRequest.password, user.password, user)
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

  editAvatar() {
    const { ObjectId } = config.get;
    const cloudinary = libs.cloudinary;
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
                        return res.status(200).json('Зміни внесено');
                      },
                      (err) => next(err)
                  );
            });
      });
    };
  }

  emailVerificationSend() {
    return (req, res, next) => {
      const user = Object.assign({}, req.user._doc);
      const sub = {
        _id: user._id,
        email: user.email,
      };

      const expire = 60 * 60;
      const secret = config.get.JWTEmail;
      const token = this.sharedService.createJWT('', sub, expire, secret);

      const url = req.protocol + '://' + req.get('host') +
        '/api/user/email-verification?token=' + token;

      const mailOptions = config.mailOptionsEmailVerification;
      mailOptions.email = user.email;
      mailOptions.text = mailOptions.text + url;
      mailOptions.html = mailOptions.html + url;
      mailOptions.to = email;

      this.sharedService.sendMail(mailOptions)
          .then(() => res.status(200).json('На Вашу пошту відправлено листа'))
          .catch((err) => next(err));
    };
  };

  emailVerificationReceive() {
    const { UserModel } = config.get;

    return (req, res, next) => {
      const user = Object.assign({}, req.user._doc);

      UserModel.findOne({ _id: user._id })
          .then((result) => {
            if (!result._id) {
              res.redirect(req.protocol + '://' + req.get('host'));
            } else if (result.email !== user.email) {
              res.redirect(req.protocol + '://' + req.get('host'));
            } else {
              UserModel.updateOne({ _id: user._id },
                  { $set: { 'role': 'user' } })
                  .then(
                      (result) => {
                        if (result.ok !== 1) {
                          res.redirect(req.protocol + '://' + req.get('host'));
                        }
                        return next();
                        // update token with changes (local login)
                        // const sub = {
                        //   _id: req.user._doc._id,
                        //   login: req.user._doc.login,
                        //   name: req.user._doc.name,
                        //   surname: req.user._doc.surname,
                        //   avatar: req.user._doc.avatar,
                        //   provider: req.user._doc.provider,
                        //   role: 'user',
                        // };
                        // const token = sharedHelper.createJWT('', sub, 60, 'JWT_SECRET');
                        // res.redirect(req.protocol + '://' + req.get('host') + '/user/redirection-with-token/' + token);
                      },
                      (err) => {
                        res.redirect(req.protocol + '://' + req.get('host'));
                      }
                  );
            }
          }
          );
    };
  };


  /*
    First step to reset password
    Send reset code on email and write its hash in db
   */
  passwordResetCheckEmail() {
    return (req, res, next) => {
      let user;
      let code;
      this.userService.isEmailExists(email, 'local')
          .then((userFromDb) => {
            code = Math.floor(Math.random() * (100000)) + '';
            user = userFromDb;
            return bcrypt.hash(code, 10);
          })
          .then((hash) => this.sharedService.updateDocument({ _id: user._doc._id }, { $set: { code: hash, codeTries: 1 } }))
          .then((result) => {
            const mailOptions = config.mailOptionsEmailVerification;
            mailOptions.to = req.query.email;
            mailOptions.text = mailOptions.text + code;
            mailOptions.html = mailOptions.html + code;
            return this.sharedService.sendMail(mailOptions);
          })
          .then((info) => {
            const sub = { _id: user._id };
            // token to identify user
            const codeToken = this.sharedService.createJWT('JWT ', sub, 300, config.get.JWTSecretCode);
            return res.status(200).json(codeToken);
          })
          .catch((err) => next(err));
    };
  }

  /*
    Second step to reset password
    Compare code from email with one in db
  */
  passwordResetCheckCode() {
    const { UserModel } = config.get;
    return (req, res, next) => {
      const code = req.query.code;
      let user;
      UserModel.findOne({ _id: req.user._doc._id })
          .then((userFromDb) => {
            user = userFromDb;
            if (!userFromDb) {
              throw new ClientError({ status: 401, code: 'noSuchuser' });
            }
            if (userFromDb.isCodeLocked) {
              throw new ClientError({ message: 'Кількість спроб вичерпано', status: 403, code: 'maxTries' });
            }
            // if code doesn't match then throw error with code 'wrongCredentials' here
            return this.userService.isPasswordMatched(code, userFromDb._doc.code, userFromDb);
          })
          .then((userFromDb) => {
            const sub = { _id: userFromDb._doc._id };
            // token to identify user
            const changePasswordToken = this.sharedService.createJWT('JWT ', sub, 300, config.get.JWTSecretChangePassword);
            return res.status(200).json(changePasswordToken);
          })
          .catch((err) => {
            if (err.code === 'wrongCredentials') {
              this.userService.updatePasswordResetOptions(user)
                  .then(() => next(err));
            } else {
              next(err);
            }
          });
    };
  }

  /*
    Third step to reset password
    Middleware which invokes 'next()' to login this user
  */
  passwordReset() {
    return (req, res, next) => {
      const user = {};
      Object.assign(user, req.user._doc);
      const password = req.query.password;
      bcrypt.hash(password, 10)
          .then((hash) => this.sharedService.updateDocument(
              { _id: user._id },
              {
                $set: {
                  password: hash,
                  code: null,
                },
              }
          ))
          .then((result) => {
            req.body.login = user.login;
            next();
          })
          .catch((err) => next(err));
    };
  }
}
