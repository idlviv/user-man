"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserController = void 0;

var bcrypt = _interopRequireWildcard(require("bcryptjs"));

var Formidable = _interopRequireWildcard(require("Formidable"));

var _errors = require("../../errors");

var _config = require("../../config");

var _userService = require("./userService");

var _userHelper = require("./userHelper");

var _libs = require("../../libs");

var _shared = require("../../shared");

var _injector = require("../../injector");

var _mongoose = require("../../libs/mongoose");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var UserController =
/*#__PURE__*/
function () {
  function UserController() {
    _classCallCheck(this, UserController);

    this.userService = _injector.injector.get(_userService.UserService);
    this.userHelper = _injector.injector.get(_userHelper.UserHelper);
    this.sharedService = _injector.injector.get(_shared.SharedService);
    this.config = _injector.injector.get(_config.Config);
    this.libs = _injector.injector.get(_libs.Libs);
    this.mongoose = _injector.injector.get(_mongoose.Mongoose);
    this.bcrypt = bcrypt;
    this.Formidable = Formidable;
    this.UserModel = this.mongoose.get.models.users;
  }
  /*
    user create
    invokes 'next()' to login created user
   */


  _createClass(UserController, [{
    key: "create",
    value: function create() {
      var _this = this;

      // const UserModel = this.mongoose.get.models.users;
      return function (req, res, next) {
        var user = Object.assign({}, req.body);
        user.provider = 'local';

        _this.userHelper.isEmailUnique(user.email, user.provider).then(function () {
          return _this.userHelper.isLoginUnique(user.login);
        }).then(function () {
          return _this.bcrypt.hash(req.body.password, 10);
        }).then(function (hash) {
          user.password = hash;
          user.role = 'guest';
          user.createdAt = Date.now();
          user.commentsReadedTill = Date.now();
          var userModel = new _this.UserModel(user); // create new user

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
      // console.log('this.config', this.config);
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
    } // /*
    //   set cookie to frontend with users credential
    // */
    // setFrontendAuthCookie() {
    //   const { JWTSecret, cookieName } = config.get;
    //   return (req, res, next) => {
    //     let token;
    //     if (req.isAuthenticated()) {
    //       const user = {
    //         _id: req.user._doc._id,
    //         login: req.user._doc.login,
    //         name: req.user._doc.name,
    //         surname: req.user._doc.surname,
    //         avatar: req.user._doc.avatar,
    //         provider: req.user._doc.provider,
    //         role: req.user._doc.role,
    //         commentsReadedTill: req.user._doc.commentsReadedTill,
    //       };
    //       token = this.sharedService.createJWT('', user, null, JWTSecret);
    //     } else {
    //       token = this.sharedService.createJWT('', null, null, JWTSecret);
    //     }
    //     res.cookie(
    //         cookieName,
    //         token,
    //         {
    //         // 'secure': false,
    //           httpOnly: false,
    //           // maxAge: null,
    //           sameSite: 'Strict',
    //         }
    //     );
    //     next();
    //   };
    // }

  }, {
    key: "userEdit",
    value: function userEdit() {
      var _this2 = this;

      return function (req, res, next) {
        var user = {};
        var modificationRequest = {};
        Object.assign(user, req.user._doc);
        Object.assign(modificationRequest, req.body);

        _this2.userHelper.isPasswordMatched(modificationRequest.password, user.password, user).then(function (user) {
          if (modificationRequest.name === 'password') {
            return _this2.bcrypt.hash(modificationRequest.value, 10).then(function (hash) {
              return _this2.sharedService.updateDocument({
                _id: user._id
              }, {
                $set: {
                  password: hash,
                  code: null
                }
              });
            });
          } else {
            return _this2.sharedService.updateDocument({
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
      var _this3 = this;

      return function (req, res, next) {
        var user = {};
        var modificationRequest = {};
        Object.assign(user, req.user._doc);
        Object.assign(modificationRequest, req.body);
        var date = Date.now();

        if (modificationRequest.name === 'commentsReadedTill') {
          _this3.sharedService.updateDocument({
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
      var _this4 = this;

      var ObjectId = this.mongoose.get.Types.ObjectId;
      var cloudinary = this.libs.cloudinary;
      return function (req, res, next) {
        var form = new Formidable.IncomingForm({
          maxFileSize: 8400000
        });
        var that = _this4;
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
      var _this5 = this;

      var mailOptions = this.config.get.mailOptionsEmailVerification;
      return function (req, res, next) {
        var user = Object.assign({}, req.user._doc);
        var sub = {
          _id: user._id,
          email: user.email
        };
        var expire = 60 * 60;
        var secret = _this5.config.get.JWTEmail;

        var token = _this5.sharedService.createJWT('', sub, expire, secret);

        var url = req.protocol + '://' + req.get('host') + '/api/user/email-verification?token=' + token;
        mailOptions.to = user.email;
        mailOptions.text = mailOptions.text + url;
        mailOptions.html = mailOptions.html + url;

        _this5.sharedService.sendMail(mailOptions).then(function () {
          return res.status(200).json('На Вашу пошту відправлено листа');
        })["catch"](function (err) {
          return next(err);
        });
      };
    }
  }, {
    key: "emailVerificationReceive",
    value: function emailVerificationReceive() {
      var _this6 = this;

      // const UserModel = this.mongoose.get.models.users;
      return function (req, res, next) {
        var user = Object.assign({}, req.user._doc);

        _this6.UserModel.findOne({
          _id: user._id
        }).then(function (result) {
          if (!result._id) {
            res.redirect(req.protocol + '://' + req.get('host'));
          } else if (result.email !== user.email) {
            res.redirect(req.protocol + '://' + req.get('host'));
          } else {
            _this6.UserModel.updateOne({
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

      var mailOptions = this.config.get.mailOptionsResetPassword;
      return function (req, res, next) {
        var user;
        var code;
        var email = req.query.email;

        _this7.userHelper.isEmailExists(email, 'local').then(function (userFromDb) {
          code = Math.floor(Math.random() * 100000) + '';
          user = userFromDb;
          return _this7.bcrypt.hash(code, 10);
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
          return _this7.sharedService.sendMail(mailOptions);
        }).then(function (info) {
          var sub = {
            _id: user._id
          }; // token to identify user

          var codeToken = _this7.sharedService.createJWT('JWT ', sub, 300, _this7.config.get.JWTSecretCode);

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

      // const UserModel = this.mongoose.get.models.users;
      return function (req, res, next) {
        var code = req.query.code;
        var user;

        _this8.UserModel.findOne({
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


          return _this8.userHelper.isPasswordMatched(code, userFromDb._doc.code, userFromDb);
        }).then(function (userFromDb) {
          var sub = {
            _id: userFromDb._doc._id
          }; // token to identify user

          var changePasswordToken = _this8.sharedService.createJWT('JWT ', sub, 300, _this8.config.get.JWTSecretChangePassword);

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

        _this9.bcrypt.hash(password, 10).then(function (hash) {
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