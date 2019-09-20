"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.userService = exports.UserService = void 0;

var _errors = require("../errors");

var _config = require("../config");

var _shared = require("../shared");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var bcrypt = require('bcryptjs');

var UserService =
/*#__PURE__*/
function () {
  function UserService() {
    _classCallCheck(this, UserService);

    this.sharedService = _shared.sharedService;
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


  _createClass(UserService, [{
    key: "isEmailUnique",
    value: function isEmailUnique(email, provider) {
      var UserModel = _config.config.get.UserModel;
      return new Promise(function (resolve, reject) {
        UserModel.find({
          email: email,
          provider: provider
        }).then(function (result) {
          if (!result.length) {
            resolve();
          } else {
            reject(new _errors.ClientError({
              message: 'Цей email вже використовується',
              status: 422,
              code: 'uniqueConflict'
            }));
          }
        })["catch"](function (err) {
          return reject(new _errors.DbError());
        });
      });
    }
    /**
     * check login uniqueness
     *
     * @param {string} login
     * @return {Promise}
     * @memberof UserController
     */

  }, {
    key: "isLoginUnique",
    value: function isLoginUnique(login) {
      var UserModel = _config.config.get.UserModel;
      return new Promise(function (resolve, reject) {
        UserModel.find({
          login: login
        }).then(function (result) {
          if (!result.length) {
            resolve();
          } else {
            reject(new _errors.ClientError({
              message: 'Цей логін вже використовується',
              status: 422,
              code: 'uniqueConflict'
            }));
          }
        })["catch"](function (err) {
          return reject(new _errors.DbError());
        });
      });
    }
    /**
    * check pair: email-provider exists in db
    *
    * @param {string} email
    * @param {string} provider
    * @return {Promise<UserModel>}
    */

  }, {
    key: "isEmailExists",
    value: function isEmailExists(email, provider) {
      var UserModel = _config.config.get.UserModel;
      return new Promise(function (resolve, reject) {
        UserModel.findOne({
          email: email,
          provider: provider
        }).then(function (user) {
          if (user) {
            resolve(user);
          } else {
            reject(new _errors.ClientError({
              message: 'Email не знайдено',
              status: 403,
              code: 'wrongCredentials'
            }));
          }
        })["catch"](function (err) {
          return reject(new _errors.DbError());
        });
      });
    }
    /**
     * check login exists in db
     *
     * @param {string} login
     * @return {Promise<UserModel>}
     */

  }, {
    key: "isLoginExists",
    value: function isLoginExists(login) {
      var UserModel = _config.config.get.UserModel;
      return new Promise(function (resolve, reject) {
        UserModel.findOne({
          login: login
        }).then(function (user) {
          if (user) {
            resolve(user);
          } else {
            reject(new _errors.ClientError({
              message: 'Користувача не знайдено',
              status: 401
            }));
          }
        })["catch"](function (err) {
          return reject(new _errors.DbError());
        });
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

  }, {
    key: "isPasswordMatched",
    value: function isPasswordMatched(passwordCandidate, passwordFromDb, userFromDb) {
      return new Promise(function (resolve, reject) {
        bcrypt.compare(passwordCandidate, passwordFromDb).then(function (passwordMatched) {
          if (passwordMatched) {
            resolve(userFromDb);
          } else {
            reject(new _errors.ClientError({
              message: 'Невірний пароль',
              status: 401,
              code: 'wrongCredentials'
            }));
          }
        })["catch"](function (err) {
          return reject(err);
        });
      });
    }
    /**
    * update user (password lock options) after wrong password input
    *
    * @param {UserModel} user
    * @return {Promise<object>}
    */

  }, {
    key: "updatePasswordResetOptions",
    value: function updatePasswordResetOptions(user) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.sharedService.updateDocument({
          _id: user._doc._id
        }, {
          $inc: {
            'codeTries': 1
          }
        }, {
          upsert: true
        }).then(function (result) {
          return resolve(result);
        })["catch"](function (err) {
          return reject(new _errors.DbError());
        });
      });
    }
    /**
    * check locking after max tries to input wrong password
    *
    * @param {UserModel} userFromDb
    * @return {Promise<UserModel>}
    */

  }, {
    key: "isPasswordLocked",
    value: function isPasswordLocked(userFromDb) {
      return new Promise(function (resolve, reject) {
        if (userFromDb.isPasswordLocked) {
          var estimatedTime = userFromDb.passwordLockUntil - Date.now();
          reject(new _errors.ClientError({
            message: "\u0412\u0445\u0456\u0434 \u0437\u0430\u0431\u043B\u043E\u043A\u043E\u0432\u0430\u043D\u043E, \u0441\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0447\u0435\u0440\u0435\u0437 \n        ".concat(Math.round(estimatedTime / 1000 / 60), " \u0445\u0432\u0438\u043B\u0438\u043D."),
            status: 403
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

  }, {
    key: "updatePasswordLockOptions",
    value: function updatePasswordLockOptions(user) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var dateNow = Date.now(); // in seconds

        var query;

        if (dateNow - user.passwordLockUntil > 600000) {
          query = {
            $set: {
              passwordTries: 1,
              passwordLockUntil: dateNow
            }
          };
        } else if (user.passwordTries >= user.passwordLockTries) {
          query = {
            $set: {
              passwordTries: 1,
              passwordLockUntil: dateNow + 600000
            }
          };
        } else {
          query = {
            $inc: {
              passwordTries: 1
            },
            $set: {
              passwordLockUntil: dateNow
            }
          };
        }

        _this2.sharedService.updateDocument({
          _id: user._id
        }, query).then(function (result) {
          return resolve(result);
        })["catch"](function (err) {
          return reject(new _errors.DbError());
        });
      });
    }
  }]);

  return UserService;
}();

exports.UserService = UserService;
var userService = new UserService();
exports.userService = userService;