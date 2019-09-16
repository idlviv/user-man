"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.userService = exports.UserService = void 0;

var _errors = require("../errors");

var _config = require("../config");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var UserService =
/*#__PURE__*/
function () {
  function UserService() {
    _classCallCheck(this, UserService);
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
  }]);

  return UserService;
}();

exports.UserService = UserService;
var userService = new UserService();
exports.userService = userService;