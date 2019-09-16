"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserController = void 0;

var _errors = require("../errors");

var _config = require("../config");

var _shared = require("../shared");

var _userService = require("./userService");

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
    value: function editAvatar(cloudinary) {
      var _this5 = this;

      var ObjectId = _config.config.get.ObjectId;
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
              console.log('result change avatar', result);
              return res.status(200).json('Зміни внесено');
            }, function (err) {
              return next(err);
            });
          });
        });
      };
    }
    /*
      First step to reset password
      Send reset code on email and write its hash in db
     */

  }, {
    key: "passwordResetCheckEmail",
    value: function passwordResetCheckEmail() {
      var _this6 = this;

      return function (req, res, next) {
        var email = req.query.email;
        var user;
        var code;

        _this6.userService.isEmailExists(email, 'local').then(function (userFromDb) {
          code = Math.floor(Math.random() * 100000) + '';
          user = userFromDb;
          return bcrypt.hash(code, 10);
        }).then(function (hash) {
          return _this6.sharedService.updateDocument({
            _id: user._doc._id
          }, {
            $set: {
              code: hash,
              codeTries: 1
            }
          });
        }).then(function (result) {
          var mailOptions = {
            from: 'HandMADE <postmaster@hmade.work>',
            to: email,
            subject: 'Зміна пароля, код підтвердження',
            text: 'Ваш код підтвердження: ' + code,
            html: '<b>Ваш код підтвердження: </b>' + code
          };
          return _this6.sharedService.sendMail(mailOptions);
        }).then(function (info) {
          var sub = {
            _id: user._id
          }; // token to identify user

          var codeToken = _this6.sharedService.createJWT('JWT ', sub, 300, _config.config.get.JWTSecretCode);

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
      var _this7 = this;

      var UserModel = _config.config.get.UserModel;
      return function (req, res, next) {
        var code = req.query.code;
        var user;
        console.log(' req.query.code', req.query.code);
        console.log(' req.user._doc._id', req.user._doc._id);
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


          return _this7.userService.isPasswordMatched(code, userFromDb._doc.code, userFromDb);
        }).then(function (userFromDb) {
          var sub = {
            _id: userFromDb._doc._id
          }; // token to identify user

          var changePasswordToken = _this7.sharedService.createJWT('JWT ', sub, 300, _config.config.get.JWTSecretChangePassword);

          return res.status(200).json(changePasswordToken);
        })["catch"](function (err) {
          if (err.code === 'wrongCredentials') {
            _this7.userService.updatePasswordResetOptions(user).then(function () {
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
      var _this8 = this;

      return function (req, res, next) {
        var user = {};
        Object.assign(user, req.user._doc);
        var password = req.query.password;
        bcrypt.hash(password, 10).then(function (hash) {
          return _this8.sharedService.updateDocument({
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