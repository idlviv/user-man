"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserController = void 0;

var _errors = require("../errors");

var _config = require("../config");

var _shared = require("../shared");

var _userService = require("./userService");

var _libs = require("../libs");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var bcrypt = require('bcryptjs');

var Formidable = require('formidable');

var UserController =
/*#__PURE__*/
function () {
  function UserController() {
    _classCallCheck(this, UserController);

    this.userService = _userService.userService;
    this.sharedService = _shared.sharedService;
  }
  /*
    user create
    invokes 'next()' to login created user
   */


  _createClass(UserController, [{
    key: "create",
    value: function create() {
      var _this = this;

      var UserModel = _config.config.get.UserModel;
      return function (req, res, next) {
        var user = Object.assign({}, req.body);
        user.provider = 'local';

        _this.userService.isEmailUnique(user.email, user.provider).then(function () {
          return _this.userService.isLoginUnique(user.login);
        }).then(function () {
          return bcrypt.hash(req.body.password, 10);
        }).then(function (hash) {
          user.password = hash;
          user.role = 'guest';
          user.createdAt = Date.now();
          user.commentsReadedTill = Date.now();
          var userModel = new UserModel(user); // create new user

          return userModel.save();
        }) // next to login created user
        .then(function () {
          return next();
        })["catch"](function (err) {
          return next(err);
        });
      };
    }
  }, {
    key: "login",

    /*
      user login
     */
    value: function login() {
      return function (req, res, next) {
        if (req.isAuthenticated()) {
          return res.status(200).json('logged in');
        } else {
          return next(new _errors.ClientError({
            message: 'Помилка авторизації',
            status: 401
          }));
        }
      };
    }
  }, {
    key: "logout",
    value: function logout() {
      return function (req, res, next) {
        req.logout();
        next();
      };
    }
  }, {
    key: "logoutResponse",
    value: function logoutResponse() {
      return function (req, res, next) {
        return res.status(200).json('Logged out');
      };
    }
  }, {
    key: "profile",
    value: function profile() {
      return function (req, res, next) {
        var user = {
          login: req.user._doc.login,
          avatar: req.user._doc.avatar,
          ban: req.user._doc.ban,
          name: req.user._doc.name,
          surname: req.user._doc.surname,
          role: req.user._doc.role,
          email: req.user._doc.email
        };
        return res.status(200).json(user);
      };
    }
    /*
      set cookie to frontend with users credential
    */

  }, {
    key: "setFrontendAuthCookie",
    value: function setFrontendAuthCookie() {
      var _this2 = this;

      var _config$get = _config.config.get,
          JWTSecret = _config$get.JWTSecret,
          cookieName = _config$get.cookieName;
      return function (req, res, next) {
        var token;

        if (req.isAuthenticated()) {
          var user = {
            _id: req.user._doc._id,
            login: req.user._doc.login,
            name: req.user._doc.name,
            surname: req.user._doc.surname,
            avatar: req.user._doc.avatar,
            provider: req.user._doc.provider,
            role: req.user._doc.role,
            commentsReadedTill: req.user._doc.commentsReadedTill
          };
          token = _this2.sharedService.createJWT('', user, null, JWTSecret);
        } else {
          token = _this2.sharedService.createJWT('', null, null, JWTSecret);
        }

        res.cookie(cookieName, token, {
          // 'secure': false,
          httpOnly: false,
          // maxAge: null,
          sameSite: 'Strict'
        });
        next();
      };
    }
  }, {
    key: "userEdit",
    value: function userEdit() {
      var _this3 = this;

      return function (req, res, next) {
        var user = {};
        var modificationRequest = {};
        Object.assign(user, req.user._doc);
        Object.assign(modificationRequest, req.body);

        _this3.userService.isPasswordMatched(modificationRequest.password, user.password, user).then(function (user) {
          if (modificationRequest.name === 'password') {
            return bcrypt.hash(modificationRequest.value, 10).then(function (hash) {
              return _this3.sharedService.updateDocument({
                _id: user._id
              }, {
                $set: {
                  password: hash,
                  code: null
                }
              });
            });
          } else {
            return _this3.sharedService.updateDocument({
              _id: user._id
            }, {
              $set: _defineProperty({}, modificationRequest.name, modificationRequest.value)
            });
          }
        }).then(function () {
          return res.status(200).json('Зміни внесено');
        })["catch"](function (err) {
          return next(err);
        });
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

  }, {
    key: "userEditUnsecure",
    value: function userEditUnsecure() {
      var _this4 = this;

      return function (req, res, next) {
        var user = {};
        var modificationRequest = {};
        Object.assign(user, req.user._doc);
        Object.assign(modificationRequest, req.body);
        var date = Date.now();

        if (modificationRequest.name === 'commentsReadedTill') {
          _this4.sharedService.updateDocument({
            _id: user._id
          }, {
            $set: _defineProperty({}, modificationRequest.name, date)
          }).then(function (result) {
            return res.status(200).json('Зміни внесено');
          })["catch"](function (err) {
            return next(err);
          });
        } else {
          return next(new _errors.ClientError({
            message: 'Помилка авторизації',
            status: 401
          }));
        }
      };
    }
  }, {
    key: "editAvatar",
    value: function editAvatar() {
      var _this5 = this;

      var ObjectId = _config.config.get.ObjectId;
      var cloudinary = _libs.libs.cloudinary;
      return function (req, res, next) {
        var form = new Formidable.IncomingForm({
          maxFileSize: 8400000
        });
        var that = _this5;
        form.parse(req, function (err, fields, files) {
          if (err) {
            return next(new _errors.ServerError({
              message: 'Помилка завантаження аватара - form parse',
              status: 400
            }));
          }

          var user = {};
          Object.assign(user, req.user._doc);
          cloudinary.v2.uploader.upload(files.file.path, {
            public_id: 'avatar_' + user._id,
            // jscs:ignore requireCamelCaseOrUpperCaseIdentifiers
            eager: [{
              width: 180,
              height: 180,
              crop: 'fill',
              fetch_format: 'auto'
            }, {
              width: 50,
              height: 50,
              crop: 'fill',
              fetch_format: 'auto'
            }]
          }, function (err, result) {
            if (err) {
              return next(new _errors.ServerError({
                message: 'Помилка завантаження аватара - cloudinary',
                status: err.http_code
              }));
            }

            that.sharedService.updateDocument({
              _id: new ObjectId(user._id)
            }, {
              $set: {
                avatar: result.public_id
              }
            }).then(function (result) {
              return res.status(200).json('Зміни внесено');
            }, function (err) {
              return next(err);
            });
          });
        });
      };
    }
  }, {
    key: "emailVerificationSend",
    value: function emailVerificationSend() {
      var _this6 = this;

      var mailOptions = _config.config.get.mailOptionsEmailVerification;
      return function (req, res, next) {
        var user = Object.assign({}, req.user._doc);
        var sub = {
          _id: user._id,
          email: user.email
        };
        var expire = 60 * 60;
        var secret = _config.config.get.JWTEmail;

        var token = _this6.sharedService.createJWT('', sub, expire, secret);

        var url = req.protocol + '://' + req.get('host') + '/api/user/email-verification?token=' + token;
        mailOptions.to = user.email;
        mailOptions.text = mailOptions.text + url;
        mailOptions.html = mailOptions.html + url;

        _this6.sharedService.sendMail(mailOptions).then(function () {
          return res.status(200).json('На Вашу пошту відправлено листа');
        })["catch"](function (err) {
          return next(err);
        });
      };
    }
  }, {
    key: "emailVerificationReceive",
    value: function emailVerificationReceive() {
      var UserModel = _config.config.get.UserModel;
      return function (req, res, next) {
        var user = Object.assign({}, req.user._doc);
        UserModel.findOne({
          _id: user._id
        }).then(function (result) {
          if (!result._id) {
            res.redirect(req.protocol + '://' + req.get('host'));
          } else if (result.email !== user.email) {
            res.redirect(req.protocol + '://' + req.get('host'));
          } else {
            UserModel.updateOne({
              _id: user._id
            }, {
              $set: {
                'role': 'user'
              }
            }).then(function (result) {
              if (result.ok !== 1) {
                res.redirect(req.protocol + '://' + req.get('host'));
              }

              return next(); // update token with changes (local login)
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
            }, function (err) {
              res.redirect(req.protocol + '://' + req.get('host'));
            });
          }
        });
      };
    }
  }, {
    key: "passwordResetCheckEmail",

    /*
      First step to reset password
      Send reset code on email and write its hash in db
     */
    value: function passwordResetCheckEmail() {
      var _this7 = this;

      var mailOptions = _config.config.get.mailOptionsResetPassword;
      return function (req, res, next) {
        var user;
        var code;
        var email = req.query.email;

        _this7.userService.isEmailExists(email, 'local').then(function (userFromDb) {
          code = Math.floor(Math.random() * 100000) + '';
          user = userFromDb;
          return bcrypt.hash(code, 10);
        }).then(function (hash) {
          return _this7.sharedService.updateDocument({
            _id: user._doc._id
          }, {
            $set: {
              code: hash,
              codeTries: 1
            }
          });
        }).then(function (result) {
          mailOptions.to = email;
          mailOptions.text = mailOptions.text + code;
          mailOptions.html = mailOptions.html + code;
          console.log('mailOptions', mailOptions);
          return _this7.sharedService.sendMail(mailOptions);
        }).then(function (info) {
          var sub = {
            _id: user._id
          }; // token to identify user

          var codeToken = _this7.sharedService.createJWT('JWT ', sub, 300, _config.config.get.JWTSecretCode);

          return res.status(200).json(codeToken);
        })["catch"](function (err) {
          return next(err);
        });
      };
    }
    /*
      Second step to reset password
      Compare code from email with one in db
    */

  }, {
    key: "passwordResetCheckCode",
    value: function passwordResetCheckCode() {
      var _this8 = this;

      var UserModel = _config.config.get.UserModel;
      return function (req, res, next) {
        var code = req.query.code;
        var user;
        UserModel.findOne({
          _id: req.user._doc._id
        }).then(function (userFromDb) {
          user = userFromDb;

          if (!userFromDb) {
            throw new _errors.ClientError({
              status: 401,
              code: 'noSuchuser'
            });
          }

          if (userFromDb.isCodeLocked) {
            throw new _errors.ClientError({
              message: 'Кількість спроб вичерпано',
              status: 403,
              code: 'maxTries'
            });
          } // if code doesn't match then throw error with code 'wrongCredentials' here


          return _this8.userService.isPasswordMatched(code, userFromDb._doc.code, userFromDb);
        }).then(function (userFromDb) {
          var sub = {
            _id: userFromDb._doc._id
          }; // token to identify user

          var changePasswordToken = _this8.sharedService.createJWT('JWT ', sub, 300, _config.config.get.JWTSecretChangePassword);

          return res.status(200).json(changePasswordToken);
        })["catch"](function (err) {
          if (err.code === 'wrongCredentials') {
            _this8.userService.updatePasswordResetOptions(user).then(function () {
              return next(err);
            });
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

  }, {
    key: "passwordReset",
    value: function passwordReset() {
      var _this9 = this;

      return function (req, res, next) {
        var user = {};
        Object.assign(user, req.user._doc);
        var password = req.query.password;
        bcrypt.hash(password, 10).then(function (hash) {
          return _this9.sharedService.updateDocument({
            _id: user._id
          }, {
            $set: {
              password: hash,
              code: null
            }
          });
        }).then(function (result) {
          req.body.login = user.login;
          next();
        })["catch"](function (err) {
          return next(err);
        });
      };
    }
  }]);

  return UserController;
}();

exports.UserController = UserController;