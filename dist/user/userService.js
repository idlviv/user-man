"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserService = void 0;

var _errors = require("../errors");

var _config = require("../config");

var _shared = require("../shared");

var _injector = require("../injector");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var UserService =
/*#__PURE__*/
function () {
  function UserService() {
    _classCallCheck(this, UserService);

    this.sharedService = _injector.injector.get(_shared.SharedService);
    this.config = _injector.injector.get(_config.Config);
  }
  /**
  * update user (password lock options) after wrong password input
  *
  * @param {UserModel} user
  * @return {Promise<object>}
  */


  _createClass(UserService, [{
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
}(); // export const userService = new UserService;


exports.UserService = UserService;